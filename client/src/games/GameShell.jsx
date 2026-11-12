import { Link } from 'react-router-dom';

export default function GameShell({ title, game, children, hint }) {
  const { phase, left, score, streak, start } = game;
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{title}</h1>
        <Link to="/oyunlar" className="text-sm text-muted hover:text-brand">← Oyunlar</Link>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-center font-mono">
        <div className="card p-3"><p className="text-xs text-muted">SÜRE</p><p className={`text-2xl font-bold ${left <= 10 ? 'text-minus' : ''}`}>{left}</p></div>
        <div className="card p-3"><p className="text-xs text-muted">PUAN</p><p className="text-2xl font-bold text-brand">{score}</p></div>
        <div className="card p-3"><p className="text-xs text-muted">SERİ</p><p className="text-2xl font-bold text-amber-500">{streak}🔥</p></div>
      </div>
      <div className="card graph-paper mt-4 grid min-h-[340px] place-items-center p-6">
        {phase === 'playing' ? children : (
          <div className="text-center">
            {phase === 'done' && <p className="mb-2 font-mono text-5xl font-bold text-brand">{score}</p>}
            <p className="text-muted">{phase === 'done' ? 'Süre doldu! Bir daha dene.' : hint}</p>
            <button onClick={start} className="btn-primary mt-5 px-8 py-3 text-base">{phase === 'done' ? 'Tekrar Oyna' : 'Başla'}</button>
          </div>
        )}
      </div>
    </div>
  );
}
