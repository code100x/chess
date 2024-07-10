import { atom } from 'recoil';

export const gameStatus = atom<GameStatus>({
  key: 'gameStatus',
  default: 'idle',
});
