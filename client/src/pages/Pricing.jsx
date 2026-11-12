import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiCheck } from 'react-icons/fi';
import api, { errMsg } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/Spinner.jsx';
import MathBackground from '../components/MathBackground.jsx';

export default function Pricing() {
  const [plans, setPlans] = useState(null);
  const { user } = useAuth();
  const nav = useNavigate();
  useEffect(() => { api.get('/billing/plans').then((r) => setPlans(r.data.plans)).catch(() => setPlans([])); }, []);

  const choose = async (p) => {
    if (!user) return nav('/kayit');
    if (p.id === 'free') return nav('/panel');
    try { await api.post('/billing/checkout', { plan: p.id }); } catch (e) { toast(errMsg(e), { icon: '🛠️' }); }
  };

  return (
    <div className="relative">
      <MathBackground count={12} />
      <div className="relative mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">Öğrenmenin <span className="gradient-text">sınırı yok</span> ∞</h1>
          <p className="mx-auto mt-4 max-w-xl text-muted">Premium ile tüm ders videolarına, matematik oyunlarına ve testlere tam erişim.</p>
        </div>
        {!plans ? <Spinner full /> : (
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {plans.map((p) => (
              <div key={p.id} className={`card relative flex flex-col p-7 ${p.highlight ? 'border-brand shadow-glow lg:-translate-y-3' : ''}`}>
                {p.highlight && <span className="chip absolute -top-3 left-7 bg-brand text-white">En avantajlı</span>}
                <h2 className="text-lg font-bold">{p.name}</h2>
                <p className="mt-3"><span className="font-mono text-4xl font-bold">₺{p.price}</span><span className="text-muted"> / {p.period}</span></p>
                <ul className="mt-6 flex-1 space-y-3 text-sm">
                  {p.features.map((f) => <li key={f} className="flex gap-2"><FiCheck className="mt-0.5 shrink-0 text-plus" /> {f}</li>)}
                </ul>
                <button onClick={() => choose(p)} className={`mt-8 w-full ${p.id === 'free' ? 'btn-ghost' : 'btn-primary'}`}>
                  {p.id === 'free' ? 'Ücretsiz Başla' : 'Premium’a Geç'}
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="mt-8 text-center text-xs text-muted">Fiyatlar örnek amaçlıdır; ödeme altyapısı pilot yayınla birlikte devreye alınacaktır.</p>
      </div>
    </div>
  );
}
