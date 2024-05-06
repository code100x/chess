import { BoardOrientation } from '@repo/store/chessBoard';
import { Chess, Color } from 'chess.js';
import { useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { useRecoilState } from 'recoil';
import { boardOrientationAtom } from '../../../../packages/store/src/atoms/chessBoard';
import { useLiveGameBoard } from '@/hooks/useLiveGameBoard';

const ChessBoardLatest = ({
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
  const {
    boardState,
    handlePieceDrop,
    liveGamePosition,
    handleSquareClick,
    handlePromotionPieceSelect,
    handleSquareRightClick,
  } = useLiveGameBoard({
    gameId,
    started,
    myColor,
    chess,
    socket,
  });
  const [boardOrientation, setBoardOrientation] =
    useRecoilState(boardOrientationAtom);

  useEffect(() => {
    setBoardOrientation(
      myColor === 'w' ? BoardOrientation.WHITE : BoardOrientation.BLACK,
    );
  }, [myColor]);

  return (
    <Chessboard
      onPieceDrop={handlePieceDrop}
      position={liveGamePosition}
      arePremovesAllowed={true}
      onSquareClick={handleSquareClick}
      onPromotionPieceSelect={handlePromotionPieceSelect}
      onSquareRightClick={handleSquareRightClick}
      isDraggablePiece={({ piece }) => piece[0] === myColor}
      customSquareStyles={{
        ...boardState.optionSquares,
        ...boardState.rightClickedSquares,
      }}
      customBoardStyle={{
        borderRadius: '4px',
      }}
      promotionToSquare={boardState.moveTo}
      showPromotionDialog={boardState.showPromotionDialog}
      boardOrientation={boardOrientation}
    />
  );
};

export default ChessBoardLatest;
