import { useCallback, useEffect, useState } from 'react';
import { FiBookOpen, FiHelpCircle, FiStar, FiUsers } from 'react-icons/fi';
import api from '../api/client.js';
import ResourceManager from '../admin/ResourceManager.jsx';
import UsersTable from '../admin/UsersTable.jsx';
import { RESOURCES } from '../admin/schemas.js';

const TABS = [...RESOURCES.map((r) => ({ id: r.id, label: r.label })), { id: 'users', label: 'Kullanıcılar' }];
const STATS = [
  { key: 'users', label: 'Kullanıcı', icon: FiUsers, cls: 'bg-brand-soft text-brand' },
  { key: 'premium', label: 'Premium üye', icon: FiStar, cls: 'bg-amber-400/15 text-amber-500' },
  { key: 'topics', label: 'Konu', icon: FiBookOpen, cls: 'bg-plus/15 text-plus' },
  { key: 'questions', label: 'Soru', icon: FiHelpCircle, cls: 'bg-divide/15 text-divide' },
];

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState(TABS[0].id);
  const loadStats = useCallback(() => { api.get('/admin/stats').then((r) => setStats(r.data)).catch(() => {}); }, []);
  useEffect(() => { loadStats(); }, [loadStats]);

  const schema = RESOURCES.find((r) => r.id === tab);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold">Yönetim Paneli</h1>
      <p className="text-muted">İçerikleri ve kullanıcıları buradan yönetin.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.key} className="card flex items-center gap-4 p-5">
            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${s.cls}`}><s.icon size={18} /></span>
            <div>
              <p className="font-mono text-2xl font-bold">{stats ? stats[s.key] : '—'}</p>
              <p className="text-xs text-muted">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-1 overflow-x-auto overflow-y-hidden border-b border-line" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
            className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition ${tab === t.id ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-ink'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {schema ? <ResourceManager key={schema.id} schema={schema} onChanged={loadStats} /> : <UsersTable onChanged={loadStats} />}
    </div>
  );
}
