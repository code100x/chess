import { View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useRecoilValue } from 'recoil';
import { squareToCoordinate } from '~/lib/squareToCoordinate';
import { possibleMoves, squareSize } from '~/store/atoms';

export function PossibleMoves() {
  const size = useRecoilValue(squareSize);
  const moves = useRecoilValue(possibleMoves);

  return moves.map((m, id) => {
    const { x, y } = squareToCoordinate(m);
    return (
      <Animated.View
        entering={FadeIn.delay(id * 10).duration(200)}
        exiting={FadeOut.duration(200)}
        key={m}
        className="absolute items-center justify-center bg-yellow-400/10"
        style={{
          width: size,
          height: size,
          transform: [{ translateX: x * size }, { translateY: y * size }],
        }}>
        <View className="aspect-square w-1/2 rounded-full bg-black/30" />
      </Animated.View>
    );
  });
}
