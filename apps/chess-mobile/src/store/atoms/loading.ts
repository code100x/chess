import { atom } from 'recoil';

export const loadingAtom = atom<boolean>({
  key: 'loading',
  default: true,
});
