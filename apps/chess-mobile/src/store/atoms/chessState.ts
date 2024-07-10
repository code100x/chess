import { Chess } from 'chess.js';
import { atom, selector } from 'recoil';

export const chessState = atom<Chess>({
  key: 'chessState',
  default: new Chess(),
});

export const boardState = selector({
  key: 'boardState',
  get: ({ get }) => {
    const chess = get(chessState);
    return chess.board();
  },
});
