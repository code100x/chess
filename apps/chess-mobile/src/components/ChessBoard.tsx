import { TextProps, View } from "react-native";
import { Text as ThemedText } from './Themed';
import { Color, PieceSymbol, Square } from "chess.js";
import { cn } from "~/lib/utils";
import { BoardNotation } from "./BoardNotation";
import { FILES } from "~/constants";

const Text = (props: TextProps) => {
  return <ThemedText maxFontSizeMultiplier={1} {...props} />;
};

interface ChessBoardProps {
  board: ({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][]
}
export const ChessBoard = ({ board }: ChessBoardProps) => {
  return (
    <View className="overflow-hidden rounded">
      {board.map((row, i) => (
        <View key={i} className="flex-row">
          {row.map((square, j) => {
            const white = (i + j) % 2 === 0;
            return (
              <View
                key={`${i}${j}`}
                className={cn(
                  'relative aspect-square flex-1 p-1',
                  white ? 'bg-[#EBEDD0]' : 'bg-[#739552]'
                )}
              >
                {square && <Text>{square.color}{square.type}</Text>}
                {j === 0 && (
                  <BoardNotation white={white} value={i + 1} />
                )}
                {i === board.length - 1 && (
                  <BoardNotation white={white} value={FILES[j]} position={"bottom-right"} />
                )}
              </View>
            )
          })}
        </View>
      ))}
    </View>
  );
};
