import { SFUServerMessageSent } from '@repo/common/types';
import { WebSocket } from 'ws';

export const sendMessage = (ws: WebSocket, message: SFUServerMessageSent) => {
  ws.send(JSON.stringify(message));
};
