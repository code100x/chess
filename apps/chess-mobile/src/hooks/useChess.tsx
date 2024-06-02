import { Chess, Move } from 'chess.js';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { chessState } from '~/store/atoms';

export const useChess = () => {
  const [chess, setChess] = useRecoilState(chessState);

  const getMoves = () => {
    const newChess = new Chess(chess.fen());
    return newChess.moves({ verbose: true });
  };

  const makeMove = (move: Move) => {
    setChess((prev) => {
      const newChess = new Chess();
      newChess.load(move.after);
      return newChess;
    });
  };

  return { getMoves, makeMove };
};
