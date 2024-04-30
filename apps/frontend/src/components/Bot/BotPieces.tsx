import React from 'react';

type PieceProps = {
  squareWidth: number;
  isDragging: boolean;
};

const createPiece = (piece: string) => ({ squareWidth, isDragging }: PieceProps) => (
  <img
    style={{
      width: isDragging ? squareWidth : squareWidth * 1,
      height: isDragging ? squareWidth : squareWidth
    }}
    src={`${piece}.png`}
    alt={piece}
  />
);

const BotPieces: { [key: string]: React.FC<PieceProps> } = {
  wK: createPiece('wk'),
  wQ: createPiece('wq'),
  wR: createPiece('wr'),
  wB: createPiece('wb'),
  wN: createPiece('wn'),
  wP: createPiece('wp'),
  bK: createPiece('bk'),
  bQ: createPiece('bq'),
  bR: createPiece('br'),
  bB: createPiece('bb'),
  bN: createPiece('bn'),
  bP: createPiece('bp'),
};

export default BotPieces;