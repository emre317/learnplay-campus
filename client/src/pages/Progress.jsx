import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/Spinner.jsx';

export function TopicTable({ rows }) {
  if (!rows.length) return <p className="p-6 text-sm text-muted">Henüz çözülmüş test yok.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase text-muted">
          <tr><th className="p-4">Konu</th><th className="p-4">Deneme</th><th className="p-4">Ortalama</th><th className="p-4">En iyi</th><th className="p-4 w-40">Başarı</th></tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((t) => (
            <tr key={t._id}>
              <td className="p-4 font-medium"><Link to={`/konu/${t.topic.slug}`} className="hover:text-brand">{t.topic.title}</Link></td>
              <td className="p-4 font-mono">{t.attempts}</td>
              <td className="p-4 font-mono">%{t.avgScore}</td>
              <td className="p-4 font-mono">%{t.bestScore}</td>
              <td className="p-4">
                <div className="h-2 overflow-hidden rounded-full bg-line">
                  <div className={`h-full rounded-full ${t.avgScore >= 80 ? 'bg-plus' : t.avgScore >= 60 ? 'bg-times' : 'bg-minus'}`} style={{ width: `${t.avgScore}%` }} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Progress() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [board, setBoard] = useState([]);
  useEffect(() => {
    api.get('/progress/me').then((r) => setData(r.data)).catch(() => setData({ byTopic: [], badgeCatalog: {} }));
    api.get('/progress/leaderboard').then((r) => setBoard(r.data.users)).catch(() => {});
  }, []);
  if (!data) return <Spinner full />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold">Gelişim Raporum</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="card lg:col-span-2">
          <h2 className="border-b border-line p-5 font-bold">Konu bazında başarı</h2>
          <TopicTable rows={data.byTopic} />
        </section>
        <aside className="space-y-6">
          <div className="card p-5">
            <h2 className="font-bold">Rozetlerim</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {Object.entries(data.badgeCatalog || {}).map(([k, label]) => {
                const has = user.badges?.includes(k);
                return <li key={k} className={`flex items-center gap-2 ${has ? '' : 'opacity-40 grayscale'}`}><span className="text-xl">🏅</span>{label}</li>;
              })}
            </ul>
          </div>
          <div className="card p-5">
            <h2 className="font-bold">{user.grade}. Sınıf Liderlik Tablosu</h2>
            <ol className="mt-3 space-y-2 text-sm">
              {board.map((u, i) => (
                <li key={u._id} className={`flex items-center gap-3 rounded-lg px-2 py-1 ${u._id === user._id ? 'bg-brand-soft' : ''}`}>
                  <span className="w-5 font-mono font-bold text-muted">{i + 1}</span>
                  <span className="flex-1 truncate">{u.name}</span>
                  <span className="font-mono font-bold text-brand">{u.xp}</span>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
