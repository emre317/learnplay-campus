import { useEffect, useState } from 'react';

/** Süreli mini oyunlar için ortak durum: idle → playing → done */
export function useTimedGame(seconds = 60) {
  const [phase, setPhase] = useState('idle');
  const [left, setLeft] = useState(seconds);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (phase !== 'playing') return;
    if (left <= 0) { setPhase('done'); return; }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, left]);

  const start = () => { setScore(0); setStreak(0); setLeft(seconds); setPhase('playing'); };
  const hit = () => { setScore((s) => s + 10 + Math.min(streak, 5) * 2); setStreak((s) => s + 1); };
  const miss = () => setStreak(0);

  return { phase, left, score, streak, start, hit, miss };
}

export const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
export const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
