import { Chess, Color, PieceSymbol, Square } from 'chess.js';
import { ReactNode, createContext, useContext, useEffect, useRef, useState } from 'react';

interface IChessContext {
  chess: Chess;
  size: number;
  changeSize: (value: number) => void;
  board: ({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][];
  updateBoard: () => void;
}

const ChessContext = createContext<IChessContext>({
  chess: new Chess(),
  size: 0,
  changeSize() {},
  board: [[null]],
  updateBoard() {},
});

export function useChess() {
  const value = useContext(ChessContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useWebSocket must be wrapped in a <ChessProvider />');
    }
  }
  return value;
}
export const ChessProvider = ({ children }: { children: ReactNode }) => {
  const [size, setSize] = useState<number>(0);
  const chess = useRef(new Chess()).current;
  const [board, setBoard] = useState(chess.board());

  const changeSize = (value: number) => {
    setSize(value);
  };

  const updateBoard = () => {
    setBoard(chess.board());
  };

  return (
    <ChessContext.Provider value={{ chess, size, changeSize, board, updateBoard }}>
      {children}
    </ChessContext.Provider>
  );
};
