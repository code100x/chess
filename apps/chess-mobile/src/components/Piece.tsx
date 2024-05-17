import { Chess, Square } from 'chess.js';
import { useCallback } from 'react';
import { Image } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { IMAGE_URL } from '~/constants';
import { coordinateToSquare } from '~/lib/coordinateToSquare';
import { squareToCoordinate } from '~/lib/squareToCoordinate';


interface PieceProps {
  id: string;
  position: { x: number; y: number };
  size: number;
  chess: Chess;
}
export const Piece = ({ id, position, size, chess }: PieceProps) => {
  const pressed = useSharedValue<boolean>(false);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const translateX = useSharedValue<number>(position.x * size);
  const translateY = useSharedValue<number>(position.y * size);

  const movePiece = useCallback((from: Square, to: Square) => {
    const move = chess.moves({ verbose: true }).find(m => m.from === from && m.to === to);
    const { x, y } = squareToCoordinate(move ? to : from);
    translateX.value = x * size;
    translateY.value = y * size;
    if (move) {
      chess.move(move);
    }
  }, []);

  const pan = Gesture.Pan()
    .onStart(() => {
      pressed.value = true;
      offsetX.value = translateX.value;
      offsetY.value = translateY.value;
    })
    .onChange(({ translationX, translationY }) => {
      translateX.value = translationX + offsetX.value;
      translateY.value = translationY + offsetY.value;
    })
    .onFinalize(() => {
      pressed.value = false;
      const from = coordinateToSquare({ x: offsetX.value / size, y: offsetY.value / size });
      const to = coordinateToSquare({ x: translateX.value / size, y: translateY.value / size });
      runOnJS(movePiece)(from, to);
    });

  const animatedStyles = useAnimatedStyle(() => ({
    zIndex: pressed.value ? 999999 : 0,
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
  }));
  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          {
            width: size,
            height: size,
          },
          animatedStyles,
        ]}
        className="absolute">
        <Image source={IMAGE_URL[id]} className="h-full w-full max-w-full" />
      </Animated.View>
    </GestureDetector>
  );
};
