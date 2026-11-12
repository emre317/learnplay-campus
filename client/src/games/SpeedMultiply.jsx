import { useEffect, useState } from 'react';
import GameShell from './GameShell.jsx';
import { useTimedGame, rand, shuffle } from './useTimedGame.js';

function make() {
  const a = rand(2, 12);
  const b = rand(2, 12);
  const answer = a * b;
  const opts = new Set([answer]);
  while (opts.size < 4) opts.add(Math.max(1, answer + rand(-12, 12)));
  return { a, b, answer, options: shuffle([...opts]) };
}

export default function SpeedMultiply() {
  const game = useTimedGame(60);
  const [q, setQ] = useState(make);
  useEffect(() => { if (game.phase === 'playing') setQ(make()); }, [game.phase]);

  const pick = (o) => { (o === q.answer ? game.hit : game.miss)(); setQ(make()); };

  return (
    <GameShell title="Çarpım Yarışı" game={game} hint="60 saniyede olabildiğince çok çarpma işlemi çöz!">
      <div className="w-full text-center">
        <p className="font-mono text-6xl font-bold">{q.a} <span className="text-times">×</span> {q.b}</p>
        <div className="mx-auto mt-8 grid max-w-sm grid-cols-2 gap-3">
          {q.options.map((o) => (
            <button key={o} onClick={() => pick(o)} className="btn-ghost py-4 font-mono text-2xl">{o}</button>
          ))}
        </div>
      </div>
    </GameShell>
  );
}
