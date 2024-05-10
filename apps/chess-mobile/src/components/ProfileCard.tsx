import { ImageBackground, Text, View } from "react-native"
import { useRecoilValue } from "recoil"
import { userAtom } from "~/store/atoms/user"

const image = { uri: 'https://picsum.photos/seed/picsum/300/200?grayscale&blur=2' };

export const ProfileCard = () => {
  const user = useRecoilValue(userAtom);
  return (
    <ImageBackground source={image} className="h-1/5 w-full justify-end py-4" resizeMode="cover">
      <View className="mx-4 h-20 aspect-square bg-red-500 rounded-full items-center justify-center">
        <Text className="text-white text-4xl">{user?.name.split(" ").map(char => char.substring(0, 1).toUpperCase()).join("")}</Text>
      </View>
      <Text className="text-white text-2xl px-4 my-2 text-right bg-black/50">{user?.name}</Text>
    </ImageBackground>
  )
}