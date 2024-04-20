import jwt from 'jsonwebtoken';
import { User } from '../SocketManager';
import { Player } from '../Game';
import { WebSocket } from "ws";

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

export const extractAuthUser = (token: string, ws: WebSocket): User => {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, name: string };
    return new User(ws, decoded.userId, decoded.name)
}

export const isGuest = (player: Player | null): boolean => {
    if (player && player.userId.startsWith("guest-")) {
        return true
    }
    return false
}