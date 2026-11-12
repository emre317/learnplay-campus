import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiClock, FiCheck, FiX, FiMinus } from 'react-icons/fi';
import api, { errMsg } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/Spinner.jsx';
import MathText from '../components/MathText.jsx';
import PremiumLock from '../components/PremiumLock.jsx';
import useStudyTimer from '../hooks/useStudyTimer.js';

const SECONDS_PER_QUESTION = 90;
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function Quiz() {
  const { slug, mode } = useParams();
  const timed = mode === 'test';
  const { setUser } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [blocked, setBlocked] = useState(false);
  const [answers, setAnswers] = useState({});
  const [idx, setIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const submitted = useRef(false);
  useStudyTimer(!result);

  useEffect(() => {
    api.get(`/topics/${slug}/quiz`, { params: { size: timed ? 10 : 20 } })
      .then((r) => setQuiz(r.data))
      .catch((e) => (e.response?.status === 402 ? setBlocked(true) : toast.error(errMsg(e))));
  }, [slug, timed]);

  const limit = useMemo(() => (quiz ? quiz.questions.length * SECONDS_PER_QUESTION : 0), [quiz]);

  useEffect(() => {
    if (!quiz || result) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [quiz, result]);

  const submit = async () => {
    if (submitted.current) return;
    submitted.current = true;
    setBusy(true);
    try {
      const { data } = await api.post('/quiz/submit', {
        topicId: quiz.topic._id,
        mode: timed ? 'test' : 'alistirma',
        durationSec: elapsed,
        answers: quiz.questions.map((q) => ({ question: q._id, selected: answers[q._id] ?? null })),
      });
      setResult(data);
      setUser(data.user);
      data.newBadges?.forEach((b) => toast.success(`Yeni rozet: ${b} 🏅`));
    } catch (e) {
      submitted.current = false;
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (timed && quiz && !result && limit > 0 && elapsed >= limit) submit();
  }); // süre dolunca otomatik gönder

  if (blocked) return <div className="mx-auto max-w-xl px-4 py-16"><PremiumLock /></div>;
  if (!quiz) return <Spinner full />;
  if (quiz.questions.length === 0) {
    return <div className="p-16 text-center text-muted">Bu konu için henüz soru eklenmedi. <Link className="text-brand" to={`/konu/${slug}`}>Konuya dön</Link></div>;
  }

  if (result) {
    const { attempt, review } = result;
    const rev = new Map(review.map((r) => [r._id, r]));
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="card p-8 text-center">
          <p className="font-mono text-6xl font-bold text-brand">%{attempt.score}</p>
          <p className="mt-2 text-muted">{quiz.topic.title} · {fmt(attempt.durationSec)}</p>
          <div className="mt-5 flex justify-center gap-3">
            <span className="chip bg-plus/15 px-3 py-1 text-plus"><FiCheck /> {attempt.correctCount} doğru</span>
            <span className="chip bg-minus/15 px-3 py-1 text-minus"><FiX /> {attempt.wrongCount} yanlış</span>
            <span className="chip border border-line px-3 py-1"><FiMinus /> {attempt.emptyCount} boş</span>
            <span className="chip bg-amber-400/15 px-3 py-1 text-amber-500">+{attempt.xpEarned} XP</span>
          </div>
        </div>
        <h2 className="mb-3 mt-8 text-xl font-bold">Açıklamalı çözümler</h2>
        <div className="space-y-4">
          {quiz.questions.map((q, i) => {
            const r = rev.get(q._id);
            const sel = answers[q._id];
            return (
              <div key={q._id} className="card p-5">
                <div className="flex gap-2"><span className="font-mono font-bold text-brand">{i + 1}.</span><MathText inline>{q.text}</MathText></div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {q.options.map((o, oi) => (
                    <div key={oi} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${oi === r?.correctIndex ? 'border-plus bg-plus/10' : oi === sel ? 'border-minus bg-minus/10' : 'border-line'}`}>
                      <b className="font-mono">{String.fromCharCode(65 + oi)})</b><MathText inline>{o}</MathText>
                    </div>
                  ))}
                </div>
                {r?.solution && <div className="mt-3 rounded-xl bg-brand-soft/60 p-3 text-sm"><b className="text-brand">Çözüm: </b><MathText inline className="inline-block">{r.solution}</MathText></div>}
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex gap-3">
          <Link to={`/konu/${slug}`} className="btn-ghost flex-1">Konuya dön</Link>
          <button onClick={() => window.location.reload()} className="btn-primary flex-1">Tekrar çöz</button>
        </div>
        {quiz.limited && <div className="mt-6"><PremiumLock compact title="Daha fazla soru için Premium’a geç" /></div>}
      </div>
    );
  }

  const q = quiz.questions[idx];
  const remaining = Math.max(0, limit - elapsed);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase text-muted">{timed ? 'Konu Testi' : 'Alıştırma'}</p>
          <h1 className="text-xl font-bold">{quiz.topic.title}</h1>
        </div>
        <span className={`chip border border-line px-3 py-1.5 font-mono text-sm ${timed && remaining < 60 ? 'text-minus' : ''}`}>
          <FiClock /> {fmt(timed ? remaining : elapsed)}
        </span>
      </div>
      <div className="mt-4 flex gap-1.5">
        {quiz.questions.map((qq, i) => (
          <button key={qq._id} onClick={() => setIdx(i)} aria-label={`Soru ${i + 1}`}
            className={`h-2 flex-1 rounded-full transition ${i === idx ? 'bg-brand' : answers[qq._id] !== undefined ? 'bg-brand/40' : 'bg-line'}`} />
        ))}
      </div>

      <div className="card mt-6 p-6">
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm text-muted">Soru {idx + 1}/{quiz.questions.length}</span>
          <span className="chip bg-brand-soft text-brand">{q.difficulty}</span>
        </div>
        <MathText className="mt-4 text-lg font-medium">{q.text}</MathText>
        {q.image && <img src={q.image} alt="" className="mt-4 max-h-72 rounded-xl" />}
        <div className="mt-5 grid gap-3">
          {q.options.map((o, oi) => {
            const active = answers[q._id] === oi;
            return (
              <button key={oi} onClick={() => setAnswers((a) => { const n = { ...a }; if (active) delete n[q._id]; else n[q._id] = oi; return n; })}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${active ? 'border-brand bg-brand-soft shadow-glow' : 'border-line hover:border-brand/50'}`}>
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg font-mono font-bold ${active ? 'bg-brand text-white' : 'bg-bg'}`}>{String.fromCharCode(65 + oi)}</span>
                <MathText inline>{o}</MathText>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button className="btn-ghost" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>← Önceki</button>
        <div className="flex-1" />
        {idx < quiz.questions.length - 1
          ? <button className="btn-primary" onClick={() => setIdx(idx + 1)}>Sonraki →</button>
          : <button className="btn-primary" disabled={busy} onClick={submit}>{busy ? 'Gönderiliyor…' : 'Testi Bitir'}</button>}
      </div>
    </div>
  );
}
