import { ImageBackground, View } from 'react-native';
import { useRecoilValue } from 'recoil';
import { userAtom } from '~/store/atoms/user';
import { Text } from './Themed';

const image = { uri: 'https://picsum.photos/seed/picsum/300/200?grayscale&blur=2' };

export const ProfileCard = () => {
  const user = useRecoilValue(userAtom);
  return (
    <ImageBackground source={image} className="h-1/5 w-full justify-end py-4" resizeMode="cover">
      <View className="mx-4 aspect-square h-20 items-center justify-center rounded-full bg-red-500">
        <Text className="text-3xl text-white">
          {user?.name
            .split(' ')
            .map((char) => char.substring(0, 1).toUpperCase())
            .join('')}
        </Text>
      </View>
      <Text className="my-2 bg-black/50 px-4 text-right text-lg text-white">{user?.name}</Text>
    </ImageBackground>
  );
};
