import { Image, Pressable, View } from 'react-native';
import { Text } from './Themed';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { blackPlayer, gameResult, gameStatus, whitePlayer } from '~/store/atoms';
import { IMAGE_URL } from '~/constants';
import { cn } from '~/lib/utils';
import { router } from 'expo-router';

export const GameEnd = () => {
  const setGameStatus = useSetRecoilState(gameStatus);
  const game = useRecoilValue(gameResult);
  const black = useRecoilValue(blackPlayer);
  const white = useRecoilValue(whitePlayer);

  const handleClose = () => {
    router.navigate('/');
    setGameStatus('idle');
  };
  return (
    <View className="absolute h-full w-full items-center justify-center bg-black/50">
      <View className="w-4/5 gap-3 overflow-hidden rounded-md bg-slate-800">
        <View className="items-center gap-2 p-4">
          <Text className="m-1 text-4xl font-bold text-yellow-400">
            {game?.result === 'WHITE_WINS' ? ' White' : 'Black'} Wins!
          </Text>
          <Text className="text-lg text-slate-300">by {game?.by}</Text>
          <View className="w-full flex-row items-center justify-center gap-3 bg-slate-700">
            <View className="items-center gap-1 p-4">
              <View
                className={cn(
                  'rounded-full border-2 border-red-400 p-1',
                  game?.result === 'WHITE_WINS' && 'border-green-400'
                )}>
                <Image source={IMAGE_URL['wk']} className="h-10 w-10 max-w-full" />
              </View>
              <Text className="text-slate-300">{white?.name}</Text>
            </View>
            <Text className="text-xl font-bold text-slate-300">vs</Text>
            <View className="items-center gap-1 p-4">
              <View
                className={cn(
                  'rounded-full border-2 border-red-400 p-1',
                  game?.result === 'BLACK_WINS' && 'border-green-400'
                )}>
                <Image source={IMAGE_URL['bk']} className="h-10 w-10 max-w-full" />
              </View>
              <Text className="text-slate-300">{black?.name}</Text>
            </View>
          </View>
        </View>
        <View className="w-full items-end bg-slate-900 px-4 py-2">
          <Pressable className=" rounded bg-red-500 px-3 py-1.5" onPress={handleClose}>
            <Text className="text-lg font-semibold text-white">Close</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};
