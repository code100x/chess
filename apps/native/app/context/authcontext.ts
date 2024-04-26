import { createContext, ReactNode, FC } from 'react';

interface UserType {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserType | null;
}


export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
});

interface AuthProviderProps {
  children: ReactNode;
}
i

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const value = {
    isAuthenticated: false,
    user: null,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
