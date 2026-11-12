import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiDownload, FiPlayCircle, FiFileText, FiEdit3, FiCheckSquare } from 'react-icons/fi';
import api from '../api/client.js';
import Spinner from '../components/Spinner.jsx';
import MathText from '../components/MathText.jsx';
import PremiumLock from '../components/PremiumLock.jsx';

const tabs = [
  { id: 'foy', label: 'Konu Föyü', icon: FiFileText },
  { id: 'video', label: 'Ders Videosu', icon: FiPlayCircle },
  { id: 'ornek', label: 'Çözümlü Örnekler', icon: FiEdit3 },
];
const diffLabels = { kolay: 'Kolay', orta: 'Orta', zor: 'Zor', 'yeni-nesil': 'Yeni Nesil' };

export default function Topic() {
  const { slug } = useParams();
  const [topic, setTopic] = useState(null);
  const [tab, setTab] = useState('foy');
  const [error, setError] = useState(false);

  useEffect(() => {
    setTopic(null);
    api.get(`/topics/${slug}`).then((r) => setTopic(r.data.topic)).catch(() => setError(true));
  }, [slug]);

  if (error) return <p className="p-10 text-center text-muted">Konu bulunamadı.</p>;
  if (!topic) return <Spinner full />;
  const total = Object.values(topic.questionCounts || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <nav className="font-mono text-xs text-muted">
        <Link to={`/sinif/${topic.grade}`} className="hover:text-brand">{topic.grade}. Sınıf</Link> / {topic.unit?.title}
      </nav>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{topic.title}</h1>
      {topic.outcomes?.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm text-muted">
          {topic.outcomes.map((o) => <li key={o.code}><span className="font-mono text-brand">{o.code}</span> {o.text}</li>)}
        </ul>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex gap-1 overflow-x-auto rounded-xl border border-line bg-surface p-1">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition ${tab === t.id ? 'bg-brand text-white' : 'text-muted hover:text-ink'}`}>
                <t.icon /> {t.label}
              </button>
            ))}
          </div>

          <div className="card mt-4 p-6">
            {topic.locked ? <PremiumLock /> : tab === 'foy' ? (
              <>
                {topic.summary ? <MathText>{topic.summary}</MathText> : <p className="text-muted">Konu özeti yakında eklenecek.</p>}
                {topic.worksheetUrl && (
                  <a href={topic.worksheetUrl} target="_blank" rel="noreferrer" className="btn-ghost mt-6"><FiDownload /> Föyü indir (PDF)</a>
                )}
              </>
            ) : tab === 'video' ? (
              topic.videoLocked ? <PremiumLock title="Bu ders videosu Premium üyelere özel" /> : topic.video?.url ? (
                <div className="aspect-video overflow-hidden rounded-xl bg-black">
                  {/\.(mp4|webm)$/i.test(topic.video.url)
                    ? <video src={topic.video.url} controls className="h-full w-full" />
                    : <iframe src={topic.video.url} title={topic.title} allowFullScreen className="h-full w-full" />}
                </div>
              ) : <p className="text-muted">Ders videosu yakında eklenecek.</p>
            ) : topic.examples?.length ? (
              <div className="space-y-4">
                {topic.examples.map((ex, i) => (
                  <details key={i} className="rounded-xl border border-line p-4">
                    <summary className="cursor-pointer font-medium"><span className="mr-2 font-mono text-brand">Örnek {i + 1}</span><MathText inline className="inline-block">{ex.question}</MathText></summary>
                    <div className="mt-3 border-t border-line pt-3"><MathText>{ex.solution}</MathText></div>
                  </details>
                ))}
              </div>
            ) : <p className="text-muted">Çözümlü örnekler yakında eklenecek.</p>}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <h2 className="font-bold">Kendini test et</h2>
            <p className="mt-1 text-sm text-muted">{total} soru · 4 zorluk seviyesi</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(diffLabels).map(([k, l]) => (
                <span key={k} className="chip border border-line">{l} <b className="font-mono">{topic.questionCounts?.[k] || 0}</b></span>
              ))}
            </div>
            <div className="mt-5 grid gap-2">
              <Link to={`/konu/${slug}/alistirma`} className="btn-ghost"><FiEdit3 /> Alıştırma (süresiz)</Link>
              <Link to={`/konu/${slug}/test`} className="btn-primary"><FiCheckSquare /> Konu Testi (süreli)</Link>
            </div>
          </div>
          <Link to="/oyunlar" className="card block bg-gradient-to-br from-amber-400/15 to-fuchsia-500/10 p-5 transition hover:shadow-glow">
            <p className="text-2xl">🎮</p>
            <h3 className="mt-1 font-bold">Matematik Oyunları</h3>
            <p className="text-sm text-muted">Öğrendiklerini oyunla pekiştir.</p>
          </Link>
        </aside>
      </div>
    </div>
  );
}
