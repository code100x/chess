import { LayoutChangeEvent, View } from 'react-native';
import { useChess } from '~/contexts/chessContext';
import { squareToCoordinate } from '~/lib/squareToCoordinate';
import { ChessBackground } from './ChessBackground';
import { Piece } from './Piece';

interface ChessBoardProps {}
export const ChessBoard = ({}: ChessBoardProps) => {
  const { size, changeSize, board } = useChess();

  const handleLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    changeSize(height / 8);
  };
  return (
    <View className="overflow-hidden rounded" onLayout={handleLayout}>
      <ChessBackground />
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
