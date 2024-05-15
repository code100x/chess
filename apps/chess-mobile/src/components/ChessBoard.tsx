import { Color, PieceSymbol, Square } from 'chess.js';
import { useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import { ChessBackground } from './ChessBackground';
import { Piece } from './Piece';

interface ChessBoardProps {
  board: ({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][];
}
export const ChessBoard = ({ board }: ChessBoardProps) => {
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
            const xAxis = square.square.at(0)!.charCodeAt(0) - 97;
            const yAxis = 8 - parseInt(square.square.at(1)!);
            return (
              <Piece
                key={square.square}
                id={`${square.color}${square.type}`}
                position={{ x: xAxis, y: yAxis }}
                size={size}
              />
            );
          })
        )}
    </View>
  );
};
