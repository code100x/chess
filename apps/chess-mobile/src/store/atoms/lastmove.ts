import { Square } from 'chess.js';
import { atom } from 'recoil';

export const lastmove = atom<{ from: Square; to: Square } | null>({
  key: 'lastmove',
  default: null,
});
