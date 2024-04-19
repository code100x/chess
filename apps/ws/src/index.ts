import { WebSocketServer } from 'ws';
import { GameManager } from './GameManager';
import url from "url";
import { extractUserId } from './auth';

const wss = new WebSocketServer({ port: 8080 });

const gameManager = new GameManager();

wss.on('connection', function connection(ws, req) {

  //@ts-ignore
  const token: string = url.parse(req.url, true).query.token;
  const userId = extractUserId(token);
  gameManager.addUser({socket: ws, id: userId});

  ws.on("close", () => {
    gameManager.removeUser(ws, userId)
  })
});

console.log("done")