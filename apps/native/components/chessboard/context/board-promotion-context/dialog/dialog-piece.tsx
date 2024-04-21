import type { PieceType } from 'chess.js';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { Player } from '../../../types';
import { ChessPiece } from '../../../components/piece/visual-piece';
import { useChessboardProps } from '../../../context/props-context/hooks';

type DialogPieceProps = {
  index: number;
  width: number;
  type: Player;
  piece: PieceType;
  onSelectPiece?: (piece: PieceType) => void;
};

const DialogPiece: React.FC<DialogPieceProps> = React.memo(
  ({ index, width, type, piece, onSelectPiece }) => {
    const isTapActive = useSharedValue(false);
    const {
      colors: { promotionPieceButton },
    } = useChessboardProps();

    const gesture = Gesture.Tap()
      .onBegin(() => {
        isTapActive.value = true;
      })
      .onTouchesUp(() => {
        if (onSelectPiece) runOnJS(onSelectPiece)(piece);
      })
      .onFinalize(() => {
        isTapActive.value = false;
      })
      .shouldCancelWhenOutside(true)
      .maxDuration(10000);

    const rStyle = useAnimatedStyle(() => {
      return {
        opacity: withTiming(isTapActive.value ? 1 : 0, { duration: 150 }),
      };
    }, []);

    return (
      <GestureDetector gesture={gesture}>
        <Animated.View>
          <Animated.View
            style={[
              {
                width,
                position: 'absolute',
                backgroundColor: promotionPieceButton,
                aspectRatio: 1,
                borderTopLeftRadius: index === 0 ? 5 : 0,
                borderBottomLeftRadius: index === 1 ? 5 : 0,
                borderTopRightRadius: index === 2 ? 5 : 0,
                borderBottomRightRadius: index === 3 ? 5 : 0,
              } as const,
              rStyle,
            ]}
          />
          <View
            style={[
              {
                width,
                borderLeftWidth: index === 3 || index === 2 ? 1 : 0,
                borderTopWidth: index % 2 !== 0 ? 1 : 0,
              } as const,
              styles.pieceContainer,
            ]}
          >
            <ChessPiece id={`${type}${piece}`} />
          </View>
        </Animated.View>
      </GestureDetector>
    );
  },
);

const styles = StyleSheet.create({
  pieceContainer: {
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 0,
    borderColor: 'rgba(0,0,0,0.2)',
  },
});

export { DialogPiece };
