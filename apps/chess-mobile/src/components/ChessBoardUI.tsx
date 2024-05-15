import { Image, TextProps, View } from 'react-native';
import { cn } from '~/lib/utils';
import { Text as ThemedText } from './Themed';
import { Chess } from 'chess.js';
import { BoardNotation } from './BoardNotation';
import { FILES } from '~/constants';

const imageUrl: Record<string, any> = {
  'wr.png': require('~assets/pieces/wr.png'),
  'wn.png': require('~assets/pieces/wn.png'),
  'wb.png': require('~assets/pieces/wb.png'),
  'wq.png': require('~assets/pieces/wq.png'),
  'wk.png': require('~assets/pieces/wk.png'),
  'wp.png': require('~assets/pieces/wp.png'),
  'br.png': require('~assets/pieces/br.png'),
  'bn.png': require('~assets/pieces/bn.png'),
  'bb.png': require('~assets/pieces/bb.png'),
  'bq.png': require('~assets/pieces/bq.png'),
  'bp.png': require('~assets/pieces/bp.png'),
  'bk.png': require('~assets/pieces/bk.png'),
};

const Text = (props: TextProps) => {
  return <ThemedText maxFontSizeMultiplier={1} {...props} />;
};

const board = new Chess().board();

export const ChessBoardUI = () => {
  return (
    <View className="overflow-hidden rounded">
      {board.map((row, i) => (
        <View key={i} className="flex-row">
          {row.map((square, j) => {
            const white = (i + j) % 2 === 0;
            const pieceImage = square ? `${square.color}${square.type}.png` : null;
            return (
              <View
                key={`${i}${j}`}
                className={cn(
                  'relative aspect-square flex-1 p-1',
                  white ? 'bg-[#EBEDD0]' : 'bg-[#739552]'
                )}>
                {pieceImage && (
                  <Image
                    source={imageUrl[pieceImage]}
                    className="aspect-square h-full max-w-full"
                  />
                )}
                {j === 0 && (
                  <BoardNotation white={white} value={i + 1} />
                )}
                {i === board.length - 1 && (
                  <BoardNotation white={white} value={FILES[j]} position={"bottom-right"} />
                )}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
};
