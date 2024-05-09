import { atom, selector } from 'recoil';

// How do you put this in .env? @hkirat
export const BACKEND_URL = 'http://localhost:3000';
export interface User {
  token: string;
  id: string;
  name: string;
}

export interface UserInfo {
  email: string;
  username: string;
  rating: number;
}

export const userAtom = atom<User>({
  key: 'user',
  default: selector({
    key: 'user/default',
    get: async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          return data;
        }
      } catch (e) {
        console.error(e);
      }

      return null;
    },
  }),
});

export const userInfoAtom = atom<UserInfo>({
  key: 'userInfo',
  default: selector({
    key: 'userInfo/default',
    get: async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/auth/userInfo`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          return data;
        }
      } catch (e) {
        console.error(e);
      }

      return null;
    },
  }),
});
