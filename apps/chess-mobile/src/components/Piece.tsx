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
import { RecentMoves } from './RecentMoves';
import { useSetRecoilState } from 'recoil';
import { lastmove } from '~/store/atoms/lastmove';

interface PieceProps {
  id: string;
  position: { x: number; y: number };
}
export const Piece = ({ id, position }: PieceProps) => {
  const { socket } = useWebSocket();
  const { chess, size, updateBoard } = useChess();
  const [possibleMoves, setPossibleMoves] = useState<Square[]>([]);
  const setRecentMove = useSetRecoilState(lastmove);

  const pressed = useSharedValue<boolean>(false);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const translateX = useSharedValue<number>(position.x * size);
  const translateY = useSharedValue<number>(position.y * size);

  const movePiece = useCallback(
    (from: Square, to: Square) => {
      movesOption();
      const move = chess.moves({ verbose: true }).find((m) => m.from === from && m.to === to);
      const { x, y } = squareToCoordinate(move ? to : from);
      translateX.value = withTiming(x * size, { duration: 200 });
      translateY.value = withTiming(y * size, { duration: 200 }, () => {});
      if (move) {
        chess.move(move);
        setRecentMove({ from: move.from, to: move.to });
        if (!socket) {
          console.log('Piece Component: No SOCKET:', socket);
          return;
        }
        updateBoard();
        socket.send(
          JSON.stringify({
            type: 'move',
            payload: { from: move.from, to: move.to },
          })
        );
      }
    },
    [socket, chess, size]
  );

  const movesOption = useCallback(
    (from?: Square) => {
      if (!from) {
        setPossibleMoves([]);
        return;
      }
      const move = chess
        .moves({ verbose: true })
        .filter((m) => m.from === from)
        .map((m) => m.to);
      setPossibleMoves(move);
    },
    [chess]
  );

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
      pressed.value = false;
      const from = coordinateToSquare({ x: offsetX.value / size, y: offsetY.value / size });
      const to = coordinateToSquare({ x: translateX.value / size, y: translateY.value / size });
      runOnJS(movePiece)(from, to);
    });

  const animatedStyles = useAnimatedStyle(() => ({
    zIndex: pressed.value ? 100 : 10,
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
  }));

  const toStyles = useAnimatedStyle(() => {
    const coord = coordinateToSquare({ x: translateX.value / size, y: translateY.value / size });
    const { x, y } = squareToCoordinate(coord);
    return {
      backgroundColor: pressed.value ? '#rgba(40, 40, 40, .25)' : 'transparent',
      transform: [{ translateX: x * size }, { translateY: y * size }],
    };
  });

  return (
    <>
      <Animated.View className="absolute z-0" style={[{ width: size, height: size }, toStyles]} />
      <RecentMoves />
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
