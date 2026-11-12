import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiZap, FiTrendingUp, FiAward, FiClock, FiArrowRight } from 'react-icons/fi';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/Spinner.jsx';
import GradeBadge from '../components/GradeBadge.jsx';
import ParentCodeCard from '../components/ParentCodeCard.jsx';

function Stat({ icon: Icon, label, value, color }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <span className={`grid h-12 w-12 place-items-center rounded-2xl ${color}`}><Icon size={20} /></span>
      <div>
        <p className="font-mono text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted">{label}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [curriculum, setCurriculum] = useState(null);

  useEffect(() => {
    api.get('/progress/me').then((r) => setData(r.data)).catch(() => setData({ byTopic: [], recent: [], totalTime: 0, weakTopics: [] }));
    api.get(`/grades/${user.grade}`).then((r) => setCurriculum(r.data)).catch(() => setCurriculum({ units: [] }));
  }, [user.grade]);

  if (!data || !curriculum) return <Spinner full />;

  const xpInLevel = user.xp - 50 * (user.level - 1) ** 2;
  const xpForNext = 50 * user.level ** 2 - 50 * (user.level - 1) ** 2;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="card relative overflow-hidden p-6 sm:p-8">
        <div className="graph-paper absolute inset-0 opacity-60" />
        <div className="relative flex flex-wrap items-center gap-5">
          <GradeBadge grade={user.grade} size="lg" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold sm:text-3xl">Merhaba, {user.name.split(' ')[0]} 👋</h1>
            <p className="text-muted">{user.grade}. sınıf matematik · Seviye <span className="font-mono font-bold text-brand">{user.level}</span></p>
            <div className="mt-3 flex max-w-md items-center gap-3">
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-brand-soft">
                <div className="h-full rounded-full bg-gradient-to-r from-brand to-fuchsia-500" style={{ width: `${Math.min(100, (xpInLevel / xpForNext) * 100)}%` }} />
              </div>
              <span className="font-mono text-xs text-muted">{xpInLevel}/{xpForNext} XP</span>
            </div>
          </div>
          {!user.isPremium && <Link to="/premium" className="btn-primary">Premium’a Geç ∞</Link>}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={FiZap} label="Toplam XP" value={user.xp} color="bg-amber-400/15 text-amber-500" />
        <Stat icon={FiTrendingUp} label="Günlük seri" value={`${user.streak} 🔥`} color="bg-rose-500/15 text-rose-500" />
        <Stat icon={FiAward} label="Rozet" value={user.badges?.length || 0} color="bg-brand-soft text-brand" />
        <Stat icon={FiClock} label="Çalışma süresi" value={`${Math.round(data.totalTime / 60)} dk`} color="bg-plus/15 text-plus" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-bold">Ünitelerin</h2>
            <Link to={`/sinif/${user.grade}`} className="text-sm font-semibold text-brand">Tümü <FiArrowRight className="inline" /></Link>
          </div>
          <div className="space-y-3">
            {curriculum.units.length === 0 && <p className="card p-6 text-sm text-muted">Bu sınıfın içerikleri çok yakında eklenecek.</p>}
            {curriculum.units.map((u) => (
              <div key={u._id} className="card p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft font-mono font-bold text-brand">{u.icon}</span>
                  <div>
                    <h3 className="font-semibold">{u.title}</h3>
                    <p className="text-xs text-muted">{u.topics.length} konu</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {u.topics.map((t) => (
                    <Link key={t._id} to={`/konu/${t.slug}`} className="chip border border-line py-1.5 hover:border-brand hover:text-brand">
                      {t.isPremium && '🔒 '}{t.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          {user.role === 'student' && <ParentCodeCard />}
          <div className="card p-5">
            <h2 className="font-bold">Tekrar etmen gerekenler</h2>
            {data.weakTopics.length === 0 ? (
              <p className="mt-2 text-sm text-muted">Harika! Şu an eksik görünen konu yok.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {data.weakTopics.map((t) => (
                  <li key={t._id}>
                    <Link to={`/konu/${t.topic.slug}`} className="flex items-center justify-between rounded-xl border border-line px-3 py-2 text-sm hover:border-brand">
                      <span>{t.topic.title}</span>
                      <span className="font-mono font-bold text-minus">%{t.avgScore}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="card p-5">
            <h2 className="font-bold">Son çalışmalar</h2>
            {data.recent.length === 0 ? (
              <p className="mt-2 text-sm text-muted">Henüz test çözmedin. İlk konunu seç!</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {data.recent.slice(0, 5).map((a) => (
                  <li key={a._id} className="flex items-center justify-between">
                    <span className="truncate">{a.topic?.title}</span>
                    <span className={`font-mono font-bold ${a.score >= 60 ? 'text-plus' : 'text-minus'}`}>%{a.score}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
