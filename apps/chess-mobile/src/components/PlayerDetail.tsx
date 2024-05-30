import { View } from 'react-native';
import { useRecoilValue } from 'recoil';
import { blackPlayer, chessState, whitePlayer } from '~/store/atoms';
import { Text } from './Themed';
import { useTimer } from '~/hooks/useTimer';

export const PlayerDetail = ({ isBlack }: { isBlack: boolean }) => {
  const player = useRecoilValue(isBlack ? blackPlayer : whitePlayer);
  return (
    <View className="justify-between">
      <Text className="text-white">{player?.name}</Text>
      <Timer isBlack={isBlack} />
    </View>
  );
};

const Timer = ({ isBlack }: { isBlack: boolean }) => {
  const timer = useTimer(isBlack);
  return (
    <View>
      <Text className="text-white">{timer()}</Text>
    </View>
  );
};
