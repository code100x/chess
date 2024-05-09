import { randomUUID } from 'crypto';


export class Room {
  public roomId: string;

  constructor() {
    this.roomId= randomUUID()
  }
}
