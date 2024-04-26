// src/api/authService.ts
import { GOOGLE_CLIENT_ID, API_URL } from '../config';
import axios from 'axios';

const loginWithGoogle = async (idToken: string) => {
  try {
    const response = await axios.post(`${API_URL}/auth/google`, {
      idToken
    });
    return response.data; //  JWT token received from your backend
  } catch (error) {
    console.error('Error logging in', error);
    throw error;
  }
};

export default {
  loginWithGoogle,
};
