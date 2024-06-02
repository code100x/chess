import { FlatList, Pressable, View } from 'react-native';
import { Text } from './Themed';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { currMoveIndex, lastmove, moveSelector, moveStore, selectedMoveIndex } from '~/store/atoms';
import { memo } from 'react';
import { cn } from '~/lib/utils';
import { useChess } from '~/hooks/useChess';
import { Move } from 'chess.js';

export const MovesTable = () => {
  const moves = useRecoilValue(moveSelector);
  const movesArray = useRecoilValue(moveStore);
  const { makeMove } = useChess();
  const currMove = useRecoilValue(currMoveIndex);
  const setSelectedMove = useSetRecoilState(selectedMoveIndex);
  const setRecentMove = useSetRecoilState(lastmove);

  const handleMoveClick = (index: number, move: Move) => {
    if (currMove === index) return;
    if (index === movesArray.length - 1) {
      setSelectedMove(null);
    } else {
      setSelectedMove(index);
    }
    makeMove(move);
    setRecentMove({ from: move.from, to: move.to });
  };

  return (
    <View className="my-1 flex-1 overflow-hidden rounded bg-slate-900">
      <FlatList
        data={moves}
        renderItem={({ item, index }) => (
          <View
            className={cn('flex-row items-center px-3 py-1', index % 2 === 0 && 'bg-slate-800')}>
            <Text className="w-16 font-semibold text-slate-300">{index + 1}.</Text>
            <FlatList
              data={item}
              numColumns={2}
              keyExtractor={(item) => item.after}
              renderItem={({ item, index: moveIdx }) => (
                <Pressable
                  className="w-16"
                  onPress={() => handleMoveClick(index * 2 + moveIdx, item)}>
                  <Text
                    className={cn(
                      'rounded-sm px-2 py-1 font-semibold text-slate-300',
                      currMove === index * 2 + moveIdx && 'bg-slate-700'
                    )}>
                    {item.san}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        )}
      />
      <Footer showMoves={handleMoveClick} />
    </View>
  );
};

const Footer = memo(({ showMoves }: { showMoves: (index: number, move: Move) => void }) => {
  const currMove = useRecoilValue(currMoveIndex);
  const moves = useRecoilValue(moveStore);

  const handlePress = (pos: 'first' | 'prev' | 'next' | 'last') => {
    switch (pos) {
      case 'first':
        showMoves(0, moves[0]);
        break;
      case 'prev':
        showMoves(currMove - 1, moves[currMove - 1]);
        break;
      case 'next':
        showMoves(currMove + 1, moves[currMove + 1]);
        break;
      case 'last':
        showMoves(moves.length - 1, moves[moves.length - 1]);
        break;
    }
  };

  return (
    <View className=" flex-row gap-x-2 bg-stone-700 p-2">
      <View className="flex-row items-center gap-x-1">
        <MaterialCommunityIcons name="fraction-one-half" size={20} color="white" />
        <Text className="text-slate-200">Draw</Text>
      </View>
      <View className="flex-1 flex-row items-center gap-x-1">
        <MaterialIcons name="flag" size={20} color="white" />
        <Text className="text-slate-200">Abort</Text>
      </View>
      <MaterialIcons
        disabled={moves.length === 0 || currMove === 0}
        name="first-page"
        size={20}
        color={moves.length === 0 || currMove === 0 ? 'gray' : 'white'}
        onPress={() => handlePress('first')}
      />
      <MaterialIcons
        disabled={moves.length === 0 || currMove === 0}
        name="chevron-left"
        size={20}
        color={moves.length === 0 || currMove === 0 ? 'gray' : 'white'}
        onPress={() => handlePress('prev')}
      />
      <MaterialIcons
        disabled={currMove === moves.length - 1}
        name="chevron-right"
        size={20}
        color={currMove === moves.length - 1 ? 'gray' : 'white'}
        onPress={() => handlePress('next')}
      />
      <MaterialIcons
        disabled={currMove === moves.length - 1}
        name="last-page"
        size={20}
        color={currMove === moves.length - 1 ? 'gray' : 'white'}
        onPress={() => handlePress('last')}
      />
    </View>
  );
});
