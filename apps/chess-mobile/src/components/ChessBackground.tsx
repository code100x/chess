import { View } from 'react-native';
import { cn } from '~/lib/utils';
import { BoardNotation } from './BoardNotation';
import { useRecoilValue } from 'recoil';
import { isFlipped } from '~/store/atoms';
import { memo } from 'react';

const board = Array(8).fill('_');

export const ChessBackground = () => {
  const flipped = useRecoilValue(isFlipped);
  return board.map((_, i) => (
    <View key={i} className="flex-row">
      {board.map((_, j) => {
        const white = flipped ? !((i + j) % 2 === 0) : (i + j) % 2 === 0;
        return (
          <View
            key={`${i}${j}`}
            className={cn(
              'relative aspect-square flex-1 p-1',
              white ? 'bg-[#EBEDD0]' : 'bg-[#739552]'
            )}>
            {j === 0 && <BoardNotation white={white} value={flipped ? i + 1 : 8 - i} />}
            {i === board.length - 1 && (
              <BoardNotation
                white={white}
                value={String.fromCharCode(flipped ? 97 + 7 - j : 97 + j)}
                position={'bottom-right'}
              />
            )}
          </View>
        );
      })}
    </View>
  ));
};
