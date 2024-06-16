import { WebSocketServer } from 'ws';
import url from 'url';
import { extractUserId } from './auth';
import { RoomManager } from './RoomManager';
import { Peer } from './Peer';
import { createWorker } from './lib/worker';

const roomManager = new RoomManager();

const wss = new WebSocketServer({ port: 8081 });

wss.on('connection', async function connection(ws, req) {
  //@ts-ignore
  const token: string = url.parse(req.url, true).query.token;
  const userId = extractUserId(token);
  const worker = await createWorker();
  
  roomManager.addPeer(new Peer(ws, userId), worker);

  ws.on('close', () => {
    console.log('closed');
    roomManager.removePeer(ws)
  });
});
