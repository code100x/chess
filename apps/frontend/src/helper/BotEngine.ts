import {Chess } from 'chess.js';
import type { Square, Move } from 'chess.js';
type ShortMove = {
  from: Square;
  to: Square;
  promotion?: 'q' ;
};
export type Fen = string;
export type GameWinner = 'b' | 'w' | null;
export type { Square, Move, ShortMove };


const newGame = (): Fen => 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const isNewGame = (fen: Fen): boolean => fen === newGame();

const isBlackTurn = (fen: Fen): boolean =>  {
  const game = new Chess(fen);
  return game.turn() === 'b';

}
const isWhiteTurn = (fen: Fen): boolean => {
  const game = new Chess(fen);
  return game.turn() === 'w';

}

const isCheck = (fen: Fen): boolean => {
  const game = new Chess(fen);
  return game.inCheck();

}

const getPiece = (fen:Fen , square: Square): string => {
  const game = new Chess(fen);
  return game.get(square).type;
}
const getGameWinner = (fen: Fen): GameWinner => {
  const game = new Chess(fen);
  return game.isCheckmate() ? (game.turn() === 'w' ? 'b' : 'w') : null;
};

const isGameOver = (fen: Fen): boolean => {
  const game = new Chess(fen);
  return game.isGameOver();
}

const isMoveable = (fen: Fen, from: Square): boolean =>{
  const game = new Chess(fen);
  return game.moves({ square: from }).length > 0;
}

const getPossibleMoves = (fen: Fen, from: Square): Move[] => {
  const game = new Chess(fen);
  return game.moves({ square: from , verbose: true });
}

const move = (fen: Fen, from: Square, to: Square): [Fen, Move] | null => {
  const game = new Chess(fen);
  try{
    const action = game.move({ from, to, promotion: 'q' });
    return action ? [game.fen(), action] : null;
  
  }catch(err){
    return null;
  }
};


export {
  newGame,
  getPossibleMoves,
  getPiece,
  isNewGame,
  isBlackTurn,
  isWhiteTurn,
  isCheck,
  getGameWinner,
  isGameOver,
  isMoveable,
  move,
 }
