import * as dontenv from 'dotenv';
dontenv.config();

export const REDIS_URL
    = process.env.REDIS_URL || "redis://localhost:6379";