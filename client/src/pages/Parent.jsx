import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiAlertCircle, FiCheckCircle, FiCircle, FiRefreshCw, FiTrendingDown, FiTrendingUp } from 'react-icons/fi';
import api, { errMsg } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/Spinner.jsx';

const fmtDur = (sec) => {
  const m = Math.round(sec / 60);
  if (m < 60) return `${m} dk`;
  return m % 60 ? `${Math.floor(m / 60)} sa ${m % 60} dk` : `${m / 60} sa`;
};
const parseDay = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const lastStudied = (t) => (t.daysSince === 0 ? 'bugün' : t.daysSince === 1 ? 'dün' : `${t.daysSince} gün önce`);

const STATUS = {
  eksik: { label: 'Eksik', icon: FiAlertCircle, cls: 'bg-minus/15 text-minus' },
  tekrar: { label: 'Tekrar etmeli', icon: FiRefreshCw, cls: 'bg-times/15 text-times' },
  iyi: { label: 'İyi', icon: FiCheckCircle, cls: 'bg-plus/15 text-plus' },
  baslanmadi: { label: 'Başlanmadı', icon: FiCircle, cls: 'border border-line text-muted' },
};

function StatusChip({ status }) {
  const s = STATUS[status] || STATUS.baslanmadi;
  return <span className={`chip whitespace-nowrap ${s.cls}`}><s.icon /> {s.label}</span>;
}

