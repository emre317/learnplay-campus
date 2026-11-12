import { useEffect, useState } from 'react';
import { Link, NavLink, useParams } from 'react-router-dom';
import { FiLock, FiPlayCircle, FiChevronRight } from 'react-icons/fi';
import api from '../api/client.js';
import Spinner from '../components/Spinner.jsx';
import GradeBadge from '../components/GradeBadge.jsx';

export default function Grade() {
  const { grade } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    setData(null);
    api.get(`/grades/${grade}`).then((r) => setData(r.data)).catch(() => setData({ units: [] }));
  }, [grade]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-center gap-4">
        <GradeBadge grade={Number(grade)} size="lg" />
        <div>
          <h1 className="text-3xl font-bold">{grade}. Sınıf Matematik</h1>
          <p className="text-muted">Ünite seç, konuyu öğren, kendini test et.</p>
        </div>
      </div>
      <div className="mt-6 flex gap-2 overflow-x-auto">
        {[4, 5, 6, 7, 8].map((g) => (
          <NavLink key={g} to={`/sinif/${g}`} className={({ isActive }) => `rounded-xl border px-4 py-2 font-mono text-sm font-bold ${isActive ? 'border-brand bg-brand text-white' : 'border-line bg-surface text-muted'}`}>
            {g}. Sınıf
          </NavLink>
        ))}
      </div>

      {!data ? <Spinner full /> : data.units.length === 0 ? (
        <div className="card mt-8 p-10 text-center">
          <p className="font-mono text-4xl text-brand">∅</p>
          <p className="mt-3 font-semibold">Bu sınıfın içerikleri hazırlanıyor</p>
          <p className="text-sm text-muted">Çok yakında burada olacak.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {data.units.map((u, ui) => (
            <section key={u._id} className="card overflow-hidden">
              <header className="flex items-center gap-4 border-b border-line bg-brand-soft/50 p-5">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand font-mono font-bold text-white">{u.icon}</span>
                <div>
                  <p className="font-mono text-xs text-muted">ÜNİTE {ui + 1}</p>
                  <h2 className="text-lg font-bold">{u.title}</h2>
                  {u.description && <p className="text-sm text-muted">{u.description}</p>}
                </div>
              </header>
              <ul className="divide-y divide-line">
                {u.topics.map((t, ti) => (
                  <li key={t._id}>
                    <Link to={`/konu/${t.slug}`} className="flex items-center gap-4 px-5 py-4 transition hover:bg-brand-soft/40">
                      <span className="font-mono text-sm text-muted">{ui + 1}.{ti + 1}</span>
                      <span className="flex-1 font-medium">{t.title}</span>
                      {t.video?.durationSec > 0 && <span className="hidden items-center gap-1 text-xs text-muted sm:flex"><FiPlayCircle /> {Math.round(t.video.durationSec / 60)} dk</span>}
                      {t.isPremium ? <span className="chip bg-amber-400/15 text-amber-500"><FiLock /> Premium</span> : <span className="chip bg-plus/15 text-plus">Ücretsiz</span>}
                      <FiChevronRight className="text-muted" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
