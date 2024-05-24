import { createRouter } from "./index";
import Room from "./Room";
import { WebSocket } from "ws";
import { randomUUID } from 'crypto';
import RoomManager from "./RoomManager";
import { ServerMessageType } from "@repo/common/sfu";


class User {
    id: string;
    ws: WebSocket;
    sid: string;
    constructor(id: string, ws: WebSocket) {
      this.id = id;
      this.ws = ws;
      this.sid = randomUUID();
      this.handler();
    }

    
  
    handler() {
      this.ws.on('message', async (data) => {
        const message = JSON.parse(data.toString());
        switch (message.type) {
          case ServerMessageType.JOIN_ROOM:
            const roomId = message.payload.roomId;
            const roomManager = RoomManager.getInstance();
            const room = await roomManager.getOrCreateRoom(roomId);
            room.addPeer(this);
            break;
        }
      });

    }

  }

  export default User;

