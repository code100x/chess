import { WebSocket } from 'ws';
import { Chess, Square } from 'chess.js';
import { GAME_OVER, INIT_GAME, MOVE } from './messages';
import { db } from './db';
import { randomUUID } from 'crypto';
import { SocketManager, User } from './SocketManager';

export function isPromoting(chess: Chess, from: Square, to: Square) {
  if (!from) {
    return false;
  }

  const piece = chess.get(from);

  if (piece?.type !== 'p') {
    return false;
  }

  if (piece.color !== chess.turn()) {
    return false;
  }

  if (!['1', '8'].some((it) => to.endsWith(it))) {
    return false;
  }

  return chess
    .moves({ square: from, verbose: true })
    .map((it) => it.to)
    .includes(to);
}

export interface Player {
  id?: string;
  userId: string;
  name: string;
  isGuest?: boolean;
}

export class Game {
  public gameId: string;
  public player1: Player;
  public player2: Player | null;
  public board: Chess;
  private startTime: Date;
  private moveCount = 0;

  constructor(player1: Player, player2: Player | null) {
    this.player1 = player1;
    this.player2 = player2;
    this.board = new Chess();
    this.startTime = new Date();
    this.gameId = randomUUID();
  }

  async updateSecondPlayer(player2: Player) {
    this.player2 = player2;
    let player1Name = this.player1.name;
    let player2Name = this.player2?.name;

    try {
      await this.createGameInDb();
    } catch (e) {
      console.error(e);
      return;
    }

    SocketManager.getInstance().broadcast(
      this.gameId,
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          gameId: this.gameId,
          whitePlayer: {
            name: player1Name,
            id: this.player1.userId,
            isGuest: this.player1.isGuest,
          },
          blackPlayer: {
            name: player2Name,
            id: this.player2.userId,
            isGuest: this.player2.isGuest,
          },
          fen: this.board.fen(),
          moves: [],
        },
      }),
    );
  }

  async createGameInDb() {
    const game = await db.game.create({
      data: {
        id: this.gameId,
        timeControl: 'CLASSICAL',
        status: 'IN_PROGRESS',
        currentFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        whitePlayer: {
          connect: {
            id: this.player1.userId,
          },
        },
        blackPlayer: {
          connect: {
            id: this.player2?.userId ?? '',
          },
        },
      },
      include: {
        whitePlayer: true,
        blackPlayer: true,
      },
    });
    this.gameId = game.id;
  }

  async addMoveToDb(move: { from: string; to: string }) {
    await db.$transaction([
      db.move.create({
        data: {
          gameId: this.gameId,
          moveNumber: this.moveCount + 1,
          from: move.from,
          to: move.to,
          // Todo: Fix start fen
          startFen: this.board.fen(),
          endFen: this.board.fen(),
          createdAt: new Date(Date.now()),
        },
      }),
      db.game.update({
        data: {
          currentFen: this.board.fen(),
        },
        where: {
          id: this.gameId,
        },
      }),
    ]);
  }

  async makeMove(
    user: User,
    move: {
      from: Square;
      to: Square;
    },
  ) {
    // validate the type of move using zod
    if (this.moveCount % 2 === 0 && user.userId !== this.player1.userId) {
      return;
    }
    if (this.moveCount % 2 === 1 && user.userId !== this.player2?.userId) {
      return;
    }

    try {
      if (isPromoting(this.board, move.from, move.to)) {
        this.board.move({
          from: move.from,
          to: move.to,
          promotion: 'q',
        });
      } else {
        this.board.move({
          from: move.from,
          to: move.to,
        });
      }
    } catch (e) {
      return;
    }

    await this.addMoveToDb(move);
    SocketManager.getInstance().broadcast(
      this.gameId,
      JSON.stringify({
        type: MOVE,
        payload: move,
      }),
    );

    if (this.board.isGameOver()) {
      const result = this.board.isDraw()
        ? 'DRAW'
        : this.board.turn() === 'b'
          ? 'WHITE_WINS'
          : 'BLACK_WINS';

      SocketManager.getInstance().broadcast(
        this.gameId,
        JSON.stringify({
          type: GAME_OVER,
          payload: {
            result,
          },
        }),
      );

      await db.game.update({
        data: {
          result,
          status: 'COMPLETED',
        },
        where: {
          id: this.gameId,
        },
      });
    }

    this.moveCount++;
  }
}
