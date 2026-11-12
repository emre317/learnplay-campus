import SpeedMultiply from './SpeedMultiply.jsx';
import NumberCompare from './NumberCompare.jsx';
import FractionMatch from './FractionMatch.jsx';

/** Sunucudaki Game.key → istemci bileşeni. Yeni oyun eklerken buraya kaydet. */
export const GAMES = {
  'speed-multiply': { component: SpeedMultiply, emoji: '⚡' },
  'number-compare': { component: NumberCompare, emoji: '⚖️' },
  'fraction-match': { component: FractionMatch, emoji: '🍕' },
};
