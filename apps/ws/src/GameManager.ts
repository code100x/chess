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

export class GameManager {
  private games: Game[];
  private pendingGameId: string | null;
  private users: User[];

  constructor() {
    this.games = [];
    this.pendingGameId = null;
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

  removeGame(gameId: string) {
    this.games = this.games.filter((g) => g.gameId !== gameId);
  }

  private addHandler(user: User) {
    user.socket.on('message', async (data) => {
      const message = JSON.parse(data.toString());
      let gameToJoin = null;
      if (message.type === INIT_GAME) {
        const gameTime = message.time;
        if (![1, 3, 5, 10].includes(gameTime)) {
          console.error('Invalid time amount: ' + gameTime);
          return;
        }
        const gamesWithSameTimeLimit = this.games.filter(
          (game) => game.gameTime === gameTime && game.player2UserId === null,
        );
        if (this.pendingGameId) {
          const game = this.games.find((x) => x.gameId === this.pendingGameId);
          if (!game) {
            console.error('Pending game not found?');
            return;
          }
          if (gamesWithSameTimeLimit.length > 0) {
            gameToJoin = gamesWithSameTimeLimit[0];
          }
          this.pendingGameId = null;
        } else {
          if (gamesWithSameTimeLimit.length > 0) {
            gameToJoin = gamesWithSameTimeLimit[0];
          } else {
            const game = new Game(user.userId, null, gameTime);
            this.games.push(game);
            this.pendingGameId = game.gameId;
            SocketManager.getInstance().addUser(user, game.gameId);
            SocketManager.getInstance().broadcast(
              game.gameId,
              JSON.stringify({
                type: GAME_ADDED,
              }),
            );
            return;
          }
        }
        if (gameToJoin) {
          if (user.userId === gameToJoin.player1UserId) {
            SocketManager.getInstance().broadcast(
              gameToJoin.gameId,
              JSON.stringify({
                type: GAME_ALERT,
                payload: {
                  message: 'Trying to Connect with yourself?',
                },
              }),
            );
            return;
          }
          SocketManager.getInstance().addUser(user, gameToJoin.gameId);
          await gameToJoin?.updateSecondPlayer(user.userId);
          this.pendingGameId = null;
        }
      }

      if (message.type === MOVE) {
        const gameId = message.payload.gameId;
        const game = this.games.find((game) => game.gameId === gameId);
        if (game) {
          game.makeMove(user, message.payload.move);
          if (game.result) {
            this.removeGame(game.gameId);
          }
        }
      }

      if (message.type === JOIN_ROOM) {
        const gameId = message.payload?.gameId;
        if (!gameId) {
          return;
        }

        let availableGame = this.games.find((game) => game.gameId === gameId);
        const gameFromDb = await db.game.findUnique({
          where: { id: gameId },
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
              gameId,
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

        SocketManager.getInstance().addUser(user, gameId);
      }
    });
  }
}
