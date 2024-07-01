import { atom } from 'recoil';

export const gameResult = atom<{ result: Result; by: GameWonBy } | null>({
  key: 'gameResult',
  default: null,
});
