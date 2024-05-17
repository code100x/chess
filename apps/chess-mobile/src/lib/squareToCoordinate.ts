import { Square } from 'chess.js';

export const squareToCoordinate = (square: Square) => {
  'worklet';
  const [rank, file] = square.split('');
  const x = rank.charCodeAt(0) - 97;
  const y = 8 - parseInt(file);
  return { x, y };
};
