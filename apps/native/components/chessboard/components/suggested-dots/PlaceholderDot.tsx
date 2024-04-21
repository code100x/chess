import type { Square } from 'chess.js';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import { useChessboardProps } from '../../context/props-context/hooks';

import { useReversePiecePosition } from '../../notation';

type PlaceholderDotProps = {
  x: number;
  y: number;
  selectableSquares: Animated.SharedValue<Square[]>;
  moveTo?: (to: Square) => void;
};

const PlaceholderDot: React.FC<PlaceholderDotProps> = React.memo(
  ({ x, y, selectableSquares, moveTo }) => {
    const { pieceSize } = useChessboardProps();
    const { toPosition, toTranslation } = useReversePiecePosition();

    const currentSquare = toPosition({ x: x * pieceSize, y: y * pieceSize });
    const translation = useMemo(
      () => toTranslation(currentSquare),
      [currentSquare, toTranslation],
    );

    const isSelectable = useDerivedValue(() => {
      'worklet';
      return (
        selectableSquares.value
          .map((square) => square.includes(currentSquare))
          .filter((v) => v).length > 0
      );
    }, [currentSquare, selectableSquares.value]);

    const rPlaceholderStyle = useAnimatedStyle(() => {
      const canBeSelected = isSelectable.value;
      return { opacity: withTiming(canBeSelected ? 0.15 : 0) };
    }, []);

    return (
      <View
        onTouchEnd={() => {
          if (isSelectable.value && moveTo) {
            runOnJS(moveTo)(currentSquare);
          }
        }}
        style={[
          styles.placeholderContainer,
          {
            width: pieceSize,
            padding: pieceSize / 3.2,
            transform: [
              { translateX: translation.x },
              { translateY: translation.y },
            ],
          },
        ]}
      >
        <Animated.View
          style={[
            { borderRadius: pieceSize },
            styles.placeholder,
            rPlaceholderStyle,
          ]}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  placeholderContainer: {
    position: 'absolute',
    aspectRatio: 1,
    backgroundColor: 'transparent',
  },
  placeholder: {
    flex: 1,
    backgroundColor: 'black',
    opacity: 0.2,
  },
});

export { PlaceholderDot };
