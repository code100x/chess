import * as SecureStore from 'expo-secure-store';
import { openAuthSessionAsync } from 'expo-web-browser';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { useRecoilState } from 'recoil';
import { loadingAtom } from '~/store/atoms/loading';
import { userAtom } from '~/store/atoms/user';

const secureStorage = (key: string) => {
  async function setStorageItemAsync(value: string | null) {
    if (value == null) {
      await SecureStore.deleteItemAsync(key);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  }
  async function getStorageItemAsync() {
    return await SecureStore.getItemAsync(key);
  }

  return { setStorageItemAsync, getStorageItemAsync };
};

const KEY = 'session';
const apiUrl = process.env.EXPO_PUBLIC_API_URL;

const useAuth = () => {
  const [isLoading, setLoading] = useRecoilState(loadingAtom);
  const [user, setUser] = useRecoilState(userAtom);
  const { setStorageItemAsync, getStorageItemAsync } = secureStorage(KEY);

  const authentication = async () => {
    try {
      const cookie = await getStorageItemAsync();
      if (!cookie) {
        setUser(null);
        return;
      }
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
      const data = await res.json();
      setUser(data);
    } catch (error) {
      console.log(error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('-------------------running---------------------');
    authentication();
  }, []);

  const setCookie = async (cookie: string | null) => {
    setLoading(true);
    try {
      await setStorageItemAsync(cookie);
    } catch (error) {
      console.log(error);
    } finally {
      await authentication();
      router.replace('/');
    }
  };

  const signIn = async () => {
    try {
      const authUrl = `${apiUrl}/auth/google`;
      await openAuthSessionAsync(authUrl);
    } catch (error) {
      console.log(error);
    }
  };

  const signOut = async () => {
    await setCookie(null);
  };

  return { setCookie, signIn, signOut, isLoading, user };
};

export default useAuth;
