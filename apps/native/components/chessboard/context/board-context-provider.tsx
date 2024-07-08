import { Chess } from 'chess.js';
import React, { useImperativeHandle, useMemo, useRef, useState } from 'react';
import type { ChessboardState } from '../helpers/get-chessboard-state';
import { useConst } from '../hooks/use-const';

import { BoardContext, BoardSetterContext } from './board-context';
import {
  BoardOperationsContextProvider,
  BoardOperationsRef,
} from './board-operations-context';
import { BoardPromotionContextProvider } from './board-promotion-context';
import { BoardRefsContextProvider, ChessboardRef } from './board-refs-context';
import { ChessEngineContext } from './chess-engine-context';

type BoardContextProviderProps = {
  fen?: string;
  children?: React.ReactNode;
};

const ChessboardContextProviderComponent = React.forwardRef<
  ChessboardRef,
  BoardContextProviderProps
>(({ children, fen }, ref) => {
  const chess = useConst(() => new Chess(fen));
  const chessboardRef = useRef<ChessboardRef>(null);
  const boardOperationsRef = useRef<BoardOperationsRef>(null);

  const [board, setBoard] = useState(chess.board());

  const chessboardController: ChessboardRef = useMemo(() => {
    return {
      move: (params) => chessboardRef.current?.move?.(params),
      highlight: (params) => chessboardRef.current?.highlight(params),
      resetAllHighlightedSquares: () =>
        chessboardRef.current?.resetAllHighlightedSquares(),
      getState: () => chessboardRef?.current?.getState() as ChessboardState,
      resetBoard: (params) => {
        chessboardRef.current?.resetBoard(params);
        boardOperationsRef.current?.reset();
      },
    };
  }, []);

  useImperativeHandle(ref, () => chessboardController, [chessboardController]);

  return (
    <BoardContext.Provider value={board}>
      <BoardPromotionContextProvider>
        <ChessEngineContext.Provider value={chess}>
          <BoardSetterContext.Provider value={setBoard}>
            <BoardRefsContextProvider ref={chessboardRef}>
              <BoardOperationsContextProvider
                ref={boardOperationsRef}
                controller={chessboardController}
              >
                {children}
              </BoardOperationsContextProvider>
            </BoardRefsContextProvider>
          </BoardSetterContext.Provider>
        </ChessEngineContext.Provider>
      </BoardPromotionContextProvider>
    </BoardContext.Provider>
  );
});

const ChessboardContextProvider = React.memo(
  ChessboardContextProviderComponent,
);
export {
  ChessboardContextProvider,
  ChessEngineContext,
  BoardContext,
  BoardSetterContext,
};
