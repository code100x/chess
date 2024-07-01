import { atom } from 'recoil';

export const squareSize = atom<number>({
  key: 'squareSize',
  default: 0,
});
