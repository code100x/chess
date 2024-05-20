import { Square } from 'chess.js';
import { View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useChess } from '~/contexts/chessContext';
import { squareToCoordinate } from '~/lib/squareToCoordinate';

export function PossibleMoves({ moves }: { moves: Square[] }) {
  const { size } = useChess();
  return moves.map((m, id) => {
    const { x, y } = squareToCoordinate(m);
    return (
      <Animated.View
        entering={FadeIn.delay(id * 10).duration(200)}
        exiting={FadeOut.duration(200)}
        key={m}
        className="absolute items-center justify-center bg-yellow-400/30"
        style={{
          width: size,
          height: size,
          transform: [{ translateX: x * size }, { translateY: y * size }],
        }}>
        <View className="aspect-square w-1/2 rounded-full bg-black/20" />
      </Animated.View>
    );
  });
}
