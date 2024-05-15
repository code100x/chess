import { Square } from 'chess.js';

export const toPosition = ({ x, y }: { x: number; y: number }) => {
  'worklet';
  const file = String.fromCharCode(97 + Math.round(x));
  const rank = 8 - Math.round(y);
  return `${file}${rank}` as Square;
};
