import { WebSocket } from "ws";
import { Room } from "./Room";
export class Peer {
    public socket: WebSocket;
    public peerId: string;
  
    constructor(socket: WebSocket, peerId: string) {
      this.socket = socket;
      this.peerId = peerId;
    }
  }