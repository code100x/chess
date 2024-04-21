import {Chess} from 'chess.js';
import type { Square, Move } from 'chess.js';


type ShortMove = {
  from: Square;
  to: Square;
  promotion?: 'q' ;
};

export type Fen = string;
export type GameWinner = 'b' | 'w' | 'd' |  null;
export type { Square, Move ,ShortMove  };


const newGame = (): Fen => 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const isNewGame =(fen: Fen): boolean  => fen === newGame();

const isBlackTurn = (fen: Fen): boolean => new Chess(fen).turn() === 'b';

const isWhiteTurn = (fen: Fen): boolean=> new Chess(fen).turn() === 'w';

const isCheck = (fen: Fen): boolean => new Chess(fen).isCheck();

const getGameWinner = (fen: Fen): GameWinner => {
  const game = new Chess(fen);
  return game.isCheckmate()? (game.turn() === 'w' ? 'b' : 'w') : null;
};

const isGameOver = (fen: Fen): boolean => new Chess(fen).isGameOver();

const isMoveable = (fen: Fen, from: Square): boolean =>
  new Chess(fen).moves({ square: from }).length > 0;

const move = (fen: Fen, from: Square, to: Square): [Fen, Move] | null => {
  const game = new Chess(fen);
  const action = game.move({ from, to, promotion: 'q' });
  return action ? [game.fen(), action] : null;
};

export {
  newGame,
  isNewGame,
  isBlackTurn,
  isWhiteTurn,
  isCheck,
  getGameWinner,
  isGameOver,
  isMoveable,
  move,
 }