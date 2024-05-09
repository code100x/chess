import { useRecoilValue } from 'recoil';
import { userAtom, userInfoAtom } from '../atoms/user';

export const useUser = () => {
  const value = useRecoilValue(userAtom);
  return value;
};

export const useUserInfo = () => {
  const value = useRecoilValue(userInfoAtom);
  return value;
};
