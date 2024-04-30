import Chessboard from 'chessboardjsx';
import React from 'react';
import * as engine from '../../helper/BotEngine';
import BotPieces from './BotPieces';
import { SelectedBot } from './BotSelector';

type BoardMove = {
  sourceSquare: engine.Square;
  targetSquare: engine.Square;
};

interface BotChessBoardProps {
  fen: engine.Fen;
  onDragStart: (sourceSquare: Pick<BoardMove, 'sourceSquare'>) => boolean;
  onMovePiece: (move: BoardMove) => void;
  Bot:SelectedBot;
  onSquareClick?: (square: engine.Square) => void;
  onMouseOutSquare?: (square: engine.Square) => void
  squareStyles?: {};
  dropSquareStyle?: {};
  onDragOverSquare?: (square: engine.Square) => void;
  isPlaying: boolean;

} 

const BotChessBoard: React.FC<BotChessBoardProps> = ({
  fen,
  onDragStart,
  onMovePiece,
  Bot,
  onSquareClick,
  onMouseOutSquare,
  squareStyles,
  dropSquareStyle,
  onDragOverSquare,
  isPlaying
}) => {
  return (
    <Chessboard
      position={fen}
      allowDrag={onDragStart}
      onDrop={onMovePiece}
      onMouseOutSquare={isPlaying ? onMouseOutSquare : ()=>{}}
      dropOffBoard="trash"
      sparePieces={false}
      width={650}
      lightSquareStyle={{ backgroundColor: Bot?.squareColor.light}}
      darkSquareStyle={{ backgroundColor: Bot?.squareColor.dark }}
      squareStyles={squareStyles}
      dropSquareStyle={dropSquareStyle}
      pieces={BotPieces}
      onDragOverSquare={onDragOverSquare}
      onSquareClick={isPlaying ? onSquareClick : ()=>{}}  
    />
  );
};

export default BotChessBoard;
