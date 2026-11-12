import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api/client.js';

const RESOURCES = [
  { id: 'units', label: 'Üniteler', sample: { grade: 4, order: 1, title: 'Ünite adı', description: '', icon: '∑' } },
  { id: 'topics', label: 'Konular', sample: { unit: '<ünite _id>', grade: 4, order: 1, title: 'Konu adı', slug: '4-konu-adi', summary: '## Başlık\n\nMetin ve $formül$', outcomes: [{ code: 'M.4.1.1.1', text: 'Kazanım' }], examples: [{ question: '', solution: '' }], worksheetUrl: '', video: { url: '', durationSec: 0, isPremium: true }, isPremium: false } },
  { id: 'questions', label: 'Sorular', sample: [{ topic: '<konu _id>', grade: 4, outcome: 'M.4.1.1.1', difficulty: 'kolay', text: 'Soru metni', options: ['A', 'B', 'C', 'D'], correctIndex: 0, solution: 'Çözüm açıklaması', isPremium: false }] },
  { id: 'games', label: 'Oyunlar', sample: { key: 'speed-multiply', title: 'Oyun adı', description: '', grades: [4], isPremium: true } },
];

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [res, setRes] = useState(RESOURCES[0]);
  const [items, setItems] = useState([]);
  const [json, setJson] = useState('');
  const [users, setUsers] = useState(null);

  const load = () => {
    api.get('/admin/stats').then((r) => setStats(r.data)).catch(() => {});
    api.get(`/admin/${res.id}`).then((r) => setItems(r.data.items)).catch((e) => toast.error(errMsg(e)));
  };
  useEffect(() => { load(); setJson(JSON.stringify(res.sample, null, 2)); }, [res]); // eslint-disable-line

  const save = async () => {
    try {
      const { data } = await api.post(`/admin/${res.id}`, JSON.parse(json));
      toast.success(`${data.items.length} kayıt eklendi.`);
      load();
    } catch (e) { toast.error(e instanceof SyntaxError ? 'Geçersiz JSON' : errMsg(e)); }
  };
  const del = async (id) => {
    if (!confirm('Silinsin mi?')) return;
    await api.delete(`/admin/${res.id}/${id}`).catch((e) => toast.error(errMsg(e)));
    load();
  };
  const loadUsers = () => api.get('/admin/users').then((r) => setUsers(r.data.items));
  const setPlan = async (u, plan) => { await api.patch(`/admin/users/${u._id}/plan`, { plan, months: 12 }); loadUsers(); };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold">Yönetim Paneli</h1>
      {stats && (
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[['Kullanıcı', stats.users], ['Premium', stats.premium], ['Konu', stats.topics], ['Soru', stats.questions]].map(([l, v]) => (
            <div key={l} className="card p-5"><p className="font-mono text-3xl font-bold text-brand">{v}</p><p className="text-xs text-muted">{l}</p></div>
          ))}
        </div>
      )}
      <div className="mt-8 flex flex-wrap gap-2">
        {RESOURCES.map((r) => (
          <button key={r.id} onClick={() => { setUsers(null); setRes(r); }} className={`btn ${!users && res.id === r.id ? 'bg-brand text-white' : 'border border-line bg-surface'}`}>{r.label}</button>
        ))}
        <button onClick={loadUsers} className={`btn ${users ? 'bg-brand text-white' : 'border border-line bg-surface'}`}>Kullanıcılar</button>
      </div>

      {users ? (
        <div className="card mt-6 divide-y divide-line">
          {users.map((u) => (
            <div key={u._id} className="flex flex-wrap items-center gap-3 p-4 text-sm">
              <span className="flex-1 font-medium">{u.name} <span className="text-muted">· {u.email} · {u.role}</span></span>
              <span className={`chip ${u.plan === 'premium' ? 'bg-amber-400/15 text-amber-500' : 'border border-line'}`}>{u.plan}</span>
              <button className="btn-ghost py-1.5" onClick={() => setPlan(u, u.plan === 'premium' ? 'free' : 'premium')}>
                {u.plan === 'premium' ? 'Ücretsize al' : 'Premium yap'}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="card p-5">
            <h2 className="font-bold">Yeni {res.label} ekle <span className="text-xs font-normal text-muted">(JSON — tek kayıt ya da dizi ile toplu yükleme)</span></h2>
            <textarea value={json} onChange={(e) => setJson(e.target.value)} spellCheck={false} className="input mt-3 h-80 font-mono text-xs" />
            <button onClick={save} className="btn-primary mt-3">Kaydet</button>
          </div>
          <div className="card max-h-[32rem] divide-y divide-line overflow-y-auto">
            {items.length === 0 && <p className="p-5 text-sm text-muted">Kayıt yok.</p>}
            {items.map((it) => (
              <div key={it._id} className="flex items-start gap-3 p-4 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{it.title || it.text}</p>
                  <p className="truncate font-mono text-xs text-muted">{it._id}{it.grade ? ` · ${it.grade}. sınıf` : ''}{it.difficulty ? ` · ${it.difficulty}` : ''}</p>
                </div>
                <button onClick={() => del(it._id)} className="text-xs font-semibold text-minus">Sil</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
