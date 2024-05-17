import { Chess, Color, PieceSymbol, Square } from 'chess.js';
import { useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import { ChessBackground } from './ChessBackground';
import { Piece } from './Piece';
import { squareToCoordinate } from '~/lib/squareToCoordinate';

interface ChessBoardProps {
  board: ({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][];
  chess: Chess
}
export const ChessBoard = ({ board, chess }: ChessBoardProps) => {
  const [size, setSize] = useState<number>(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setSize(height / 8);
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
              <Piece
                key={square.square}
                id={`${square.color}${square.type}`}
                position={{ x, y }}
                size={size}
                chess={chess}
              />
            );
          })
        )}
    </View>
  );
};
