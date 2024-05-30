import { atom } from 'recoil';

export const blackTimeConsumed = atom<number>({
  key: 'blackTimeConsumed',
  default: 0,
});

export const whiteTimeConsumed = atom<number>({
  key: 'whiteTimeConsumed',
  default: 0,
});
