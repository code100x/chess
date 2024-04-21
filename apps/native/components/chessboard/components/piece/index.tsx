import type { Move, Square } from 'chess.js';
import React, { useCallback, useImperativeHandle } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useChessboardProps } from '../../context/props-context/hooks';
import { useBoardOperations } from '../../context/board-operations-context/hooks';
import { useBoardPromotion } from '../../context/board-promotion-context/hooks';
import { usePieceRefs } from '../../context/board-refs-context/hooks';
import { useChessEngine } from '../../context/chess-engine-context/hooks';
import { useReversePiecePosition } from '../../notation';
import type { PieceType, Vector } from '../../types';

import { ChessPiece } from './visual-piece';

type PieceProps = {
  id: PieceType;
  startPosition: Vector;
  square: Square;
  size: number;
};

export type ChessPieceRef = {
  moveTo: (square: Square) => Promise<Move | undefined>;
  enable: (activate: boolean) => void;
};

const Piece = React.memo(
  React.forwardRef<ChessPieceRef, PieceProps>(
    ({ id, startPosition, square, size }, ref) => {
      const chess = useChessEngine();
      const refs = usePieceRefs();
      const pieceEnabled = useSharedValue(true);
      const { isPromoting } = useBoardPromotion();
      const { onSelectPiece, onMove, selectedSquare, turn } =
        useBoardOperations();

      const {
        durations: { move: moveDuration },
        gestureEnabled: gestureEnabledFromChessboardProps,
        boardOrientation,
      } = useChessboardProps();

      // const gestureEnabled = useDerivedValue(
      //   () => turn.value === id.charAt(0) && gestureEnabledFromChessboardProps,
      //   [id, gestureEnabledFromChessboardProps]
      // );

      const gestureEnabled = useDerivedValue(
        // () => (turn.value === id.charAt(0)) && (boardOrientation.charAt(0) === id.charAt(0)) && gestureEnabledFromChessboardProps,
        () => turn.value === id.charAt(0) && gestureEnabledFromChessboardProps,
        [id, gestureEnabledFromChessboardProps, boardOrientation],
      );

      // gestureEnabled.addListener(12222, () => {
      //   console.log(gestureEnabled.value)
      // })

      const { toPosition, toTranslation } = useReversePiecePosition();

      const isGestureActive = useSharedValue(false);
      const offsetX = useSharedValue(0);
      const offsetY = useSharedValue(0);
      const scale = useSharedValue(1);

      const translateX = useSharedValue(startPosition.x * size);
      const translateY = useSharedValue(startPosition.y * size);

      const validateMove = useCallback(
        (from: Square, to: Square) => {
          return chess
            .moves({ verbose: true })
            .find((m) => m.from === from && m.to === to);
        },
        [chess],
      );

      const wrappedOnMoveForJSThread = useCallback(
        ({ move }: { move: Move }) => {
          onMove(move.from, move.to);
        },
        [onMove],
      );

      const moveTo = useCallback(
        (from: Square, to: Square) => {
          return new Promise<Move | undefined>((resolve) => {
            const move = validateMove(from, to);
            const { x, y } = toTranslation(move ? move.to : from);
            translateX.value = withTiming(x, { duration: moveDuration }, () => {
              offsetX.value = translateX.value;
            });
            translateY.value = withTiming(
              y,
              { duration: moveDuration },
              (isFinished) => {
                if (!isFinished) return;
                offsetY.value = translateY.value;
                isGestureActive.value = false;
                if (move) {
                  runOnJS(wrappedOnMoveForJSThread)({ move });
                  // Ideally I must call the resolve method
                  // inside the "wrappedOnMoveForJSThread" after
                  // the "onMove" function.
                  // Unfortunately I'm not able to pass a
                  // function in the RunOnJS params
                  runOnJS(resolve)(move);
                } else {
                  runOnJS(resolve)(undefined);
                }
              },
            );
          });
        },
        [
          isGestureActive,
          moveDuration,
          offsetX,
          offsetY,
          toTranslation,
          translateX,
          translateY,
          validateMove,
          wrappedOnMoveForJSThread,
        ],
      );

      const movePiece = useCallback(
        (to: Square) => {
          const from = toPosition({ x: offsetX.value, y: offsetY.value });
          moveTo(from, to);
        },
        [moveTo, offsetX.value, offsetY.value, toPosition],
      );

      useImperativeHandle(
        ref,
        () => {
          return {
            moveTo: (to: Square) => {
              return moveTo(square, to);
            },
            enable: (active: boolean) => {
              pieceEnabled.value = active;
            },
          };
        },
        [moveTo, pieceEnabled, square],
      );

      const onStartTap = useCallback(
        // eslint-disable-next-line no-shadow
        (square: Square) => {
          'worklet';
          if (!onSelectPiece) {
            return;
          }
          runOnJS(onSelectPiece)(square);
        },
        [onSelectPiece],
      );

      const globalMoveTo = useCallback(
        (move: Move) => {
          refs?.current?.[move.from].current.moveTo?.(move.to);
        },
        [refs],
      );

      const handleOnBegin = useCallback(() => {
        const currentSquare = toPosition({
          x: translateX.value,
          y: translateY.value,
        });

        const previousTappedSquare = selectedSquare.value;
        const move =
          previousTappedSquare &&
          validateMove(previousTappedSquare, currentSquare);

        if (move) {
          runOnJS(globalMoveTo)(move);
          return;
        }
        if (!gestureEnabled.value) return;
        scale.value = withTiming(1.2);
        onStartTap(square);
      }, [
        gestureEnabled.value,
        globalMoveTo,
        onStartTap,
        scale,
        selectedSquare.value,
        square,
        toPosition,
        translateX.value,
        translateY.value,
        validateMove,
      ]);

      const gesture = Gesture.Pan()
        .enabled(!isPromoting && pieceEnabled.value)
        .onBegin(() => {
          offsetX.value = translateX.value;
          offsetY.value = translateY.value;
          runOnJS(handleOnBegin)();
        })
        .onStart(() => {
          if (!gestureEnabled.value) return;
          isGestureActive.value = true;
        })
        .onUpdate(({ translationX, translationY }) => {
          if (!gestureEnabled.value) return;
          if (boardOrientation === 'white') {
            translateX.value = offsetX.value + translationX;
            translateY.value = offsetY.value + translationY;
          } else {
            translateX.value = offsetX.value - translationX;
            translateY.value = offsetY.value - translationY;
          }
        })
        .onEnd(() => {
          if (!gestureEnabled.value) return;
          runOnJS(movePiece)(
            toPosition({ x: translateX.value, y: translateY.value }),
          );
        })
        .onFinalize(() => {
          scale.value = withTiming(1);
        });

      const style = useAnimatedStyle(() => {
        return {
          position: 'absolute',
          opacity: withTiming(pieceEnabled.value ? 1 : 0),
          zIndex: isGestureActive.value ? 100 : 10,
          transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
          ],
        };
      });

      const underlay = useAnimatedStyle(() => {
        const position = toPosition({
          x: translateX.value,
          y: translateY.value,
        });
        const translation = toTranslation(position);
        return {
          position: 'absolute',
          width: size * 2,
          height: size * 2,
          borderRadius: size,
          zIndex: 0,
          backgroundColor: isGestureActive.value
            ? 'rgba(0, 0, 0, 0.1)'
            : 'transparent',
          transform: [
            { translateX: translation.x - size / 2 },
            { translateY: translation.y - size / 2 },
          ],
        };
      }, [size]);

      return (
        <>
          <Animated.View style={underlay} />
          <GestureDetector gesture={gesture}>
            <Animated.View style={style}>
              <ChessPiece id={id} />
            </Animated.View>
          </GestureDetector>
        </>
      );
    },
  ),
  (prev, next) =>
    prev.id === next.id &&
    prev.size === next.size &&
    prev.square === next.square,
);

export default Piece;
