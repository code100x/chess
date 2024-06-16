import { createRouter } from ".";
import Room from "./Room";

class RoomManager {

    static instance: RoomManager;

    static getInstance() {
        if (!RoomManager.instance) {
            console.log('Creating new RoomManager instance');
            RoomManager.instance = new RoomManager();
        }
        return RoomManager.instance;
    }

    rooms: Map<string, Room>;
    
    constructor() {
        this.rooms = new Map();
    }
    
    async createRoom(roomId: string) {
        const router = await createRouter();
        const room = new Room(router, roomId);
        this.rooms.set(roomId, room);
        return room;
    }

    async getOrCreateRoom(roomId: string) {
        let room = this.rooms.get(roomId);
        if (!room) {
            console.log(`Creating new room ${roomId}`);
            room = await this.createRoom(roomId);
        }
        return room;
    }

    getRoom(roomId: string) {
        return this.rooms.get(roomId);
    }

    deleteRoom(roomId: string) {
        console.log(`Deleting room ${roomId}`);
        this.rooms.delete(roomId);
    }
}

export default RoomManager;