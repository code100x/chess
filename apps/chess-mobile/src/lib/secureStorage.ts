import * as SecureStore from 'expo-secure-store';

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

export default secureStorage;
