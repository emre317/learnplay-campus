import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlayCircle, FiFileText, FiTarget, FiAward, FiBarChart2, FiUsers, FiArrowRight } from 'react-icons/fi';
import MathBackground from '../components/MathBackground.jsx';
import GradeBadge from '../components/GradeBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const features = [
  { icon: FiPlayCircle, title: 'Kısa Ders Videoları', text: 'Her konu için öz, anlaşılır ve müfredata uygun konu anlatımları.', color: 'text-brand' },
  { icon: FiFileText, title: 'Konu Anlatım Föyleri', text: 'İndirilebilir özetler, çözümlü örnekler ve çalışma kağıtları.', color: 'text-sky-500' },
  { icon: FiTarget, title: 'Alıştırma & Testler', text: 'Kolaydan zora ve yeni nesil sorularla kendini sına.', color: 'text-plus' },
  { icon: FiAward, title: 'Matematik Oyunları', text: 'Puan, rozet ve seviyelerle oynarken öğren.', color: 'text-amber-500' },
  { icon: FiBarChart2, title: 'Gelişim Raporu', text: 'Konu ve kazanım bazında güçlü ve eksik yönlerini gör.', color: 'text-fuchsia-500' },
  { icon: FiUsers, title: 'Veli Paneli', text: 'Çalışma süresi ve başarı takibi veliyle paylaşılır.', color: 'text-rose-500' },
];

const fade = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

export default function Home() {
  const { user } = useAuth();
  return (
    <>
      <section className="relative overflow-hidden">
        <MathBackground />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 lg:grid-cols-2 lg:py-28">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }}>
            <span className="chip border border-brand/30 bg-brand-soft text-brand">∑ Sadece Matematik · 4–8. Sınıf</span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] sm:text-6xl">
              Matematiği <span className="gradient-text">oynayarak</span> öğren, eksiğini <span className="font-mono text-brand">=</span> sıfırla.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted">
              Learn Play Campus; konu anlatım föyleri, kısa ders videoları, alıştırmalar, testler ve matematik oyunlarıyla
              tamamen matematiğe odaklanan bir öğrenme kampüsü.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={user ? '/panel' : '/kayit'} className="btn-primary px-6 py-3 text-base">
                {user ? 'Paneline Git' : 'Ücretsiz Başla'} <FiArrowRight />
              </Link>
              <Link to="/premium" className="btn-ghost px-6 py-3 text-base">Premium’u Keşfet</Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .2, duration: .6 }} className="relative">
            <div className="card relative overflow-hidden p-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted">Günün Sorusu · 6. Sınıf</span>
                <span className="chip bg-plus/15 text-plus">+20 XP</span>
              </div>
              <p className="mt-4 font-display text-2xl font-semibold">
                <span className="font-mono">3/4</span> ile <span className="font-mono">2/3</span>’ün toplamı kaçtır?
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {['5/7', '17/12', '5/12', '1'].map((o, i) => (
                  <div key={o} className={`rounded-xl border px-4 py-3 font-mono font-bold ${i === 1 ? 'border-plus bg-plus/10 text-plus' : 'border-line'}`}>
                    {String.fromCharCode(65 + i)}) {o}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-brand-soft"><div className="h-full w-3/4 rounded-full bg-gradient-to-r from-brand to-fuchsia-500" /></div>
                <span className="font-mono text-xs text-muted">Seviye 7</span>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 hidden rotate-[-6deg] rounded-2xl bg-amber-400 px-4 py-3 font-display font-bold text-amber-950 shadow-xl sm:block">🔥 5 günlük seri!</div>
            <div className="absolute -right-4 -top-6 hidden rotate-6 rounded-2xl bg-brand px-4 py-3 font-mono font-bold text-white shadow-glow sm:block">π ≈ 3.14</div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <motion.h2 {...fade} className="text-center text-3xl font-bold sm:text-4xl">Sınıfını seç, hemen başla</motion.h2>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {[4, 5, 6, 7, 8].map((g, i) => (
            <motion.div key={g} {...fade} transition={{ delay: i * .06 }}>
              <Link to={`/sinif/${g}`} className="card group flex flex-col items-center gap-3 p-6 transition hover:-translate-y-1 hover:shadow-glow">
                <GradeBadge grade={g} size="lg" />
                <span className="font-display font-semibold">{g}. Sınıf</span>
                <span className="text-xs text-muted group-hover:text-brand">Konulara git →</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <motion.div {...fade} className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Öğren → Pekiştir → Ölç → Oyna</h2>
          <p className="mt-3 text-muted">Her konu aynı standart pakette: video, föy, çözümlü örnek, etkinlik, 4 seviyede soru ve değerlendirme testi.</p>
        </motion.div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div key={f.title} {...fade} transition={{ delay: i * .05 }} className="card p-6">
              <f.icon className={`${f.color} text-2xl`} />
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand via-indigo-600 to-fuchsia-600 p-10 text-white sm:p-14">
          <div className="graph-paper absolute inset-0 opacity-40 [--grid:255_255_255]" />
          <div className="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-3xl font-bold">Premium ile sınır yok ∞</h2>
              <p className="mt-2 max-w-xl text-white/80">Tüm ders videoları, tüm matematik oyunları ve sınırsız test erişimi.</p>
            </div>
            <Link to="/premium" className="btn bg-white px-6 py-3 text-base text-indigo-700 hover:bg-white/90">Planları Gör</Link>
          </div>
        </div>
      </section>
    </>
  );
}
