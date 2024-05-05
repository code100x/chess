import { Square } from "chess.js";
import React from 'react';
import { Chessboard } from "react-chessboard";
import * as engine from '../../helper/BotEngine';
import BotPieces from './BotPieces';
import { SelectedBot } from './BotSelector';

interface BotChessBoardProps {
  fen: engine.Fen;
  onMovePiece: (sourceSquare: Square, targetSquare: Square) => boolean;
  Bot:SelectedBot;
} 

const BotChessBoard2: React.FC<BotChessBoardProps> = ({
  fen,
  onMovePiece,
  Bot
}) => {
  return (
    <Chessboard
      position={fen}
      onPieceDrop={(sourceSquare, targetSquare) => onMovePiece(sourceSquare, targetSquare)}
      id="computer"
      animationDuration={200}
      customLightSquareStyle={{ backgroundColor: Bot?.squareColor.light || ''}}
      customDarkSquareStyle={{ backgroundColor: Bot?.squareColor.dark || '' }}
      customPieces={BotPieces}
      boardWidth={625}
    />
  );
};

export default BotChessBoard2;
