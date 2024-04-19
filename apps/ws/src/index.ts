
import { WebSocketServer } from 'ws';
import { GameManager } from './GameManager';
import { Game } from './Game';
import http from "http";
import express from "express";
import { MessageType, WsMessageParser } from '@chess-monorepo/common';

const app = express();
app.use(express.json());

const server = http.createServer(app);

const wss = new WebSocketServer({ server });

app.get("/", (_req, res) => {
  return res.status(200).json({
      uptime: process.uptime(),
      message: "OK",
      timestamp: Date.now(),
  });
});

wss.on('connection', async function connection(ws) {
  
  ws.on("message", async (message) => {
    const data = WsMessageParser.parse(JSON.parse(message.toString()));

    //todo: get random match
    if (data.type === MessageType.GET_MATCH) {
      // await GameManager.getInstance().getMatch(data.payload.userId, ws);
    }
    if (data.type === MessageType.JOIN_GAME) {
      await GameManager.getInstance().subscribe(data.payload.gameId, data.payload.userId, data.payload.role, ws)
    }
    if (data.type === MessageType.GET_MOVE) {
      await Game.getInstance().getLegalMoves(data.payload.gameId, data.payload.pos).then((moves) => {
        ws.send(JSON.stringify({
          type: MessageType.GET_MOVE,
          payload: moves || []
        }));
      });
    }
    if (data.type === MessageType.MOVE) {
      await GameManager.getInstance().move(data.payload.gameId, data.payload.userId, data.payload.role, data.payload, ws);
    }

  });

  ws.on("close", () => {
    // GameManager.getInstance().unsubscribe();
  })
});



Promise.all([
  new Promise((resolve, reject) => {
      GameManager.getInstance().connect().then(() => {
          resolve(true);
      }).catch((error) => {
          reject(error);
      });
  }),
  new Promise((resolve, reject) => {
      Game.getInstance().connect().then(() => {
          resolve(true);
      }).catch((error) => {
          reject(error);
      });
  }),
]).then(() => {
  server.listen(8080, async () => {
      console.log(`Server listening on port: ${8080}\n`);
  });
}).catch((error) => {
  console.error('Error while connecting producers:', error);
});
