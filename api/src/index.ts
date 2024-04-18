import express from "express";
import { Request, Response } from "express";
import dotenv from "dotenv";
import http from "http";
import { WebSocketServer } from "ws";

dotenv.config();
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("New client connected");
  ws.send("Welcome to the WebSocket server");
  ws.on("message", function incoming(message) {
    const data = message.toString();
    console.log("Message received from client:", data);
    ws.send(`Msg from backend : ${data}`);
  });
  ws.on("close", () => {
    console.log("Client has disconnected");
  });
});

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running");
});

const PORT: number = parseInt(process.env.PORT as string, 10) || 3000;
server.listen(PORT, () => {
  console.log(`Server is runing on port ${PORT}`);
});
