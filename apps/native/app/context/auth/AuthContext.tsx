import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { GoogleSignin, User } from '@react-native-google-signin/google-signin';
import axios from 'axios';
import { API_BASE_URL } from '../../../config';
import { storeToken, getToken } from '../../services/authService';

interface AuthContextData {
  user: User | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = await GoogleSignin.getTokens();
      const response = await axios.post(`${API_BASE_URL}/auth/google`, { idToken });
      const token = response.data.token;
      await storeToken(token);
      setUser(userInfo);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      await storeToken('');
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = await getToken();
      if (token) {
        const response = await axios.get(`${API_BASE_URL}/auth/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      }
    };
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
