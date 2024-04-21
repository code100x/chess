import { useRecoilValue } from 'recoil';
import { userAtom } from '../atoms/user';

export const useUser = () => {
  const value = useRecoilValue(userAtom);
  return value;
};
