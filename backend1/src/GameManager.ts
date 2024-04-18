import { WebSocket } from 'ws';
import { INIT_GAME, MOVE, MessageType, MovePayload } from './messages';
import { Game } from './Game';

interface Message {
  type: MessageType;
  payload?: MovePayload;
}

export class GameManager {
  private games: Game[] = [];
  private pendingUser: WebSocket | null = null;
  private users: Set<WebSocket> = new Set();

  constructor() {
    this.addCleanupHandlers();
  }

  addUser(socket: WebSocket) {
    this.users.add(socket);
    this.addHandler(socket);
  }

  removeUser(socket: WebSocket) {
    this.users.delete(socket);

    // Check if user is part of any game and end the game if necessary
    const game = this.games.find(game => game.hasPlayer(socket));
    if (game) {
      game.endGame();
      this.games = this.games.filter(g => g !== game);
    }
  }

  private addHandler(socket: WebSocket) {
    socket.on('message', data => {
      const message: Message = JSON.parse(data.toString());

      switch (message.type) {
        case INIT_GAME:
          this.handleInitGame(socket);
          break;
        case MOVE:
          this.handleMoveMessage(socket, message.payload);
          break;
        default:
          console.error('Invalid message type:', message.type);
      }
    });

    socket.on('error', error => {
      console.error('WebSocket error:', error);
      this.removeUser(socket);
    });
  }

  private handleInitGame(socket: WebSocket) {
    if (this.pendingUser) {
      const game = new Game(this.pendingUser, socket);
      this.games.push(game);
      this.pendingUser = null;
    } else {
      this.pendingUser = socket;
    }
  }

  private handleMoveMessage(socket: WebSocket, payload?: MovePayload) {
    const game = this.games.find(game => game.hasPlayer(socket));
    if (game && payload) {
      game.makeMove(socket, payload);
    } else {
      console.error('Invalid move message or user not in game');
    }
  }

  private addCleanupHandlers() {
    process.on('beforeExit', () => {
      this.cleanup();
    });

    process.on('SIGINT', () => {
      this.cleanup();
      process.exit();
    });
  }

  private cleanup() {
    this.users.forEach(socket => socket.terminate());
    this.games.forEach(game => game.cleanup());
  }
}