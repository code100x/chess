import { atom, selector } from 'recoil';
import { userAtom } from './user';

export const gameId = atom<string | null>({
  key: 'gameId',
  default: null,
});

export const blackPlayer = atom<{ id: string; name: string } | null>({
  key: 'blackPlayer',
  default: null,
});

export const whitePlayer = atom<{ id: string; name: string } | null>({
  key: 'whitePlayer',
  default: null,
});

export const isFlipped = selector({
  key: 'isFlipped',
  get: ({ get }) => {
    const user = get(userAtom);
    const black = get(blackPlayer);
    if (user && black) {
      console.log('INSIDE SELECTOR isFlipped');
      console.log(user.id === black.id);
      return user.id === black.id;
    } else {
      console.log('NO USER OR BLACK PLAYER');
      return false;
    }
  },
});
