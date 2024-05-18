import { Chess, Color, PieceSymbol, Square } from 'chess.js';
import { useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import { ChessBackground } from './ChessBackground';
import { Piece } from './Piece';
import { squareToCoordinate } from '~/lib/squareToCoordinate';
import { useWebSocket } from '~/contexts/wsContext';
import { useChess } from '~/contexts/chessContext';

interface ChessBoardProps {}
export const ChessBoard = ({}: ChessBoardProps) => {
  const { chess, size, changeSize } = useChess();

  const board = chess.board();

  const handleLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    changeSize(height / 8);
  };
  return (
    <View className="overflow-hidden rounded" onLayout={handleLayout}>
      <ChessBackground />
      {Boolean(size) &&
        board.map((row) =>
          row.map((square) => {
            if (!square) return;
            const { x, y } = squareToCoordinate(square.square);
            return (
              <Piece key={square.square} id={`${square.color}${square.type}`} position={{ x, y }} />
            );
          })
        )}
    </View>
  );
};
