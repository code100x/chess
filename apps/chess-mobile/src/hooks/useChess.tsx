import { Chess, Move } from 'chess.js';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { chessState } from '~/store/atoms';

export const useChess = () => {
  const [chess, setChess] = useRecoilState(chessState);

  const updateBoard = () => {
    setChess((prev) => {
      const newChess = new Chess();
      newChess.loadPgn(prev.pgn());
      return newChess;
    });
  };

  const getMoves = () => {
    const newChess = new Chess(chess.fen());
    return newChess.moves({ verbose: true });
  };

  const makeMove = (move: Move) => {
    setChess((prev) => {
      const newChess = new Chess(prev.fen());
      newChess.move(move);
      return newChess;
    });
  };
  return { updateBoard, getMoves, makeMove };
};
