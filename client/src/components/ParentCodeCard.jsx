import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiCopy, FiRefreshCw } from 'react-icons/fi';
import api, { errMsg } from '../api/client.js';

/** Öğrencinin velisine vereceği bağlama kodu ve hesabına bağlı veliler. */
export default function ParentCodeCard() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api.get('/progress/link-code').then((r) => setData(r.data)).catch(() => {});
  }, []);
  if (!data) return null;

  const copy = () => navigator.clipboard.writeText(data.code).then(() => toast.success('Kod kopyalandı.')).catch(() => {});
  const renew = async () => {
    if (!window.confirm('Kod yenilenirse eski kod geçersiz olur. Devam edilsin mi?')) return;
    try {
      const r = await api.post('/progress/link-code');
      setData(r.data);
      toast.success('Yeni kod oluşturuldu.');
    } catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <div className="card p-5">
      <h2 className="font-bold">Veli Kodu</h2>
      <p className="mt-1 text-sm text-muted">Bu kodu yalnızca velinle paylaş. Kodu giren kişi gelişim raporunu görebilir.</p>
      <div className="mt-3 flex items-center gap-2">
        <span className="flex-1 rounded-xl border border-line bg-bg px-3 py-2 text-center font-mono text-lg font-bold tracking-widest">{data.code}</span>
        <button type="button" onClick={copy} className="btn-ghost px-3" aria-label="Kodu kopyala"><FiCopy /></button>
        <button type="button" onClick={renew} className="btn-ghost px-3" aria-label="Kodu yenile"><FiRefreshCw /></button>
      </div>
      <p className="mt-3 text-xs text-muted">
        {data.parents.length ? `Bağlı veli: ${data.parents.map((p) => p.name).join(', ')}` : 'Henüz bağlı veli yok.'}
      </p>
    </div>
  );
}
