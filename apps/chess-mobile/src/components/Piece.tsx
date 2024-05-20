import { Square } from 'chess.js';
import { useCallback, useState } from 'react';
import { Image } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { IMAGE_URL } from '~/constants';
import { useChess } from '~/contexts/chessContext';
import { useWebSocket } from '~/contexts/wsContext';
import { coordinateToSquare } from '~/lib/coordinateToSquare';
import { squareToCoordinate } from '~/lib/squareToCoordinate';
import { PossibleMoves } from './PossibleMoves';

interface PieceProps {
  id: string;
  position: { x: number; y: number };
}
export const Piece = ({ id, position }: PieceProps) => {
  const { socket } = useWebSocket();
  const { chess, size, updateBoard } = useChess();
  const [possibleMoves, setPossibleMoves] = useState<Square[]>([]);

  const pressed = useSharedValue<boolean>(false);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const translateX = useSharedValue<number>(position.x * size);
  const translateY = useSharedValue<number>(position.y * size);

  const movePiece = useCallback(
    (from: Square, to: Square) => {
      const move = chess.moves({ verbose: true }).find((m) => m.from === from && m.to === to);
      const { x, y } = squareToCoordinate(move ? to : from);
      translateX.value = withTiming(x * size);
      translateY.value = withTiming(y * size, {}, () => {
        pressed.value = false;
      });
      if (move) {
        chess.move(move);
        // if (!socket) {
        //   console.log('Piece Component: No SOCKET:', socket);
        //   return;
        // }
        // updateBoard();
        // console.log(chess.turn());

        // socket.send(
        //   JSON.stringify({
        //     type: 'move',
        //     payload: { from: move.from, to: move.to },
        //   })
        // );
      }
    },
    [socket, chess, size]
  );

  const movesOption = useCallback((from?: Square) => {
    if (!from) {
      setPossibleMoves([]);
      return;
    }
    const move = chess
      .moves({ verbose: true })
      .filter((m) => m.from === from)
      .map((m) => m.to);
    setPossibleMoves(move);
  }, []);

  const pan = Gesture.Pan()
    .onStart(() => {
      pressed.value = true;
      offsetX.value = translateX.value;
      offsetY.value = translateY.value;
      const from = coordinateToSquare({ x: offsetX.value / size, y: offsetY.value / size });
      runOnJS(movesOption)(from);
    })
    .onChange(({ translationX, translationY }) => {
      translateX.value = translationX + offsetX.value;
      translateY.value = translationY + offsetY.value;
    })
    .onFinalize(() => {
      // possibleMoves.value = [];
      const from = coordinateToSquare({ x: offsetX.value / size, y: offsetY.value / size });
      const to = coordinateToSquare({ x: translateX.value / size, y: translateY.value / size });
      runOnJS(movePiece)(from, to);
      runOnJS(movesOption)();
    });

  const animatedStyles = useAnimatedStyle(() => ({
    zIndex: pressed.value ? 999999 : 0,
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
  }));

  return (
    <>
      <PossibleMoves moves={possibleMoves} />
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
    </>
  );
};
