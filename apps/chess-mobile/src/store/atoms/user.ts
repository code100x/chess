import { atom } from 'recoil';

interface User {
  token: string;
  id: string;
  name: string;
}

export const userAtom = atom<User | null>({
  key: 'user',
  default: null,
});
