import { BACKEND_URL } from '@/constants/endpoints';
import axios, { CreateAxiosDefaults } from 'axios';

const config: CreateAxiosDefaults = {
  baseURL: BACKEND_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
};

export const api = axios.create(config);
