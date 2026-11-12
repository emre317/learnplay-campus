import { useEffect, useState } from 'react';
import GameShell from './GameShell.jsx';
import { useTimedGame, rand, shuffle } from './useTimedGame.js';

function make() {
  const den = rand(2, 8);
  const num = rand(1, den - 1);
  const opts = new Set([`${num}/${den}`]);
  while (opts.size < 4) {
    const d = rand(2, 8);
    const n = rand(1, d - 1);
    if (n * den !== num * d) opts.add(`${n}/${d}`); // denk kesirleri ele
  }
  return { num, den, answer: `${num}/${den}`, options: shuffle([...opts]) };
}

function Bar({ num, den }) {
  return (
    <div className="mx-auto flex h-16 max-w-md overflow-hidden rounded-xl border-2 border-ink/70">
      {Array.from({ length: den }).map((_, i) => (
        <div key={i} className={`flex-1 border-r-2 border-ink/70 last:border-r-0 ${i < num ? 'bg-brand' : 'bg-surface'}`} />
      ))}
    </div>
  );
}

export default function FractionMatch() {
  const game = useTimedGame(60);
  const [q, setQ] = useState(make);
  useEffect(() => { if (game.phase === 'playing') setQ(make()); }, [game.phase]);

  const pick = (o) => { (o === q.answer ? game.hit : game.miss)(); setQ(make()); };

  return (
    <GameShell title="Kesir Eşleştir" game={game} hint="Boyalı kısım hangi kesri gösteriyor?">
      <div className="w-full">
        <Bar num={q.num} den={q.den} />
        <div className="mx-auto mt-8 grid max-w-sm grid-cols-2 gap-3">
          {q.options.map((o) => (
            <button key={o} onClick={() => pick(o)} className="btn-ghost py-4 font-mono text-2xl">{o}</button>
          ))}
        </div>
      </div>
    </GameShell>
  );
}
