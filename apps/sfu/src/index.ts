import { WebSocketServer, WebSocket} from 'ws';
import url from 'url';
import jwt from 'jsonwebtoken';
import {createWorker} from 'mediasoup';
import { MediaKind } from 'mediasoup/node/lib/RtpParameters';
import User from './User';
import { cpus } from 'os';
import { Worker } from 'mediasoup/node/lib/Worker';


const wss = new WebSocketServer({ port: 8081 });

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

export const extractUserId = (token: string) => {
  const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
  return decoded.userId;
};

const mediaCodecs = [
  {
    kind: 'audio' as MediaKind,
    mimeType: 'audio/opus',
    clockRate: 48000,
    channels: 2,
    parameters : {
      'usedtx': 1,             // Use discontinuous transmission
    }
  },
  {
    kind: 'video' as MediaKind,
    mimeType: 'video/H264',
    clockRate: 90000,
    parameters: {
      'packetization-mode': 1,
      'profile-level-id': '42e01f',
      'level-asymmetry-allowed': 1,
    },
  }
];

const numCPUs = cpus().length;
const workers: Worker[] = [];



async function createWorkers() {
  // Each worker runs as a separate process on a single cpu 
  let minPort = 40000;
  let maxPort = 49999;
  let portsPerWorker = Math.floor((maxPort - minPort) / numCPUs);
  for (let i = 0; i < numCPUs; i++) {
    let rtcMinPort = minPort + i * portsPerWorker;
    let rtcMaxPort = rtcMinPort + portsPerWorker - 1;
    try {
      let worker = await createWorker({
        rtcMinPort: rtcMinPort,
        rtcMaxPort: rtcMaxPort,
        logLevel: 'warn',
      });
      workers.push(worker);
    } catch (err) {
      console.error('Error creating worker', err);
    }
  }
}

createWorkers().then(() => {
  if(workers.length === 0) {
    console.error('No workers created');
    process.exit(1);
  }
  console.log(`${workers.length} Workers created`);
}).catch((err) => {
  console.error('Error creating workers', err);
  process.exit(1);
});;

let workerIndex = 0;

export async function createRouter() {
  const worker = workers[workerIndex];
  if(!worker) {
    throw new Error('No workers available');
  }
  const router = await worker.createRouter({ mediaCodecs });
  workerIndex = (workerIndex + 1) % workers.length;
  return router;
}

const users: { [key: string]: User } = {};

wss.on('connection', async function connection(ws, req) {
  //@ts-ignore
  const token: string = url.parse(req.url, true).query.token;

  console.log(token);

  const userId = extractUserId(token);
  
  let user = new User(userId, ws);

  users[user.sid] = user;

  user.ws.on('close', () => {
    delete users[user.sid];
    console.log(`User ${userId} for ${user.sid} disconnected`);
  });
});

console.log('done');

