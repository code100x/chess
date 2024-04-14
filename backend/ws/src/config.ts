import * as dotenv from "dotenv";
dotenv.config();

export const WSPORT = process.env.WSPORT || 8081;

export const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";