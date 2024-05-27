import { View } from 'react-native';
import { useRecoilValue } from 'recoil';
import { blackPlayer, whitePlayer } from '~/store/atoms';
import { Text } from './Themed';

export const PlayerDetail = ({ isBlack }: { isBlack: boolean }) => {
  const player = useRecoilValue(isBlack ? blackPlayer : whitePlayer);
  return (
    <View className="justify-between">
      <Text className="text-white">{player?.name}</Text>
    </View>
  );
};
