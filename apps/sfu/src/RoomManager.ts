import { WebSocket } from 'ws';
import {
  GAME_OVER,
  INIT_GAME,
  JOIN_GAME,
  MOVE,
  OPPONENT_DISCONNECTED,
  JOIN_ROOM,
  GAME_JOINED,
  GAME_NOT_FOUND,
  GAME_ALERT,
  GAME_ADDED,
  GAME_ENDED,
} from './messages';
import { Game, isPromoting } from './Game';
import { db } from './db';
import { SocketManager, User } from './SocketManager';
import { Square } from 'chess.js';
import { GameStatus } from '@prisma/client';
import { Room } from './Room';

export class GameManager {
  private rooms: Room[];
  private pendingRoomId: string | null;
  private users: User[];

  constructor() {
    this.rooms = [];
    this.pendingRoomId = null;
    this.users = [];
  }

  addUser(user: User) {
    this.users.push(user);
    this.addHandler(user);
  }

  removeUser(socket: WebSocket) {
    const user = this.users.find((user) => user.socket === socket);
    if (!user) {
      console.error('User not found?');
      return;
    }
    this.users = this.users.filter((user) => user.socket !== socket);
    SocketManager.getInstance().removeUser(user);
  }

  removeRoom(roomId: string) {
    this.rooms = this.rooms.filter((r) => r.roomId !== roomId);
  }

  private addHandler(user: User) {
    user.socket.on('message', async (data) => {
      const message = JSON.parse(data.toString());
      if (message.type === INIT_GAME) {
        if (this.pendingGameId) {
          const game = this.games.find((x) => x.roomId === this.pendingGameId);
          if (!game) {
            console.error('Pending game not found?');
            return;
          }
          if (user.userId === game.player1UserId) {
            SocketManager.getInstance().broadcast(
              game.roomId,
              JSON.stringify({
                type: GAME_ALERT,
                payload: {
                  message: 'Trying to Connect with yourself?',
                },
              }),
            );
            return;
          }
          SocketManager.getInstance().addUser(user, game.roomId);
          await game?.updateSecondPlayer(user.userId);
          this.pendingGameId = null;
        } else {
          const game = new Game(user.userId, null);
          this.games.push(game);
          this.pendingGameId = game.roomId;
          SocketManager.getInstance().addUser(user, game.roomId);
          SocketManager.getInstance().broadcast(
            game.roomId,
            JSON.stringify({
              type: GAME_ADDED,
            }),
          );
        }
      }

      if (message.type === MOVE) {
        const roomId = message.payload.roomId;
        const game = this.games.find((game) => game.roomId === roomId);
        if (game) {
          game.makeMove(user, message.payload.move);
          if (game.result)  {
            this.removeGame(game.roomId);
          }
        }
      }

      if (message.type === JOIN_ROOM) {
        const roomId = message.payload?.roomId;
        if (!roomId) {
          return;
        }

        let availableGame = this.games.find((game) => game.roomId === roomId);
        const gameFromDb = await db.game.findUnique({
          where: { id: roomId },
          include: {
            moves: {
              orderBy: {
                moveNumber: 'asc',
              },
            },
            blackPlayer: true,
            whitePlayer: true,
          },
        });

        if (!gameFromDb) {
          user.socket.send(
            JSON.stringify({
              type: GAME_NOT_FOUND,
            }),
          );
          return;
        }

        if(gameFromDb.status !== GameStatus.IN_PROGRESS) {
          user.socket.send(JSON.stringify({
            type: GAME_ENDED,
            payload: {
              result: gameFromDb.result,
              status: gameFromDb.status,
              moves: gameFromDb.moves,
              blackPlayer: {
                id: gameFromDb.blackPlayer.id,
                name: gameFromDb.blackPlayer.name,
              },
              whitePlayer: {
                id: gameFromDb.whitePlayer.id,
                name: gameFromDb.whitePlayer.name,
              },
            }
          }));
          return;
        }

        if (!availableGame) {
          const game = new Game(
            gameFromDb?.whitePlayerId!,
            gameFromDb?.blackPlayerId!,
            gameFromDb.id,
            gameFromDb.startAt
          );
          game.seedMoves(gameFromDb?.moves || [])
          this.games.push(game);
          availableGame = game;
        }

        console.log(availableGame.getPlayer1TimeConsumed());
        console.log(availableGame.getPlayer2TimeConsumed());

        user.socket.send(
          JSON.stringify({
            type: GAME_JOINED,
            payload: {
              roomId,
              moves: gameFromDb.moves,
              blackPlayer: {
                id: gameFromDb.blackPlayer.id,
                name: gameFromDb.blackPlayer.name,
              },
              whitePlayer: {
                id: gameFromDb.whitePlayer.id,
                name: gameFromDb.whitePlayer.name,
              },
              player1TimeConsumed: availableGame.getPlayer1TimeConsumed(),
              player2TimeConsumed: availableGame.getPlayer2TimeConsumed(),
            },
          }),
        );

        SocketManager.getInstance().addUser(user, roomId);
      }
    });
  }
}
