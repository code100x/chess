import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.WS_PORT || 3002;

app.get("/", (req, res) => {
  res.send("Hello World! From Websocket Server");
});

app.listen(PORT, () => {
  console.log(`Websocket Server is running on port ${PORT}`);
});
