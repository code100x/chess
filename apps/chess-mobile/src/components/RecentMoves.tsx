import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useRecoilValue } from 'recoil';
import { useCoordinates } from '~/hooks/useCoordinates';
import { isFlipped, lastmove, squareSize } from '~/store/atoms';

export function RecentMoves() {
  const size = useRecoilValue(squareSize);
  const recent = useRecoilValue(lastmove);
  const { squareToCoordinate } = useCoordinates();

  if (!recent) return null;

  return Object.values(recent).map((m, id) => {
    const { x, y } = squareToCoordinate(m);
    return (
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        key={m}
        className="absolute items-center justify-center bg-yellow-400/50"
        style={{
          width: size,
          height: size,
          transform: [{ translateX: x }, { translateY: y }],
        }}
      />
    );
  });
}
