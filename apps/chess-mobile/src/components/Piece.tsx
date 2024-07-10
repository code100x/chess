import { Square } from 'chess.js';
import { useCallback } from 'react';
import { Image } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';
import { IMAGE_URL } from '~/constants';
import { useWebSocket } from '~/contexts/wsContext';
import { useChess } from '~/hooks/useChess';
import { useCoordinates } from '~/hooks/useCoordinates';
import { cn } from '~/lib/utils';
import {
  chessState,
  gameId,
  moveStore,
  myColor,
  possibleMoves,
  selectedMoveIndex,
  squareSize,
} from '~/store/atoms';

interface PieceProps {
  id: string;
  position: { x: number; y: number };
}
export const Piece = ({ id, position }: PieceProps) => {
  const { socket } = useWebSocket();
  const { getMoves, makeMove } = useChess();
  const chess = useRecoilValue(chessState);
  const size = useRecoilValue(squareSize);
  const setPossibleMoves = useSetRecoilState(possibleMoves);
  const setSelectedMove = useSetRecoilState(selectedMoveIndex);
  const { coordinateToSquare, squareToCoordinate } = useCoordinates();
  const color = useRecoilValue(myColor);
  const allMoves = useRecoilCallback(
    ({ snapshot }) =>
      () =>
        snapshot.getLoadable(moveStore).getValue()
  );
  const getGameId = useRecoilCallback(
    ({ snapshot }) =>
      () =>
        snapshot.getLoadable(gameId).getValue(),
    []
  );
  const selectedMove = useRecoilCallback(
    ({ snapshot }) =>
      () =>
        snapshot.getLoadable(selectedMoveIndex).getValue(),
    []
  );

  const pressed = useSharedValue<boolean>(false);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const translateX = useSharedValue<number>(position.x);
  const translateY = useSharedValue<number>(position.y);

  const movePiece = useCallback(
    (from: Square, to: Square) => {
      const move = getMoves().find((m) => m.from === from && m.to === to);
      if (move) {
        if (!socket) {
          console.log('Piece Component: No SOCKET:', socket);
          return;
        }
        // updateBoard();
        socket.send(
          JSON.stringify({
            type: 'move',
            payload: { gameId: getGameId(), move },
          })
        );
      }
      const { x, y } = squareToCoordinate(move ? to : from);
      translateX.value = x;
      translateY.value = y;
      movesOption();
    },
    [socket, chess, size]
  );

  const movesOption = useCallback(
    (from?: Square) => {
      if (selectedMove() !== null) {
        const { x, y } = squareToCoordinate(from!);
        translateX.value = x;
        translateY.value = y;
        const moves = allMoves();
        makeMove(moves[moves.length - 1]);
        setSelectedMove(null);
        return false;
      }
      if (!from) {
        setPossibleMoves([]);
        return;
      }
      const move = getMoves()
        .filter((m) => m.from === from)
        .map((m) => m.to);
      setPossibleMoves(move);
    },
    [chess]
  );

  const pan = Gesture.Pan()
    .enabled(color === id.at(0))
    .onBegin(() => {
      pressed.value = true;
      offsetX.value = translateX.value;
      offsetY.value = translateY.value;
      const from = coordinateToSquare({ x: offsetX.value, y: offsetY.value });
      runOnJS(movesOption)(from);
    })
    .onChange(({ translationX, translationY }) => {
      translateX.value = translationX + offsetX.value;
      translateY.value = translationY + offsetY.value;
    })
    .onFinalize(() => {
      pressed.value = false;
      const from = coordinateToSquare({ x: offsetX.value, y: offsetY.value });
      const to = coordinateToSquare({ x: translateX.value, y: translateY.value });
      runOnJS(movePiece)(from, to);
    });

  const animatedStyles = useAnimatedStyle(() => ({
    zIndex: pressed.value ? 100 : 10,
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
  }));

  const toStyles = useAnimatedStyle(() => {
    const coord = coordinateToSquare({ x: translateX.value, y: translateY.value });
    const { x, y } = squareToCoordinate(coord);
    return {
      backgroundColor: pressed.value ? '#rgba(40, 40, 40, .25)' : 'transparent',
      transform: [{ translateX: x }, { translateY: y }],
    };
  });

  const isKingInCheckSquare = chess.inCheck() && id.at(1) === 'k' && id.at(0) === chess.turn();
  return (
    <>
      <Animated.View className="absolute z-0" style={[{ width: size, height: size }, toStyles]} />
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            {
              width: size,
              height: size,
            },
            animatedStyles,
          ]}
          className={cn('absolute', isKingInCheckSquare && 'bg-red-500')}>
          <Image source={IMAGE_URL[id]} className="h-full w-full max-w-full" />
        </Animated.View>
      </GestureDetector>
    </>
  );
};
