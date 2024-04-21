import jwt from 'jsonwebtoken';
import { User } from '../SocketManager';
import { Player } from '../Game';
import { WebSocket } from 'ws';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

export interface userJwtClaims {
  userId: string;
  name: string;
  isGuest?: boolean;
}

export const extractAuthUser = (token: string, ws: WebSocket): User => {
  const decoded = jwt.verify(token, JWT_SECRET) as userJwtClaims;
  return new User(ws, decoded);
};
