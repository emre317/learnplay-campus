import { useEffect, useState } from 'react';
import GameShell from './GameShell.jsx';
import { useTimedGame, rand } from './useTimedGame.js';

function make() {
  const a = rand(100, 99999);
  const b = Math.random() < 0.15 ? a : a + rand(-900, 900);
  return { a, b: Math.max(1, b) };
}
const fmt = (n) => n.toLocaleString('tr-TR');

export default function NumberCompare() {
  const game = useTimedGame(45);
  const [q, setQ] = useState(make);
  useEffect(() => { if (game.phase === 'playing') setQ(make()); }, [game.phase]);

  const pick = (sym) => {
    const right = q.a > q.b ? '>' : q.a < q.b ? '<' : '=';
    (sym === right ? game.hit : game.miss)();
    setQ(make());
  };

  return (
    <GameShell title="Büyük mü Küçük mü?" game={game} hint="İki sayı arasına doğru işareti koy.">
      <div className="w-full text-center">
        <p className="flex items-center justify-center gap-4 font-mono text-3xl font-bold sm:text-5xl">
          <span>{fmt(q.a)}</span><span className="rounded-xl border-2 border-dashed border-brand px-3 text-brand">?</span><span>{fmt(q.b)}</span>
        </p>
        <div className="mt-8 flex justify-center gap-3">
          {['<', '=', '>'].map((s) => (
            <button key={s} onClick={() => pick(s)} className="btn-ghost h-16 w-16 font-mono text-3xl">{s}</button>
          ))}
        </div>
      </div>
    </GameShell>
  );
}
