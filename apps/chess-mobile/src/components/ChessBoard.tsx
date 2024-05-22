import { LayoutChangeEvent, View } from 'react-native';
import { squareToCoordinate } from '~/lib/squareToCoordinate';
import { ChessBackground } from './ChessBackground';
import { Piece } from './Piece';
import { PossibleMoves } from './PossibleMoves';
import { RecentMoves } from './RecentMoves';
import { useRecoilState, useRecoilValue } from 'recoil';
import { boardState, squareSize } from '~/store/atoms';

interface ChessBoardProps {}
export const ChessBoard = ({}: ChessBoardProps) => {
  const board = useRecoilValue(boardState);
  const [size, setSize] = useRecoilState(squareSize);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setSize(height / 8);
  };
  return (
    <View className="overflow-hidden rounded" onLayout={handleLayout}>
      <ChessBackground />
      <PossibleMoves />
      <RecentMoves />
      {Boolean(size) &&
        board.map((row) =>
          row.map((square) => {
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
