import * as dotenv from "dotenv";
dotenv.config();


export const REDIS_URL =
    process.env.REDIS_URL || "redis://localhost:6379";

export const DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';