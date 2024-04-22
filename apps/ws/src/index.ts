import { WebSocketServer } from 'ws';
import { GameManager } from './GameManager';
import url from 'url';
import { extractUserId } from './auth';
import { User } from './SocketManager';
import { Worker } from './worker/publish';

const wss = new WebSocketServer({ port: 8080 });

const gameManager = new GameManager();

Promise.all([
  new Promise((resolve, reject) => {
    Worker.getInstance().connect().then(() => {
      resolve(true);
    }).catch((error) => {
      reject(error);
    });
  })
]).then(() => {
  wss.on('connection', function connection(ws, req) {
    //@ts-ignore
    const token: string = url.parse(req.url, true).query.token;
    const userId = extractUserId(token);
    gameManager.addUser(new User(ws, userId));

    ws.on('close', () => {
      gameManager.removeUser(ws);
    });
  });

  console.log('done');
})

