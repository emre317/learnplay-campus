import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FiSearch } from 'react-icons/fi';
import api, { errMsg } from '../api/client.js';
import Spinner from '../components/Spinner.jsx';

const ROLES = { student: 'Öğrenci', parent: 'Veli', admin: 'Yönetici' };
const ROLE_CLS = { student: 'border border-line text-muted', parent: 'bg-divide/15 text-divide', admin: 'bg-brand-soft text-brand' };
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

export default function UsersTable({ onChanged }) {
  const [users, setUsers] = useState(null);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = () => api.get('/admin/users').then((r) => setUsers(r.data.items)).catch((e) => { setUsers([]); toast.error(errMsg(e)); });
  useEffect(() => { load(); }, []);

  const visible = useMemo(() => {
    const q = search.trim().toLocaleLowerCase('tr-TR');
    return (users || []).filter((u) => (!role || u.role === role) && (!q || `${u.name} ${u.email}`.toLocaleLowerCase('tr-TR').includes(q)));
  }, [users, search, role]);

  const setPlan = async (u, plan) => {
    setBusyId(u._id);
    try {
      await api.patch(`/admin/users/${u._id}/plan`, { plan, months: 12 });
      toast.success(plan === 'premium' ? `${u.name} 12 ay Premium yapıldı.` : `${u.name} ücretsiz plana alındı.`);
      await load();
      onChanged?.();
    } catch (e) { toast.error(errMsg(e)); } finally { setBusyId(null); }
  };

  return (
    <section className="card mt-6">
      <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
        <div className="relative min-w-[12rem] flex-1">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input pl-10" type="search" aria-label="Kullanıcı ara" placeholder="Ad ya da e-posta ile ara…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto" aria-label="Role göre filtrele" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">Tüm roller</option>
          {Object.entries(ROLES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
      </div>
      {users === null ? <div className="p-10"><Spinner /></div> : visible.length === 0 ? (
        <p className="p-12 text-center text-sm text-muted">Eşleşen kullanıcı yok.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                {['Kullanıcı', 'Rol', 'Sınıf', 'Plan', 'Kayıt'].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}
                <th className="px-4 py-3 text-right font-semibold">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map((u) => {
                const premium = u.plan === 'premium';
                return (
                  <tr key={u._id} className="transition hover:bg-bg">
                    <td className="w-full min-w-[14rem] px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand">{u.name?.[0]?.toLocaleUpperCase('tr-TR')}</span>
                        <div className="min-w-0"><p className="font-medium">{u.name}</p><p className="truncate text-xs text-muted">{u.email}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className={`chip whitespace-nowrap ${ROLE_CLS[u.role]}`}>{ROLES[u.role] || u.role}</span></td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted">{u.role === 'student' ? `${u.grade}. sınıf` : '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`chip ${premium ? 'bg-amber-400/15 text-amber-500' : 'border border-line text-muted'}`}>{premium ? 'Premium' : 'Ücretsiz'}</span>
                      {premium && u.premiumUntil && <p className="mt-1 text-xs text-muted">{fmtDate(u.premiumUntil)} tarihine kadar</p>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">{fmtDate(u.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" disabled={busyId === u._id} className="btn-ghost whitespace-nowrap py-1.5 text-xs" onClick={() => setPlan(u, premium ? 'free' : 'premium')}>
                        {premium ? 'Ücretsize al' : '12 ay Premium ver'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {users !== null && <p className="border-t border-line px-4 py-3 text-xs text-muted">{visible.length === users.length ? `${users.length} kullanıcı` : `${visible.length} / ${users.length} kullanıcı gösteriliyor`}</p>}
    </section>
  );
}
