import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiLock } from 'react-icons/fi';
import api from '../api/client.js';
import Spinner from '../components/Spinner.jsx';
import { GAMES } from '../games/index.js';

export default function Games() {
  const [games, setGames] = useState(null);
  useEffect(() => { api.get('/games').then((r) => setGames(r.data.games)).catch(() => setGames([])); }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold">Matematik Oyunları 🎮</h1>
      <p className="mt-1 text-muted">Oynarken öğren, puan topla, serini büyüt.</p>
      {!games ? <Spinner full /> : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {games.length === 0 && <p className="text-muted">Oyunlar yakında eklenecek.</p>}
          {games.map((g) => (
            <Link key={g.key} to={g.locked ? '/premium' : `/oyunlar/${g.key}`} className="card group relative overflow-hidden p-6 transition hover:-translate-y-1 hover:shadow-glow">
              <div className="graph-paper absolute inset-0 opacity-50" />
              <div className="relative">
                <div className="flex items-start justify-between">
                  <span className="text-4xl">{GAMES[g.key]?.emoji || '🎲'}</span>
                  {g.locked ? <span className="chip bg-amber-400/15 text-amber-500"><FiLock /> Premium</span>
                    : <span className="chip bg-plus/15 text-plus">Oyna</span>}
                </div>
                <h2 className="mt-4 text-lg font-bold">{g.title}</h2>
                <p className="mt-1 text-sm text-muted">{g.description}</p>
                <p className="mt-3 font-mono text-xs text-muted">{g.grades.join(' · ')}. sınıf</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
