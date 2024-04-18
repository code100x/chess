import { WebSocket } from 'ws';
import { Chess } from 'chess.js';
import {
  GAME_OVER,
  INIT_GAME,
  MOVE,
  MessageType,
  MovePayload,
} from './messages';

export class Game {
  private player1: WebSocket;
  private player2: WebSocket;
  private board: Chess;
  private startTime: Date;
  private moveCount = 0;
  private gameOver: boolean = false;

  constructor(player1: WebSocket, player2: WebSocket) {
    this.player1 = player1;
    this.player2 = player2;
    this.board = new Chess();
    this.startTime = new Date();

    this.sendMessage(player1, INIT_GAME, { color: 'white' });
    this.sendMessage(player2, INIT_GAME, { color: 'black' });
  }

  makeMove(socket: WebSocket, move: MovePayload) {
    if (this.gameOver) {
      console.log('Game is already over');
      return;
    }

    if (
      (this.moveCount % 2 === 0 && socket !== this.player1) ||
      (this.moveCount % 2 === 1 && socket !== this.player2)
    ) {
      console.log('Invalid player turn');
      return;
    }

    try {
      this.board.move(move);
    } catch (error) {
      console.error('Invalid move:', error);
      return;
    }

    if (this.board.isGameOver()) {
      this.gameOver = true;
      const winner = this.board.turn() === 'w' ? 'black' : 'white';
      this.sendMessage(this.player1, GAME_OVER, { winner });
      this.sendMessage(this.player2, GAME_OVER, { winner });
      this.cleanup();
      return;
    }

    const opponentSocket =
      this.moveCount % 2 === 0 ? this.player2 : this.player1;
    this.sendMessage(opponentSocket, MOVE, move);
    this.moveCount++;
  }

  endGame() {
    this.gameOver = true;
    this.cleanup();
  }

  hasPlayer(socket: WebSocket): boolean {
    return socket === this.player1 || socket === this.player2;
  }

  public cleanup() {
    this.player1.terminate();
    this.player2.terminate();
    this.board = new Chess();
  }

  private sendMessage(
    socket: WebSocket,
    type: MessageType,
    payload?:
      | MovePayload
      | { color: 'white' | 'black' }
      | { winner: 'white' | 'black' }
  ) {
    socket.send(JSON.stringify({ type, payload }));
  }
}