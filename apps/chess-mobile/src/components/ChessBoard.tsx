import { LayoutChangeEvent, View } from 'react-native';
import { ChessBackground } from './ChessBackground';
import { Piece } from './Piece';
import { PossibleMoves } from './PossibleMoves';
import { RecentMoves } from './RecentMoves';
import { useRecoilState, useRecoilValue } from 'recoil';
import { boardState, isFlipped, squareSize } from '~/store/atoms';
import { useCallback } from 'react';
import { useCoordinates } from '~/hooks/useCoordinates';

interface ChessBoardProps {}
export const ChessBoard = ({}: ChessBoardProps) => {
  const board = useRecoilValue(boardState);
  const flipped = useRecoilValue(isFlipped);
  const [size, setSize] = useRecoilState(squareSize);
  const { squareToCoordinate } = useCoordinates();

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { height } = event.nativeEvent.layout;
      setSize(height / 8);
    },
    [size]
  );
  return (
    <View className="overflow-hidden rounded" onLayout={handleLayout}>
      <ChessBackground />
      <PossibleMoves />
      <RecentMoves />
      {Boolean(size) &&
        (flipped ? board.slice().reverse() : board).map((row) =>
          (flipped ? row.slice().reverse() : row).map((square) => {
            if (!square) return;
            const { x, y } = squareToCoordinate(square.square);
            return (
              <Piece key={square.square} id={`${square.color}${square.type}`} position={{ x, y }} />
            );
          })
        )}
    </View>
  );
};
