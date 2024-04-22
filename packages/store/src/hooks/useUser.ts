import { useRecoilValue ,useSetRecoilState } from 'recoil';
import { userAtom } from '../atoms/user';

export const useUser = () => {
  const value = useRecoilValue(userAtom);
  const setUser = useSetRecoilState(userAtom);

  return { user: value, setUser };
}