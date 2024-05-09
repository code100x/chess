import { selector } from 'recoil';
import { storedCookie } from '../atoms/cookie';

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

export const authentication = selector({
  key: 'authtentication',
  get: async ({ get }) => {
    // const cookie = get(storedCookie);
    return await authStatus('hahah');
    // return cookie;
  },
});

async function authStatus(cookie: string | null) {
  if (!cookie) {
    return null;
  }
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
    const data: ApiResponse = await res.json();
    return data;
  } catch (error) {
    return null;
  }
}
