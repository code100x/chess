import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useReducer } from 'react';

type UseStateHook<T> = [AuthState<T>, (value: T | null) => void];

function useAsyncState<T>( initialValue: AuthState<T> = [true, null] ): UseStateHook<T> {
  const reducer = (state: AuthState<T>, action: T | null = null) : AuthState<T> => {
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

export function useStorageState(key: string): [AuthState<ApiResponse>, (value:string | null) => void] {
  const [state, setState] = useAsyncState<ApiResponse>();

  const authStatus = async () => {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    try {
      const cookie = await SecureStore.getItemAsync(key);
      if (!cookie) {
        setState(null);
        return;
      }
      const res = await fetch(`${apiUrl}/auth/refresh`, {
        credentials: "include",
        headers: {
          Cookie: cookie
        }
      });
      console.log(res);
      if (!res.ok) {
        setState(null);
        return;
      } 
      const data: ApiResponse = await res.json();
      console.log(data);
      setState(data);
    } catch (error) {
      console.log(error);
      setState(null);
    }
  }
  useEffect(() => {
    authStatus();
  }, [key]);

  const setValue = useCallback(
    async (value: string | null) => {
      setState(null);
      await setStorageItemAsync(key, value);
      if (value) {
        await authStatus();
      }
    },
    [key]
  );

  return [state, setValue];
}
