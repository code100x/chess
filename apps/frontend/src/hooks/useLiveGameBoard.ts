import { liveGamePositionAtom } from '@repo/store/chessBoard';
import { Chess, Color, Move, Square } from 'chess.js';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { usePlaySound } from './usePlaySound';
import { MOVE } from '@/screens/Game';
import {
  Piece,
  PromotionPieceOption,
} from 'react-chessboard/dist/chessboard/types';

interface IBoardState {
  moveFrom: Square | null;
  moveTo: Square | null;
  optionSquares: Record<string, any>;
  showPromotionDialog: boolean;
  rightClickedSquares: Record<string, any>;
}

const initialBoardState: IBoardState = {
  moveFrom: null,
  moveTo: null,
  optionSquares: {},
  showPromotionDialog: false,
  rightClickedSquares: {},
};

export const useLiveGameBoard = ({
  gameId,
  started,
  myColor,
  chess,
  socket,
}: {
  myColor: Color;
  gameId: string;
  started: boolean;
  chess: Chess;
  socket: WebSocket;
}) => {
  const [boardState, setBoardState] = useState<IBoardState>(initialBoardState);

  const [liveGamePosition, setLiveGamePosition] =
    useRecoilState(liveGamePositionAtom);

  const isMyTurn = myColor === chess.turn();
  const playSound = usePlaySound();

  const playMove = (move: Move) => {
    socket.send(
      JSON.stringify({
        type: MOVE,
        payload: {
          gameId,
          move: move,
        },
      }),
    );
    setLiveGamePosition(chess.fen());
    playSound(move);
    setBoardState(initialBoardState);
  };

  const handlePieceDrop = (from: Square, to: Square, piece: Piece) => {
    if (!started || !isMyTurn) {
      return false;
    }
    try {
      const move = chess.move({
        from,
        to,
        promotion: piece[1]?.toLowerCase() ?? 'q',
      });
      playMove(move);
      return true;
    } catch (err) {
      return false;
    }
  };

  function getMoveOptions(square: Square) {
    const moves = chess.moves({
      square,
      verbose: true,
    });
    const newSquares: Record<string, any> = {};
    moves.forEach((move) => {
      newSquares[move.to] = {
        background:
          chess.get(move.to) &&
          chess.get(move.to).color !== chess.get(square).color
            ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%',
      };
      return move;
    });
    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)',
    };

    setBoardState((prev) => ({ ...prev, optionSquares: newSquares }));
    return moves.length > 0;
  }

  const handlePromotionPieceSelect = (piece?: PromotionPieceOption) => {
    if (piece && boardState.moveFrom && boardState.moveTo) {
      try {
        const move = chess.move({
          from: boardState.moveFrom,
          to: boardState.moveTo,
          promotion: piece[1].toLowerCase() ?? 'q',
        });
        playMove(move);
        return true;
      } catch (err) {
        return false;
      }
    }
    return false;
  };
  const handleValidMove = (square: Square, foundMove: Move) => {
    setBoardState((prev) => ({
      ...prev,
      moveTo: square,
    }));

    if (
      foundMove.color === 'w' &&
      foundMove.piece === 'p' &&
      square[1] === '8'
    ) {
      setBoardState((prev) => ({ ...prev, showPromotionDialog: true }));
      return;
    }
    if (boardState.moveFrom) {
      try {
        const move = chess.move({
          from: boardState.moveFrom,
          to: square,
        });
        playMove(move);
      } catch (err) {
        handleMoveFrom(square);
      }
    }
  };

  const handleMoveFrom = (square: Square) => {
    const hasMoveOptions = getMoveOptions(square);
    setBoardState((prev) => ({
      ...prev,
      moveFrom: hasMoveOptions ? square : null,
    }));
  };

  const handleMoveTo = (square: Square) => {
    const { moveFrom } = boardState;
    if (!moveFrom) {
      return;
    }

    if (liveGamePosition !== chess.fen()) {
      setLiveGamePosition(chess.fen());
      return false;
    }

    const moves = chess.moves({
      square: moveFrom,
      verbose: true,
    });

    const foundMove = moves.find((m) => m.from === moveFrom && m.to === square);

    if (!foundMove) {
      handleMoveFrom(square);
    } else {
      handleValidMove(square, foundMove);
    }
  };

  const handleSquareClick = (square: Square) => {
    setBoardState((prev) => ({ ...prev, rightClickedSquares: {} }));
    if (!started || !isMyTurn) {
      return false;
    }

    const { moveFrom, moveTo } = boardState;

    // from square
    if (!moveFrom) {
      handleMoveFrom(square);
      return;
    }
    // to square
    if (!moveTo) {
      handleMoveTo(square);
    }
  };

  const handleSquareRightClick = (square: Square) => {
    const colour = 'rgba(0, 0, 255, 0.4)';
    setBoardState((prev) => ({
      ...prev,
      rightClickedSquares: {
        ...prev.rightClickedSquares,
        [square]:
          prev.rightClickedSquares[square]?.backgroundColor === colour
            ? {}
            : { backgroundColor: colour },
      },
    }));
  };

  return {
    boardState,
    handlePieceDrop,
    liveGamePosition,
    handleSquareClick,
    handlePromotionPieceSelect,
    handleSquareRightClick,
  };
};
