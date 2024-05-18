import { Chess } from 'chess.js';
import { ReactNode, createContext, useContext, useEffect, useRef, useState } from 'react';

interface IChessContext {
  chess: Chess;
  size: number;
  changeSize: (value: number) => void;
}

const ChessContext = createContext<IChessContext>({
  chess: new Chess(),
  size: 0,
  changeSize() {},
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
  const board = chess.board();
  const changeSize = (value: number) => {
    setSize(value);
  };
  return (
    <ChessContext.Provider value={{ chess, size, changeSize }}>{children}</ChessContext.Provider>
  );
};
