import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { storedCookie } from '~/store/atoms/cookie';
import { loadingAtom } from '~/store/atoms/loading';
import { userAtom } from '~/store/atoms/user';

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

const useAuth = () => {
  const setLoading = useSetRecoilState(loadingAtom);
  const setUser = useSetRecoilState(userAtom);
  const cookie = useRecoilValue(storedCookie);

  const authentication = async () => {
    try {
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
};

export default useAuth;
