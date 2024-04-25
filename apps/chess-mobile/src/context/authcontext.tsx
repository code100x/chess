import { ReactNode, createContext, useContext } from "react";
import { useStorageState } from "~/hooks/useStorageState";

interface IAuthContext {
  signIn:()=> void;
  signOut:()=> void;
  session: ApiResponse | null;
  isLoading: boolean;
}

const AuthContext = createContext<IAuthContext>({
  isLoading:false,
  session:null,
  signIn:() => {},
  signOut:() => {},
});

export function useAuth(){
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useAuth must be wrapped in a <AuthProvider />');
    }
  }
  return value;
}

export function AuthProvider({children}:{children:ReactNode}){
  const [[isLoading, session], setSession] = useStorageState('session');
  const signIn = () =>{}
  const signOut = () =>{}

  return (
    <AuthContext.Provider value={{session, isLoading, signIn, signOut}}>
      {children}
    </AuthContext.Provider>
  )
}