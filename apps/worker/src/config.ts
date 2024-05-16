import * as dotenv from 'dotenv';
dotenv.config();

export const REDIS_URL
    = process.env.REDIS_URL || 'redis://localhost:6379';

export const PORT = process.env.PORT || 9090;