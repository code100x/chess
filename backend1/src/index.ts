import { WebSocket, WebSocketServer } from 'ws';
import { GameManager } from './GameManager';

const PORT = 8080;

const wss = new WebSocketServer({ port: PORT });
const gameManager = new GameManager();

console.log(`WebSocket server started on port ${PORT}`);

wss.on('connection', (ws: WebSocket) => {
  gameManager.addUser(ws);

  ws.on('close', () => {
    gameManager.removeUser(ws);
  });

  ws.on('error', error => {
    console.error('WebSocket error:', error);
    gameManager.removeUser(ws);
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down server...');
  wss.clients.forEach(client => client.terminate());
  wss.close(() => {
    console.log('WebSocket server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down server...');
  wss.clients.forEach(client => client.terminate());
  wss.close(() => {
    console.log('WebSocket server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
