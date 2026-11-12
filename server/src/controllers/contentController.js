import { Unit, Topic, Question, Game } from '../models/index.js';

const canAccess = (user, item) => !item.isPremium || user?.isPremium || user?.role === 'admin';

export async function getGrades(_req, res) {
  const grades = await Promise.all(
    [4, 5, 6, 7, 8].map(async (g) => ({
      grade: g,
      unitCount: await Unit.countDocuments({ grade: g }),
      topicCount: await Topic.countDocuments({ grade: g }),
    }))
  );
  res.json({ grades });
}

export async function getCurriculum(req, res) {
  const grade = Number(req.params.grade);
  const units = await Unit.find({ grade }).sort('order').lean();
  const topics = await Topic.find({ grade })
    .sort('order')
    .select('title slug unit isPremium video.isPremium video.durationSec order')
    .lean();
  res.json({
    grade,
    units: units.map((u) => ({
      ...u,
      topics: topics.filter((t) => String(t.unit) === String(u._id)),
    })),
  });
}

export async function getTopic(req, res) {
  const topic = await Topic.findOne({ slug: req.params.slug }).populate('unit', 'title').lean();
  if (!topic) return res.status(404).json({ message: 'Konu bulunamadı.' });

  const locked = !canAccess(req.user, topic);
  const videoLocked = locked || !canAccess(req.user, topic.video || {});
  const counts = await Question.aggregate([
    { $match: { topic: topic._id } },
    { $group: { _id: '$difficulty', n: { $sum: 1 } } },
  ]);

  res.json({
    topic: {
      ...topic,
      summary: locked ? '' : topic.summary,
      examples: locked ? [] : topic.examples,
      worksheetUrl: locked ? '' : topic.worksheetUrl,
      video: { ...topic.video, url: videoLocked ? '' : topic.video?.url },
      locked,
      videoLocked,
      questionCounts: Object.fromEntries(counts.map((c) => [c._id, c.n])),
    },
  });
}

export async function getGames(req, res) {
  const filter = req.query.grade ? { grades: Number(req.query.grade) } : {};
  const games = await Game.find(filter).lean();
  res.json({ games: games.map((g) => ({ ...g, locked: !canAccess(req.user, g) })) });
}
