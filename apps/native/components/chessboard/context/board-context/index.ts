import type { ChessInstance, PieceType } from 'chess.js';
import React, { createContext } from 'react';
import type { Player } from '../../types';
import { useContext } from 'react';

const BoardContext = createContext<ReturnType<ChessInstance['board']>>(
  {} as any,
);

const BoardSetterContext = createContext<
  React.Dispatch<
    React.SetStateAction<
      ({
        type: PieceType;
        color: Player;
      } | null)[][]
    >
  >
>({} as any);

const useBoard = () => {
  return useContext(BoardContext);
};

const useSetBoard = () => {
  return useContext(BoardSetterContext);
};

export { BoardContext, BoardSetterContext, useBoard, useSetBoard };
