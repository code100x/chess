import { WebSocket } from 'ws';
import { Game, isPromoting } from './Game';
import { db } from './db';
import { SocketManager, User } from './SocketManager';
import { Square } from 'chess.js';
import { GameStatus } from '@prisma/client';
import { RoomManager } from './RoomManager';
import {
  ANSWER,
  GAME_ADDED,
  GAME_ALERT,
  GAME_ENDED,
  GAME_JOINED,
  GAME_NOT_FOUND,
  ICE_CANDIDATE,
  INIT_GAME,
  JOIN_ROOM,
  MOVE,
  OFFER,
  VIDEO_CALL_REQUEST,
  SEND_OFFER,
  VIDEO_CALL_ANSWER,
  TERMINATE_CALL,
} from '@repo/common/messages';

export class GameManager {
  private games: Game[];
  private pendingGameId: string | null;
  private users: User[];
  private videoCallStatusMapping: Map<string, boolean>;

  constructor() {
    this.games = [];
    this.pendingGameId = null;
    this.users = [];
    this.videoCallStatusMapping = new Map<string, boolean>();
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
    const roomManager = new RoomManager();

    user.socket.on('message', async (data) => {
      const message = JSON.parse(data.toString());
      if (message.type === INIT_GAME) {
        if (this.pendingGameId) {
          const game = this.games.find((x) => x.gameId === this.pendingGameId);
          if (!game) {
            console.error('Pending game not found?');
            return;
          }
          console.log('pending game');
          if (user.userId === game.player1UserId) {
            SocketManager.getInstance().broadcast(
              game.gameId,
              JSON.stringify({
                type: GAME_ALERT,
                payload: {
                  message: 'Trying to Connect with yourself?',
                },
              }),
            );
            return;
          }
          SocketManager.getInstance().addUser(user, game.gameId);
          await game?.updateSecondPlayer(user.userId);
          this.pendingGameId = null;
        } else {
          const game = new Game(user.userId, null);
          this.games.push(game);
          this.pendingGameId = game.gameId;
          SocketManager.getInstance().addUser(user, game.gameId);
          SocketManager.getInstance().broadcast(
            game.gameId,
            JSON.stringify({
              type: GAME_ADDED,
            }),
          );
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

        if (gameFromDb.status !== GameStatus.IN_PROGRESS) {
          user.socket.send(
            JSON.stringify({
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
              },
            }),
          );
          return;
        }

        if (!availableGame) {
          const game = new Game(
            gameFromDb?.whitePlayerId!,
            gameFromDb?.blackPlayerId!,
            gameFromDb.id,
            gameFromDb.startAt,
          );
          //@ts-ignore
          game.seedMoves(gameFromDb?.moves || []);
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

        const isVideoCallAccepted = this.videoCallStatusMapping.get(gameId);

        if (isVideoCallAccepted) {
          SocketManager.getInstance().broadcast(
            gameId,
            JSON.stringify({
              type: SEND_OFFER,
              payload: {
                gameId,
              },
            }),
          );
        }
      }

      if (message.type === VIDEO_CALL_REQUEST) {
        const game = this.games.find(
          (game) => game.gameId === message.payload.gameId,
        );

        if (!game) return;

        roomManager.onRequest(game, this.users, message.payload.senderSocketid);
      }

      if (message.type === VIDEO_CALL_ANSWER) {
        console.log('video answer');

        const receivingUser = this.users.find(
          (user) => user.userId !== message.payload.senderSocketId,
        );

        const game = this.games.find(
          (game) => game.gameId === message.payload.gameId,
        );

        if (!game) return;

        console.log('result', message.payload.result);

        if (message.payload.result) {
          console.log('result is true');
          this.videoCallStatusMapping.set(message.payload.gameId, true);

          SocketManager.getInstance().broadcast(
            message.payload.gameId,
            JSON.stringify({
              type: SEND_OFFER,
              payload: {
                gameId: message.payload.gameId,
              },
            }),
          );
        } else {
          this.videoCallStatusMapping.set(message.payload.gameId, false);
        }

        receivingUser?.socket.send(
          JSON.stringify({
            type: VIDEO_CALL_ANSWER,
            payload: {
              result: message.payload.result,
            },
          }),
        );
      }

      if (message.type === TERMINATE_CALL) {
        const game = this.games.find(
          (game) => game.gameId === message.payload.gameId,
        );

        if (!game) return;

        SocketManager.getInstance().broadcast(
          game.gameId,
          JSON.stringify({
            type: TERMINATE_CALL,
          }),
        );
      }

      if (message.type === OFFER) {
        const game = this.games.find(
          (game) => game.gameId === message.payload.gameId,
        );

        if (!game) return;

        roomManager.onOffer(
          game,
          this.users,
          message.payload.sdp,
          message.payload.senderSocketid,
        );
      }

      if (message.type === ANSWER) {
        const game = this.games.find(
          (game) => game.gameId === message.payload.gameId,
        );

        if (!game) return;

        roomManager.onAnswer(
          game,
          this.users,
          message.payload.sdp,
          message.payload.senderSocketid,
        );
      }

      if (message.type === ICE_CANDIDATE) {
        const game = this.games.find(
          (game) => game.gameId === message.payload.gameId,
        );

        if (!game) return;

        roomManager.onIceCandidates(
          game,
          this.users,
          message.payload.senderSocketid,
          message.payload.candidate,
          message.payload.type,
        );
      }
    });
  }
}
