import { Move } from 'chess.js';
import { atom } from 'recoil';

export interface TimingMove extends Move {
  createdAt: Date;
  timeTaken: number;
}

export const isBoardFlippedAtom = atom({
  key: 'isBoardFlippedAtom',
  default: false,
});

export const movesAtom = atom<TimingMove[]>({
  key: 'movesAtom',
  default: [],
});

export const userSelectedMoveIndexAtom = atom<number | null>({
  key: 'userSelectedMoveIndex',
  default: null,
});
