import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FiEdit2, FiLock, FiPlus, FiSearch, FiTrash2, FiUpload } from 'react-icons/fi';
import api, { errMsg } from '../api/client.js';
import MathText from '../components/MathText.jsx';
import Spinner from '../components/Spinner.jsx';
import { GAMES } from '../games/index.js';
import { ConfirmDialog, Modal } from './Overlay.jsx';
import ResourceForm from './ResourceForm.jsx';
import { GRADES, difficultyLabel } from './schemas.js';

const DIFF_CLS = { kolay: 'bg-plus/15 text-plus', orta: 'bg-times/15 text-times', zor: 'bg-minus/15 text-minus', 'yeni-nesil': 'bg-brand-soft text-brand' };
const Premium = ({ on }) => (on
  ? <span className="chip bg-amber-400/15 text-amber-500"><FiLock /> Premium</span>
  : <span className="chip border border-line text-muted">Ücretsiz</span>);
const Grade = ({ g }) => <span className="whitespace-nowrap font-mono text-xs">{g}. sınıf</span>;

/** Her içerik türünün tablo sütunları. */
function columnsFor(id, lookups) {
  const unitTitle = (u) => lookups.units.find((x) => x._id === u)?.title;
  const topicTitle = (t) => lookups.topics.find((x) => x._id === t)?.title;
  const missing = <span className="text-minus">Silinmiş</span>;
  switch (id) {
    case 'units':
      return [
        { head: 'Ünite', main: true, cell: (it) => (
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-soft font-mono text-sm font-bold text-brand">{it.icon}</span>
            <div className="min-w-0"><p className="font-medium">{it.title}</p>{it.description && <p className="truncate text-xs text-muted">{it.description}</p>}</div>
          </div>
        ) },
        { head: 'Sınıf', cell: (it) => <Grade g={it.grade} /> },
        { head: 'Sıra', cell: (it) => <span className="font-mono text-xs">{it.order}</span> },
        { head: 'Konu', cell: (it) => <span className="font-mono text-xs">{lookups.topics.filter((t) => t.unit === it._id).length}</span> },
      ];
    case 'topics':
      return [
        { head: 'Konu', main: true, cell: (it) => <div className="min-w-0"><p className="font-medium">{it.title}</p><p className="truncate font-mono text-xs text-muted">/konu/{it.slug}</p></div> },
        { head: 'Ünite', cell: (it) => unitTitle(it.unit) || missing },
        { head: 'Sınıf', cell: (it) => <Grade g={it.grade} /> },
        { head: 'Sıra', cell: (it) => <span className="font-mono text-xs">{it.order}</span> },
        { head: 'Erişim', cell: (it) => <Premium on={it.isPremium} /> },
      ];
    case 'questions':
      return [
        { head: 'Soru', main: true, cell: (it) => <MathText inline className="line-clamp-2 font-medium">{it.text}</MathText> },
        { head: 'Konu', cell: (it) => topicTitle(it.topic) || missing },
        { head: 'Sınıf', cell: (it) => <Grade g={it.grade} /> },
        { head: 'Zorluk', cell: (it) => <span className={`chip whitespace-nowrap ${DIFF_CLS[it.difficulty] || ''}`}>{difficultyLabel(it.difficulty)}</span> },
        { head: 'Erişim', cell: (it) => <Premium on={it.isPremium} /> },
      ];
    default:
      return [
        { head: 'Oyun', main: true, cell: (it) => (
          <div className="flex items-center gap-3">
            <span className="text-xl">{GAMES[it.key]?.emoji || '🎮'}</span>
            <div className="min-w-0"><p className="font-medium">{it.title}</p><p className="truncate font-mono text-xs text-muted">{it.key}</p></div>
          </div>
        ) },
        { head: 'Sınıflar', cell: (it) => <span className="font-mono text-xs">{(it.grades || []).join(', ')}</span> },
        { head: 'Erişim', cell: (it) => <Premium on={it.isPremium} /> },
      ];
  }
}

