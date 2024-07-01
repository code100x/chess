import { atom, selector } from 'recoil';
import secureStorage from '~/lib/secureStorage';

const { getStorageItemAsync, setStorageItemAsync } = secureStorage('session');
export const storedCookie = atom<string | null>({
  key: 'storedCookie',
  default: selector({
    key: 'storedCookie/selector',
    get: async () => await getStorageItemAsync(),
  }),
  effects: [
    ({ onSet }) => {
      onSet(async (newValue) => {
        await setStorageItemAsync(newValue);
      });
    },
  ],
});