function Stat({ value, label, hint }) {
  return (
    <div className="card p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-mono text-2xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function DailyChart({ daily }) {
  const max = Math.max(...daily.map((d) => d.seconds), 60);
  return (
    <div>
      <div className="flex h-44 items-end gap-[2px] border-b border-line sm:gap-1">
        {daily.map((d, i) => {
          const date = parseDay(d.day);
          const label = date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' });
          return (
            <div key={d.day} tabIndex={0} aria-label={`${label}: ${fmtDur(d.seconds)}, ${d.tests} test`}
              className="group relative flex h-full flex-1 items-end outline-none">
              <div
                className={`w-full rounded-t ${d.seconds ? 'bg-brand' : 'bg-line'} transition group-hover:brightness-110 group-focus:brightness-110`}
                style={{ height: d.seconds ? `${Math.max((d.seconds / max) * 100, 3)}%` : '2px' }}
              />
              <div className={`pointer-events-none absolute bottom-full z-10 mb-1 hidden w-max rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-card group-hover:block group-focus:block ${i < 3 ? 'left-0' : i > daily.length - 4 ? 'right-0' : 'left-1/2 -translate-x-1/2'}`}>
                <p className="font-semibold">{label}</p>
                <p className="mt-0.5 font-mono">{fmtDur(d.seconds)}</p>
                <p className="text-muted">{d.tests} test · {d.questions} soru</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex gap-[2px] sm:gap-1">
        {daily.map((d, i) => {
          const date = parseDay(d.day);
          const today = i === daily.length - 1;
          return (
            <div key={d.day} className={`flex-1 text-center text-[10px] leading-tight ${today ? 'font-bold text-ink' : 'text-muted'}`}>
              <span className="hidden sm:block">{date.toLocaleDateString('tr-TR', { weekday: 'short' })}</span>
              <span className="font-mono">{date.getDate()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function UnitCard({ unit }) {
  return (
    <details className="card group" open={unit.startedCount > 0}>
      <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-2 p-5">
        <div className="min-w-0 flex-1">
          <p className="font-bold">{unit.title}</p>
          <p className="text-xs text-muted">
            {unit.completedCount}/{unit.topicCount} konu tamamlandı
            {unit.avgScore !== null && <> · ortalama %{unit.avgScore}</>}
          </p>
        </div>
        <div className="flex w-full items-center gap-3 sm:w-56">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-brand" style={{ width: `${unit.progress}%` }} />
          </div>
          <span className="w-10 text-right font-mono text-sm font-bold">%{unit.progress}</span>
        </div>
      </summary>
      <ul className="divide-y divide-line border-t border-line">
        {unit.topics.map((t) => (
          <li key={t._id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-sm">
            <Link to={`/konu/${t.slug}`} className="min-w-0 flex-1 font-medium hover:text-brand">{t.title}</Link>
            {t.attempts > 0 && (
              <span className="font-mono text-xs text-muted">
                {t.attempts} test · ort. %{t.avgScore} · en iyi %{t.bestScore} · {lastStudied(t)}
              </span>
            )}
            <StatusChip status={t.status} />
          </li>
        ))}
      </ul>
    </details>
  );
}

function TopicList({ title, icon: Icon, tone, rows, empty }) {
  return (
    <section className="card">
      <h2 className="flex items-center gap-2 border-b border-line p-5 font-bold"><Icon className={tone} /> {title} <span className="font-mono text-sm text-muted">({rows.length})</span></h2>
      {rows.length === 0 ? <p className="p-5 text-sm text-muted">{empty}</p> : (
        <ul className="divide-y divide-line">
          {rows.map((t) => (
            <li key={t._id} className="px-5 py-3 text-sm">
              <Link to={`/konu/${t.slug}`} className="font-medium hover:text-brand">{t.title}</Link>
              <p className="text-xs text-muted">{t.unitTitle} · {t.reason}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Report({ report }) {
  const { child, summary: s, daily, units, weak, review } = report;
  const trend = s.thisWeekAvg !== null && s.lastWeekAvg !== null ? s.thisWeekAvg - s.lastWeekAvg : null;
  return (
    <div className="mt-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold">{child.name}</h2>
        <p className="text-sm text-muted">{child.grade}. Sınıf · Seviye {child.level} · {child.xp} XP · {child.streak} günlük seri</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Bugün çalışma" value={fmtDur(s.todaySeconds)} />
        <Stat label="Günlük ortalama" value={fmtDur(s.avgDailySeconds)} hint={`Son 7 günde ${s.activeDays} gün çalıştı · toplam ${fmtDur(s.weekSeconds)}`} />
        <Stat label="Doğru oranı" value={s.accuracy === null ? '—' : `%${s.accuracy}`} hint={`${s.totalTests} test · ${s.totalQuestions} soru`} />
        <Stat label="Tamamlanan konu" value={`${s.completedTopics}/${s.topicCount}`}
          hint={trend === null ? 'Haftalık karşılaştırma için veri yok' : (
            <span className="inline-flex items-center gap-1">
              {trend >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
              Test ortalaması geçen haftaya göre {trend >= 0 ? '+' : '−'}{Math.abs(trend)} puan
            </span>
          )} />
      </div>

      <section className="card p-5">
        <h2 className="font-bold">Günlük çalışma süresi</h2>
        <p className="mb-4 text-xs text-muted">Son 14 gün · konu, test ve oyun sayfalarında geçen süre</p>
        <DailyChart daily={daily} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <TopicList title="Eksik konular" icon={FiAlertCircle} tone="text-minus" rows={weak} empty="Şu an eksik görünen konu yok." />
        <TopicList title="Tekrar edilmesi gerekenler" icon={FiRefreshCw} tone="text-times" rows={review} empty="Tekrar gerektiren konu yok." />
      </div>

      <section>
        <h2 className="mb-3 text-xl font-bold">Ünite ve konu ilerlemesi</h2>
        {units.length === 0 ? <p className="card p-5 text-sm text-muted">Bu sınıf için henüz içerik eklenmedi.</p> : (
          <div className="space-y-3">{units.map((u) => <UnitCard key={u._id} unit={u} />)}</div>
        )}
      </section>
    </div>
  );
}

export default function Parent() {
  const isAdmin = useAuth().user?.role === 'admin';
  const [code, setCode] = useState('');
  const [children, setChildren] = useState(null);
  const [selected, setSelected] = useState(null);
  const [report, setReport] = useState(null);

  const loadChildren = () =>
    api.get('/progress/children').then((r) => {
      setChildren(r.data.children);
      setSelected((cur) => cur || r.data.children[0]?._id || null);
    }).catch((e) => { setChildren([]); toast.error(errMsg(e)); });

  useEffect(() => { loadChildren(); }, []);

  useEffect(() => {
    if (!selected) return;
    setReport(null);
    api.get(`/progress/children/${selected}`).then((r) => setReport(r.data)).catch((e) => toast.error(errMsg(e)));
  }, [selected]);

  const link = async (e) => {
    e.preventDefault();
    try {
      await api.post('/progress/children', { code });
      setCode('');
      toast.success('Öğrenci eklendi.');
      loadChildren();
    } catch (err) { toast.error(errMsg(err)); }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold">Veli Paneli</h1>
      <p className="text-muted">{isAdmin ? 'Yönetici olarak tüm öğrencilerin çalışma süresini ve akademik gelişimini görebilirsiniz.' : 'Öğrencinizin çalışma süresini ve akademik gelişimini takip edin.'}</p>
      {isAdmin ? (
        <div className="card mt-6 p-5">
          <label className="label" htmlFor="ogrenci-sec">Öğrenci ({children?.length ?? 0})</label>
          <select id="ogrenci-sec" className="input" value={selected || ''} onChange={(e) => setSelected(e.target.value)}>
            {(children || []).map((c) => <option key={c._id} value={c._id}>{c.name} · {c.grade}. Sınıf</option>)}
          </select>
        </div>
      ) : (
      <form onSubmit={link} className="card mt-6 flex flex-wrap items-start gap-3 p-5">
        <div className="flex-1">
          <input className="input font-mono uppercase tracking-widest placeholder:font-sans placeholder:normal-case placeholder:tracking-normal" required maxLength={12} aria-label="Veli kodu" placeholder="Öğrencinizin veli kodu (8 karakter)" value={code} onChange={(e) => setCode(e.target.value)} />
          <p className="mt-2 text-xs text-muted">Kod, öğrencinin kendi panelinde “Veli Kodu” bölümünde yazar. Yalnızca kodunu aldığınız öğrencinin raporunu görebilirsiniz.</p>
        </div>
        <button className="btn-primary">Öğrenci Ekle</button>
      </form>
      )}
      {!isAdmin && children?.length > 1 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {children.map((c) => (
            <button key={c._id} onClick={() => setSelected(c._id)} className={`btn ${selected === c._id ? 'bg-brand text-white' : 'border border-line bg-surface'}`}>{c.name}</button>
          ))}
        </div>
      )}
      {children?.length === 0 && <p className="mt-6 text-sm text-muted">{isAdmin ? 'Henüz kayıtlı öğrenci yok.' : 'Henüz bağlı öğrenci yok. Raporu görmek için öğrencinizin veli kodunu girin.'}</p>}
      {selected && !report && <div className="mt-10"><Spinner /></div>}
      {report && <Report report={report} />}
    </div>
  );
}
