import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client.js';
import Spinner from '../components/Spinner.jsx';
import PremiumLock from '../components/PremiumLock.jsx';
import NotFound from './NotFound.jsx';
import { GAMES } from '../games/index.js';

export default function GamePlay() {
  const { key } = useParams();
  const [game, setGame] = useState(undefined);
  useEffect(() => {
    api.get('/games').then((r) => setGame(r.data.games.find((g) => g.key === key) || null)).catch(() => setGame(null));
  }, [key]);

  if (game === undefined) return <Spinner full />;
  const Comp = GAMES[key]?.component;
  if (!game || !Comp) return <NotFound />;
  if (game.locked) return <div className="mx-auto max-w-xl px-4 py-16"><PremiumLock title={`${game.title} Premium üyelere özel`} /></div>;
  return <Comp />;
}
