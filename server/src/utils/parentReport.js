import { Attempt, StudyDay, Topic, Unit } from '../models/index.js';

const DAY_MS = 86400000;
const CHART_DAYS = 14;
const WEAK_BELOW = 60; // son denemelerin ortalaması bunun altındaysa "eksik"
const GOOD_FROM = 80; // bunun altı "tekrar edilmeli"
const DONE_FROM = 70; // son denemelerin ortalaması bu ve üstüyse konu "tamamlandı"
const STALE_DAYS = 14; // bu kadar gündür çalışılmayan konu tekrar listesine girer

const dayFmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul' });
/** Tarihi Türkiye saatine göre YYYY-MM-DD anahtarına çevirir. */
export const dayKey = (d) => dayFmt.format(d);

const avg = (arr) => (arr.length ? Math.round(arr.reduce((s, n) => s + n, 0) / arr.length) : null);

function topicStats(list, now) {
  // list: eskiden yeniye sıralı denemeler
  const scores = list.map((a) => a.score || 0);
  const last = list[list.length - 1];
  const recentAvg = avg(scores.slice(-3));
  const lastScore = scores[scores.length - 1];
  const prevScore = scores.length > 1 ? scores[scores.length - 2] : null;
  const daysSince = Math.floor((now - new Date(last.createdAt)) / DAY_MS);

  let status = 'iyi';
  let reason = '';
  if (recentAvg < WEAK_BELOW) {
    status = 'eksik';
    reason = `Son denemelerin ortalaması %${recentAvg}`;
  } else if (recentAvg < GOOD_FROM) {
    status = 'tekrar';
    reason = `Ortalama %${recentAvg}, pekiştirme gerekiyor`;
  } else if (prevScore !== null && prevScore - lastScore >= 20) {
    status = 'tekrar';
    reason = `Son testte puan %${prevScore} → %${lastScore} düştü`;
  } else if (daysSince >= STALE_DAYS) {
    status = 'tekrar';
    reason = `${daysSince} gündür tekrar edilmedi`;
  }

  return {
    attempts: list.length,
    avgScore: avg(scores),
    recentAvg,
    bestScore: Math.max(...scores),
    lastScore,
    lastAt: last.createdAt,
    daysSince,
    wrongCount: list.reduce((s, a) => s + (a.wrongCount || 0), 0),
    emptyCount: list.reduce((s, a) => s + (a.emptyCount || 0), 0),
    timeSec: list.reduce((s, a) => s + (a.durationSec || 0), 0),
    completed: recentAvg >= DONE_FROM,
    status,
    reason,
  };
}

/** Veli paneli için öğrencinin akademik gelişim raporu. */
export async function buildParentReport(child) {
  const now = new Date();
  const attempts = await Attempt.find({ user: child._id }).sort('createdAt').select('-answers').lean();

  // --- Günlük çalışma süresi (son 14 gün) ---
  const days = [];
  for (let i = CHART_DAYS - 1; i >= 0; i--) days.push(dayKey(new Date(now.getTime() - i * DAY_MS)));
  const tracked = await StudyDay.find({ user: child._id, day: { $in: days } }).lean();
  const trackedByDay = new Map(tracked.map((d) => [d.day, d.seconds]));
  const quizByDay = new Map();
  for (const a of attempts) {
    const k = dayKey(new Date(a.createdAt));
    const cur = quizByDay.get(k) || { seconds: 0, tests: 0, questions: 0 };
    cur.seconds += a.durationSec || 0;
    cur.tests += 1;
    cur.questions += (a.correctCount || 0) + (a.wrongCount || 0) + (a.emptyCount || 0);
    quizByDay.set(k, cur);
  }
  const daily = days.map((day) => {
    const q = quizByDay.get(day) || { seconds: 0, tests: 0, questions: 0 };
    // Süre takibi başlamadan önceki günlerde yalnızca test süresi bilinir.
    return { day, seconds: Math.max(trackedByDay.get(day) || 0, q.seconds), tests: q.tests, questions: q.questions };
  });
  const week = daily.slice(-7);
  const weekSeconds = week.reduce((s, d) => s + d.seconds, 0);

  // --- Ünite ve konu ilerlemesi ---
  const byTopic = new Map();
  for (const a of attempts) {
    const k = String(a.topic);
    if (!byTopic.has(k)) byTopic.set(k, []);
    byTopic.get(k).push(a);
  }
  const topics = await Topic.find({ $or: [{ grade: child.grade }, { _id: { $in: [...byTopic.keys()] } }] })
    .select('title slug grade order unit')
    .sort('order')
    .lean();
  const unitDocs = await Unit.find({ _id: { $in: topics.map((t) => t.unit) } }).sort('grade order').lean();

  const topicRows = topics.map((t) => {
    const list = byTopic.get(String(t._id));
    const stats = list ? topicStats(list, now) : { attempts: 0, completed: false, status: 'baslanmadi', reason: '' };
    return { _id: t._id, title: t.title, slug: t.slug, unit: String(t.unit), ...stats };
  });

  const units = unitDocs.map((u) => {
    const rows = topicRows.filter((t) => t.unit === String(u._id));
    const started = rows.filter((t) => t.attempts > 0);
    const completed = rows.filter((t) => t.completed).length;
    return {
      _id: u._id,
      title: u.title,
      grade: u.grade,
      icon: u.icon,
      topicCount: rows.length,
      startedCount: started.length,
      completedCount: completed,
      progress: rows.length ? Math.round((completed / rows.length) * 100) : 0,
      avgScore: avg(started.map((t) => t.avgScore)),
      topics: rows,
    };
  });

  const unitTitle = new Map(unitDocs.map((u) => [String(u._id), u.title]));
  const flag = (status) =>
    topicRows
      .filter((t) => t.status === status)
      .sort((a, b) => a.recentAvg - b.recentAvg)
      .map((t) => ({ ...t, unitTitle: unitTitle.get(t.unit) || '' }));

  // --- Genel özet ---
  const correct = attempts.reduce((s, a) => s + (a.correctCount || 0), 0);
  const questions = attempts.reduce((s, a) => s + (a.correctCount || 0) + (a.wrongCount || 0) + (a.emptyCount || 0), 0);
  const scoresBetween = (fromDaysAgo, toDaysAgo) =>
    attempts
      .filter((a) => {
        const age = (now - new Date(a.createdAt)) / DAY_MS;
        return age < fromDaysAgo && age >= toDaysAgo;
      })
      .map((a) => a.score || 0);
  const thisWeekAvg = avg(scoresBetween(7, 0));
  const lastWeekAvg = avg(scoresBetween(14, 7));

  return {
    child: {
      _id: child._id,
      name: child.name,
      grade: child.grade,
      xp: child.xp,
      level: child.level,
      streak: child.streak,
      lastActiveAt: child.lastActiveAt,
    },
    summary: {
      todaySeconds: daily[daily.length - 1].seconds,
      weekSeconds,
      avgDailySeconds: Math.round(weekSeconds / 7),
      activeDays: week.filter((d) => d.seconds > 0).length,
      totalTests: attempts.length,
      totalQuestions: questions,
      accuracy: questions ? Math.round((correct / questions) * 100) : null,
      thisWeekAvg,
      lastWeekAvg,
      topicCount: topicRows.length,
      completedTopics: topicRows.filter((t) => t.completed).length,
    },
    daily,
    units,
    weak: flag('eksik'),
    review: flag('tekrar'),
  };
}
