import { createContext, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated?: boolean;
  user?: any; 
}


export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const value = {
    isAuthenticated: false,
    user: null,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
};
