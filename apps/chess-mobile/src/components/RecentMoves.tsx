import { Square } from 'chess.js';
import { View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useChess } from '~/contexts/chessContext';
import { squareToCoordinate } from '~/lib/squareToCoordinate';
import { lastmove } from '~/store/atoms/lastmove';

export function RecentMoves() {
  const { size } = useChess();
  const recent = useRecoilValue(lastmove);

  if (!recent) return null;

  return Object.values(recent).map((m, id) => {
    const { x, y } = squareToCoordinate(m);
    return (
      <View
        key={m}
        className="absolute items-center justify-center bg-yellow-400/10"
        style={{
          width: size,
          height: size,
          transform: [{ translateX: x * size }, { translateY: y * size }],
        }}
      />
    );
  });
}
