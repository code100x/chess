import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Redis from "@repo/db/redis";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.WS_PORT || 3002;
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const redis = new Redis({ url: REDIS_URL });
redis.open();

app.get("/", (req, res) => {
  res.send("Hello World! From Websocket Server");
});

app.listen(PORT, () => {
  console.log(`Websocket Server is running on port ${PORT}`);
});
