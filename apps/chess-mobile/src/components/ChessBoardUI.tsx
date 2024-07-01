import { Chess } from 'chess.js';
import { useState } from 'react';
import { Image, LayoutChangeEvent, View } from 'react-native';
import { IMAGE_URL } from '~/constants';
import { ChessBackground } from './ChessBackground';

const board = new Chess().board();

export const ChessBoardUI = () => {
  const [size, setSize] = useState<number>(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setSize(height / 8);
  };

  return (
    <View className="overflow-hidden rounded" onLayout={handleLayout}>
      <ChessBackground />
      {board.map((row, i) =>
        row.map((square, j) => {
          const pieceImage = square ? `${square.color}${square.type}` : null;
          if (!pieceImage) return;
          return (
            <Image
              style={{
                height: size,
                width: size,
                transform: [{ translateX: j * size }, { translateY: i * size }],
              }}
              key={square?.square}
              source={IMAGE_URL[pieceImage]}
              className="absolute max-w-full "
            />
          );
        })
      )}
    </View>
  );
};