function BulkImport({ schema, onClose, onSaved }) {
  const [json, setJson] = useState(() => JSON.stringify(schema.sample, null, 2));
  const [busy, setBusy] = useState(false);
  const save = async () => {
    let body;
    try { body = JSON.parse(json); } catch { toast.error('JSON biçimi geçersiz.'); return; }
    setBusy(true);
    try {
      const { data } = await api.post(`/admin/${schema.id}`, body);
      toast.success(`${data.items.length} kayıt eklendi.`);
      onSaved();
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  return (
    <Modal wide title={`${schema.label}: toplu yükleme`} onClose={onClose}
      footer={<><button type="button" className="btn-ghost" onClick={onClose}>Vazgeç</button><button type="button" disabled={busy} className="btn-primary" onClick={save}>{busy ? 'Yükleniyor…' : 'Yükle'}</button></>}>
      <p className="text-sm text-muted">Tek bir kayıt ya da kayıt dizisi içeren JSON yapıştırın. Aşağıdaki şablon beklenen alanları gösterir.</p>
      <textarea value={json} onChange={(e) => setJson(e.target.value)} spellCheck={false} aria-label="JSON" className="input mt-3 h-80 font-mono text-xs" />
    </Modal>
  );
}

export default function ResourceManager({ schema, onChanged }) {
  const [items, setItems] = useState(null);
  const [lookups, setLookups] = useState({ units: [], topics: [] });
  const [search, setSearch] = useState('');
  const [grade, setGrade] = useState('');
  const [topic, setTopic] = useState('');
  const [editing, setEditing] = useState(undefined); // undefined: kapalı, null: yeni kayıt, obje: düzenleme
  const [bulk, setBulk] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [own, units, topics] = await Promise.all([
        api.get(`/admin/${schema.id}`),
        api.get('/admin/units'),
        api.get('/admin/topics'),
      ]);
      setItems(own.data.items);
      setLookups({ units: units.data.items, topics: topics.data.items });
    } catch (e) { setItems([]); toast.error(errMsg(e)); }
  }, [schema.id]);

  useEffect(() => { setItems(null); setSearch(''); setGrade(''); setTopic(''); load(); }, [load]);

  const columns = useMemo(() => columnsFor(schema.id, lookups), [schema.id, lookups]);
  const visible = useMemo(() => {
    const q = search.trim().toLocaleLowerCase('tr-TR');
    return (items || [])
      .filter((it) => !grade || it.grade === Number(grade) || it.grades?.includes(Number(grade)))
      .filter((it) => !topic || it.topic === topic)
      .filter((it) => !q || [it.title, it.text, it.slug, it.key, it.outcome].some((v) => v?.toLocaleLowerCase('tr-TR').includes(q)))
      .sort((a, b) => (schema.id === 'units' || schema.id === 'topics' ? a.grade - b.grade || a.order - b.order : 0));
  }, [items, search, grade, topic, schema.id]);

  const saved = () => { setEditing(undefined); setBulk(false); load(); onChanged?.(); };

  const askDelete = async (it) => {
    let extra = null;
    if (schema.id === 'topics') {
      const n = await api.get('/admin/questions', { params: { topic: it._id } }).then((r) => r.data.items.length).catch(() => 0);
      if (n) extra = <p>Bu konuya bağlı <b className="text-ink">{n} soru</b> da silinecek.</p>;
    }
    setDeleting({ item: it, extra });
  };
  const confirmDelete = async () => {
    setBusy(true);
    try {
      await api.delete(`/admin/${schema.id}/${deleting.item._id}`);
      toast.success(`${schema.singular} silindi.`);
      setDeleting(null);
      load();
      onChanged?.();
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  const lower = schema.singular.toLocaleLowerCase('tr-TR');
  const filtered = Boolean(search.trim() || grade || topic);

  return (
    <section className="card mt-6">
      <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
        <div className="relative min-w-[12rem] flex-1">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input pl-10" type="search" aria-label="Ara" placeholder={`${schema.label} içinde ara…`} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto" aria-label="Sınıfa göre filtrele" value={grade} onChange={(e) => { setGrade(e.target.value); setTopic(''); }}>
          <option value="">Tüm sınıflar</option>
          {GRADES.map((g) => <option key={g} value={g}>{g}. Sınıf</option>)}
        </select>
        {schema.id === 'questions' && (
          <select className="input w-auto max-w-[14rem]" aria-label="Konuya göre filtrele" value={topic} onChange={(e) => setTopic(e.target.value)}>
            <option value="">Tüm konular</option>
            {lookups.topics.filter((t) => !grade || t.grade === Number(grade)).map((t) => <option key={t._id} value={t._id}>{t.title}</option>)}
          </select>
        )}
        <button type="button" className="btn-ghost" onClick={() => setBulk(true)}><FiUpload /> Toplu yükle</button>
        <button type="button" className="btn-primary" onClick={() => setEditing(null)}><FiPlus /> Yeni {lower}</button>
      </div>

      {items === null ? <div className="p-10"><Spinner /></div> : visible.length === 0 ? (
        <div className="p-12 text-center">
          <p className="font-semibold">{filtered ? 'Aramanızla eşleşen kayıt yok' : `Henüz ${lower} eklenmedi`}</p>
          <p className="mt-1 text-sm text-muted">{filtered ? 'Filtreleri değiştirmeyi deneyin.' : `İlk kaydı “Yeni ${lower}” düğmesiyle ekleyin.`}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                {columns.map((c) => <th key={c.head} className="px-4 py-3 font-semibold">{c.head}</th>)}
                <th className="px-4 py-3 text-right font-semibold">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map((it) => (
                <tr key={it._id} className="transition hover:bg-bg">
                  {columns.map((c) => <td key={c.head} className={`px-4 py-3 align-middle ${c.main ? 'w-full min-w-[14rem] max-w-0' : 'whitespace-nowrap text-muted'}`}>{c.cell(it)}</td>)}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button type="button" aria-label={`Düzenle: ${it.title || it.text}`} title="Düzenle" onClick={() => setEditing(it)} className="rounded-lg p-2 text-muted hover:bg-brand-soft hover:text-brand"><FiEdit2 /></button>
                      <button type="button" aria-label={`Sil: ${it.title || it.text}`} title="Sil" onClick={() => askDelete(it)} className="rounded-lg p-2 text-muted hover:bg-minus/10 hover:text-minus"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {items !== null && (
        <p className="border-t border-line px-4 py-3 text-xs text-muted">
          {filtered ? `${visible.length} / ${items.length} kayıt gösteriliyor` : `${items.length} kayıt`}
        </p>
      )}

      {editing !== undefined && <ResourceForm key={editing?._id || 'new'} schema={schema} item={editing} lookups={lookups} onClose={() => setEditing(undefined)} onSaved={saved} />}
      {bulk && <BulkImport schema={schema} onClose={() => setBulk(false)} onSaved={saved} />}
      {deleting && (
        <ConfirmDialog title={`${schema.singular} silinsin mi?`} busy={busy} onConfirm={confirmDelete} onClose={() => setDeleting(null)}
          message={<><p><b className="text-ink">{deleting.item.title || deleting.item.text}</b> kalıcı olarak silinecek. Bu işlem geri alınamaz.</p>{deleting.extra}</>} />
      )}
    </section>
  );
}
