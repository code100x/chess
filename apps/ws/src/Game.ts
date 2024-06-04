import { Chess, Move, Square } from 'chess.js';
import {
  GAME_ENDED,
  INIT_GAME,
  MOVE,
} from './messages';
import { db } from './db';
import { randomUUID } from 'crypto';
import { SocketManager, User } from './SocketManager';

type GAME_STATUS = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED' | 'TIME_UP';
type GAME_RESULT = "WHITE_WINS" | "BLACK_WINS" | "DRAW";

const GAME_TIME_MS = 10 * 60 * 60 * 1000;

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

export async function fetchPlayerRatings(userId: string, timeControl: string) {
  const rating = await db.rating.findFirst({
    where: {
      userId: userId
    }
  })
  if (rating) {
    if (timeControl == 'CLASSICAL') {
      return rating.classic
    } else if (timeControl == 'RAPID') {
      return rating.rapid
    } else if (timeControl == 'BLITZ') {
      return rating.blitz
    } else if (timeControl == 'BULLET') {
      return rating.bullet
    }
  }
}

export async function fetchExpectedRating(playerRating: number, opponenetRating: number) {
  let qA = Math.pow(10, (playerRating / 400))
  let qB = Math.pow(10, (opponenetRating / 400))
  let eA = qA / (qA + qB)
  let k = 20 // TODO:need to add a method to select different K-factor based on condition. 
  let win = Math.round(k * (1 - eA))
  let draw = Math.round(k * (0.5 - eA))
  let lose = Math.round(k * (0 - eA))
  return {
    win,
    draw,
    lose
  }
}

export async function updatePlayersRating(gameFromDb:any) {
  console.log("gameFromDb -- ",gameFromDb)
  let whitePlayerRating = await fetchPlayerRatings(gameFromDb?.whitePlayerId, gameFromDb?.timeControl) as number
  let blackPlayerRating = await fetchPlayerRatings(gameFromDb?.blackPlayerId, gameFromDb?.timeControl) as number

  const whitePlayerExpected = await fetchExpectedRating(whitePlayerRating, blackPlayerRating)
  const blackPlayerExpected = await fetchExpectedRating(blackPlayerRating, whitePlayerRating)


  if (gameFromDb.result == 'WHITE_WINS') {
    whitePlayerRating = whitePlayerRating + whitePlayerExpected.win
    blackPlayerRating = blackPlayerRating + blackPlayerExpected.lose
  } else if (gameFromDb.result == 'BLACK_WINS') {
    whitePlayerRating = whitePlayerRating + whitePlayerExpected.lose
    blackPlayerRating = blackPlayerRating + blackPlayerExpected.win
  } else {
    whitePlayerRating = whitePlayerRating + whitePlayerExpected.draw
    blackPlayerRating = blackPlayerRating + blackPlayerExpected.draw
  }

 let whitePlayerRatingDb = await db.rating.findFirst({
    where : {
      userId : gameFromDb?.whitePlayerId
    }
  })

  await db.rating.update({
    data:{
      classic : gameFromDb?.timeControl == 'CLASSICAL' ? whitePlayerRating : whitePlayerRatingDb?.classic,
      bullet : gameFromDb?.timeControl == 'BULLET' ? whitePlayerRating : whitePlayerRatingDb?.bullet,
      rapid : gameFromDb?.timeControl == 'RAPID' ? whitePlayerRating : whitePlayerRatingDb?.rapid,
      blitz : gameFromDb?.timeControl == 'BLITZ' ? whitePlayerRating : whitePlayerRatingDb?.blitz
    },
    where :{
      userId : gameFromDb.whitePlayerId
    }
  })

  let blackPlayerRatingDb = await db.rating.findFirst({
    where : {
      userId : gameFromDb?.whitePlayerId
    }
  })

  await db.rating.update({
    data:{
      classic : gameFromDb?.timeControl == 'CLASSICAL' ? blackPlayerRating : blackPlayerRatingDb?.classic,
      bullet : gameFromDb?.timeControl == 'BULLET' ? blackPlayerRating : blackPlayerRatingDb?.bullet,
      rapid : gameFromDb?.timeControl == 'RAPID' ? blackPlayerRating : blackPlayerRatingDb?.rapid,
      blitz : gameFromDb?.timeControl == 'BLITZ' ? blackPlayerRating : blackPlayerRatingDb?.blitz
    },
    where :{
      userId : gameFromDb?.blackPlayerId
    }
  })

}

