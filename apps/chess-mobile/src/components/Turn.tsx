import { View } from 'react-native';
import { Text } from './Themed';
import { useRecoilValue } from 'recoil';
import { chessState, myColor } from '~/store/atoms';

export const Turn = () => {
  const chess = useRecoilValue(chessState);
  const color = useRecoilValue(myColor);
  const turn = chess.turn() === color ? "Your's Turn" : "Opponent's Turn";
  return (
    <View className="mt-8 items-center">
      <Text className="text-xl font-semibold text-slate-300">{turn}</Text>
    </View>
  );
};
