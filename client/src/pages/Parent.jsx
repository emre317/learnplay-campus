import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { TopicTable } from './Progress.jsx';

export default function Parent() {
  const { user, setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [selected, setSelected] = useState(null);
  const [report, setReport] = useState(null);
  const children = (user.children || []).map((c) => (typeof c === 'string' ? { _id: c, name: 'Öğrenci' } : c));

  useEffect(() => {
    if (!selected) return;
    setReport(null);
    api.get(`/progress/children/${selected}`).then((r) => setReport(r.data)).catch((e) => toast.error(errMsg(e)));
  }, [selected]);

  const link = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/progress/children', { email });
      setUser(data.user);
      setEmail('');
      toast.success('Öğrenci eklendi.');
    } catch (err) { toast.error(errMsg(err)); }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold">Veli Paneli</h1>
      <p className="text-muted">Öğrencinizin çalışma süresini ve gelişimini takip edin.</p>
      <form onSubmit={link} className="card mt-6 flex flex-wrap gap-3 p-5">
        <input className="input flex-1" type="email" required placeholder="Öğrencinin kayıtlı e-postası" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="btn-primary">Öğrenci Ekle</button>
      </form>
      <div className="mt-6 flex flex-wrap gap-2">
        {children.map((c) => (
          <button key={c._id} onClick={() => setSelected(c._id)} className={`btn ${selected === c._id ? 'bg-brand text-white' : 'border border-line bg-surface'}`}>{c.name}</button>
        ))}
      </div>
      {report && (
        <div className="card mt-6">
          <div className="grid grid-cols-3 gap-4 border-b border-line p-5 text-center font-mono">
            <div><p className="text-2xl font-bold text-brand">{report.child.xp}</p><p className="text-xs text-muted">XP</p></div>
            <div><p className="text-2xl font-bold">{report.child.streak}🔥</p><p className="text-xs text-muted">Seri</p></div>
            <div><p className="text-2xl font-bold">{Math.round(report.totalTime / 60)} dk</p><p className="text-xs text-muted">Çalışma</p></div>
          </div>
          <TopicTable rows={report.byTopic} />
        </div>
      )}
    </div>
  );
}
