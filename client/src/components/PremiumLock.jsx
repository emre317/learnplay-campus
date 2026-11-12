import { Link } from 'react-router-dom';
import { FiLock } from 'react-icons/fi';

export default function PremiumLock({ title = 'Bu içerik Premium üyelere özel', compact }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-400/10 via-surface to-fuchsia-500/10 text-center ${compact ? 'p-5' : 'p-10'}`}>
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-amber-400/20 text-amber-500"><FiLock size={22} /></div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted">Tüm videolar, oyunlar ve sınırsız testlerle eksiklerini hızla kapat.</p>
      <Link to="/premium" className="btn-primary mt-4">Premium’a Geç</Link>
    </div>
  );
}
