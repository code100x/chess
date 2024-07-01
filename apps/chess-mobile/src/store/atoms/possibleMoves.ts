import { Square } from 'chess.js';
import { atom } from 'recoil';

export const possibleMoves = atom<Square[]>({
  key: 'possibleMoves',
  default: [],
});