export class Game {
  public gameId: string;
  public player1UserId: string;
  public player2UserId: string | null;
  public board: Chess;
  private moveCount = 0;
  private timer: NodeJS.Timeout | null = null;
  private moveTimer: NodeJS.Timeout | null = null;
  public result: GAME_RESULT | null = null;
  private player1TimeConsumed = 0;
  private player2TimeConsumed = 0;
  private startTime = new Date(Date.now());
  private lastMoveTime = new Date(Date.now());
  private timeControl = ''

  constructor(player1UserId: string, player2UserId: string | null, gameId?: string, startTime?: Date) {
    this.player1UserId = player1UserId;
    this.player2UserId = player2UserId;
    this.board = new Chess();
    this.gameId = gameId ?? randomUUID();
    if (startTime) {
      this.startTime = startTime;
      this.lastMoveTime = startTime;
    }
  }

  seedMoves(moves: {
    id: string;
    gameId: string;
    moveNumber: number;
    from: string;
    to: string;
    comments: string | null;
    timeTaken: number | null;
    createdAt: Date;
  }[]) {
    console.log(moves);
    moves.forEach((move) => {
      if (
        isPromoting(this.board, move.from as Square, move.to as Square)
      ) {
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
    });
    this.moveCount = moves.length;
    if (moves[moves.length - 1]) {
      this.lastMoveTime = moves[moves.length - 1].createdAt;
    }

    moves.map((move, index) => {
      if (move.timeTaken) {
        if (index % 2 === 0) {
          this.player1TimeConsumed += move.timeTaken;
        } else {
          this.player2TimeConsumed += move.timeTaken;
        }
      }
    });
    this.resetAbandonTimer();
    this.resetMoveTimer();
  }
  async updateSecondPlayer(player2UserId: string) {
    this.player2UserId = player2UserId;

    const users = await db.user.findMany({
      where: {
        id: {
          in: [this.player1UserId, this.player2UserId ?? ''],
        },
      },
    });

    try {
      await this.createGameInDb();
    } catch (e) {
      console.error(e);
      return;
    }

    const player1rating = await fetchPlayerRatings(this.player1UserId, this.timeControl) as number
    const player2rating = await fetchPlayerRatings(this.player2UserId, this.timeControl) as number

    SocketManager.getInstance().broadcast(
      this.gameId,
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          gameId: this.gameId,
          whitePlayer: {
            name: users.find((user) => user.id === this.player1UserId)?.name,
            id: this.player1UserId,
            rating: player1rating,
            expectedRating: await fetchExpectedRating(player1rating, player2rating)
          },
          blackPlayer: {
            name: users.find((user) => user.id === this.player2UserId)?.name,
            id: this.player2UserId,
            rating: player2rating,
            expectedRating: await fetchExpectedRating(player2rating, player1rating)
          },
          fen: this.board.fen(),
          moves: [],
        },
      }),
    );
  }

  async createGameInDb() {
    this.startTime = new Date(Date.now());
    this.lastMoveTime = this.startTime;

    const game = await db.game.create({
      data: {
        id: this.gameId,
        timeControl: 'RAPID',
        status: 'IN_PROGRESS',
        startAt: this.startTime,
        currentFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        whitePlayer: {
          connect: {
            id: this.player1UserId,
          },
        },
        blackPlayer: {
          connect: {
            id: this.player2UserId ?? '',
          },
        },
      },
      include: {
        whitePlayer: true,
        blackPlayer: true,
      },
    });
    this.gameId = game.id;
    this.timeControl = game.timeControl
  }

  async addMoveToDb(move: Move, moveTimestamp: Date) {
    
    await db.$transaction([
      db.move.create({
        data: {
          gameId: this.gameId,
          moveNumber: this.moveCount + 1,
          from: move.from,
          to: move.to,
          before: move.before,
          after: move.after,
          createdAt: moveTimestamp,
          timeTaken: moveTimestamp.getTime() - this.lastMoveTime.getTime(),
          san: move.san
        },
      }),
      db.game.update({
        data: {
          currentFen: move.after,
        },
        where: {
          id: this.gameId,
        },
      }),
    ]);
  }

  async makeMove(
    user: User,
    move: Move
  ) {
    
    // validate the type of move using zod
    if (this.board.turn() === 'w' && user.userId !== this.player1UserId) {
      return;
    }

    if (this.board.turn() === 'b' && user.userId !== this.player2UserId) {
      return;
    }

    if (this.result) {
      console.error(`User ${user.userId} is making a move post game completion`);
      return;
    }

    const moveTimestamp = new Date(Date.now());

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
      console.error("Error while making move");
      return;
    }

    // flipped because move has already happened
    if (this.board.turn() === 'b') {
      this.player1TimeConsumed = this.player1TimeConsumed + (moveTimestamp.getTime() - this.lastMoveTime.getTime());
    }

    if (this.board.turn() === 'w') {
      this.player2TimeConsumed = this.player2TimeConsumed + (moveTimestamp.getTime() - this.lastMoveTime.getTime());
    }

    await this.addMoveToDb(move, moveTimestamp);
    this.resetAbandonTimer()
    this.resetMoveTimer();

    this.lastMoveTime = moveTimestamp;

    SocketManager.getInstance().broadcast(
      this.gameId,
      JSON.stringify({
        type: MOVE,
        payload: { move, player1TimeConsumed: this.player1TimeConsumed, player2TimeConsumed: this.player2TimeConsumed },
      }),
    );

    if (this.board.isGameOver()) {
      const result = this.board.isDraw()
        ? 'DRAW'
        : this.board.turn() === 'b'
          ? 'WHITE_WINS'
          : 'BLACK_WINS';

      this.endGame("COMPLETED", result);
    }

    this.moveCount++;
  }

  getPlayer1TimeConsumed() {
    if (this.board.turn() === 'w') {
      return this.player1TimeConsumed + (new Date(Date.now()).getTime() - this.lastMoveTime.getTime());
    }
    return this.player1TimeConsumed;
  }

  getPlayer2TimeConsumed() {
    if (this.board.turn() === 'b') {
      return this.player2TimeConsumed + (new Date(Date.now()).getTime() - this.lastMoveTime.getTime());
    }
    return this.player2TimeConsumed;
  }

  async resetAbandonTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.endGame("ABANDONED", this.board.turn() === 'b' ? 'WHITE_WINS' : 'BLACK_WINS');
    }, 60 * 1000);
  }

  async resetMoveTimer() {
    if (this.moveTimer) {
      clearTimeout(this.moveTimer)
    }
    const turn = this.board.turn();
    const timeLeft = GAME_TIME_MS - (turn === 'w' ? this.player1TimeConsumed : this.player2TimeConsumed);

    this.moveTimer = setTimeout(() => {
      this.endGame("TIME_UP", turn === 'b' ? 'WHITE_WINS' : 'BLACK_WINS');
    }, timeLeft);
  }

  async endGame(status: GAME_STATUS, result: GAME_RESULT) {

    let gameDb = await db.game.findFirst({
      where :{
        id : this.gameId
      }
    })
    if (!gameDb){
      return
    }
    if (gameDb?.status == "IN_PROGRESS"){
    let  updatedGame = await db.game.update({
      data: {
        status,
        result: result,
      },
      where: {
        id: this.gameId,
      },
      include: {
        moves: {
          orderBy: {
            moveNumber: 'asc',
          },
        },
        blackPlayer: true,
        whitePlayer: true,
      }
    });
    await updatePlayersRating(gameDb)
    SocketManager.getInstance().broadcast(
      this.gameId,
      JSON.stringify({
        type: GAME_ENDED,
        payload: {
          result,
          status,
          moves: updatedGame.moves,
          blackPlayer: {
            id: updatedGame.blackPlayer.id,
            name: updatedGame.blackPlayer.name,
          },
          whitePlayer: {
            id: updatedGame.whitePlayer.id,
            name: updatedGame.whitePlayer.name,
          },
        },
      }),
    );
    // clear timers
    this.clearTimer();
    this.clearMoveTimer();
  }

  clearMoveTimer() {
    if(this.moveTimer) clearTimeout(this.moveTimer);
  }
}
  setTimer(timer: NodeJS.Timeout) {
    this.timer = timer;
  }

  clearTimer() {
    if (this.timer) clearTimeout(this.timer);
  }
}
