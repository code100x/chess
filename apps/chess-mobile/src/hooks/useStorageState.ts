import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useReducer } from 'react';

type StateValue<T> = [boolean, T | null];
type UseStateHook<T> = [StateValue<T>, (value: T | null) => void];

function useAsyncState<T>( initialValue: StateValue<T> = [true, null] ): UseStateHook<T> {
  const reducer = (state: StateValue<T>, action: T | null = null) : StateValue<T> => {
    return [false, action]
  };

  return useReducer(reducer, initialValue) as UseStateHook<T>;
}

export async function setStorageItemAsync(key: string, value: string | null) {
  if (value == null) {
    await SecureStore.deleteItemAsync(key);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

export function useStorageState(key: string): UseStateHook<string> {
  const [state, setState] = useAsyncState<string>();

  useEffect(() => {
    SecureStore.getItemAsync(key).then(value => {
      setState(value);
    });
  }, [key]);

  // Set
  const setValue = useCallback(
    (value: string | null) => {
      setState(value);
      setStorageItemAsync(key, value);
    },
    [key]
  );

  return [state, setValue];
}
