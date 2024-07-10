import { atom, selector } from 'recoil';
import { storedCookie } from './cookie';

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

export const userAtom = atom<User | null>({
  key: 'user',
  default: selector({
    key: 'user/default',
    get: async ({ get }) => {
      const cookie = get(storedCookie);
      if (!cookie) return null;
      try {
        const res = await fetch(`${apiUrl}/auth/refresh`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            Cookie: cookie,
          },
        });
        if (!res.ok) {
          throw new Error('Unauthorized');
        }
        const data: User = await res.json();
        return data;
      } catch (error) {
        console.log(error);
        return null;
      }
    },
  }),
});
