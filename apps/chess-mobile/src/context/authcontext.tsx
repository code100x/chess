import { openAuthSessionAsync } from "expo-web-browser";
import { ReactNode, createContext, useContext } from "react";
import { useStorageState } from "~/hooks/useStorageState";

const SERVER = process.env.EXPO_PUBLIC_API_URL;

interface IAuthContext {
  signIn: () => void;
  signOut: () => void;
  setCookie: (value: string) => void;
  session: ApiResponse | null;
  isLoading: boolean;
}

const AuthContext = createContext<IAuthContext>({
  isLoading: false,
  session: null,
  signIn: () => { },
  signOut: () => { },
  setCookie: () => { }
});

export function useAuth() {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useAuth must be wrapped in a <AuthProvider />');
    }
  }
  return value;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [[isLoading, session], setSession] = useStorageState('session');
  const signIn = async () => {
    try {
      const authUrl = `${SERVER}/auth/google`;
      await openAuthSessionAsync(authUrl);
    } catch (error) {
      console.log(error);
    }
  }

  const setCookie = (value: string) => {
    setSession(value);
  }

  const signOut = async () => {
    try {
      console.log(session);
      setSession(null);
      // const cookie = await SecureStore.getItemAsync(key);
      // const res = await fetch(`${SERVER}/auth/logout`, {
      //   credentials: "include",
      //   headers: {
      //     Cookie: cookie
      //   }
      // });

    } catch (error) {
      console.log(error);

    }
  }

  return (
    <AuthContext.Provider value={{ session, isLoading, signIn, signOut, setCookie }}>
      {children}
    </AuthContext.Provider>
  )
}