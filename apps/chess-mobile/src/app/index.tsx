import { Link } from 'expo-router';
import { Image, Text, View } from 'react-native';
import BackgroundSvg from '~/components/BackgroundSvg';

import { Button } from '~/components/Button';
import { Container } from '~/components/Container';
import { ScreenContent } from '~/components/ScreenContent';
import { LinearGradient } from 'expo-linear-gradient';

export default function Home() {
  return (
    <>
      <View className="bg-slate- relative flex flex-1 bg-slate-950">
        <BackgroundSvg />
        <Container>
          <View className="flex flex-1 justify-end gap-6 p-4 py-16">
            <Image source={require('../../assets/chess.png')} className="w-full max-w-full" />
            <Text className="text-center text-5xl font-bold text-white">
              Play chess online on the #2 Site!
            </Text>
            <View className="flex gap-4">
              <LinearGradient
                colors={['#eab308', '#f97316']}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 0 }}
                locations={[0, 1]}
                style={{ padding: 3, borderRadius: 6 }}>
                <Button
                  title="Play Online"
                  className="rounded-[5px] bg-slate-900 py-5 active:bg-black"
                />
              </LinearGradient>
              <Button title="Login" className="bg-yell rounded-[6px] py-5 active:bg-green-600" />
            </View>
          </View>
          {/* <Link href={{ pathname: '/details', params: { name: 'Dan' } }} asChild>
            <Button title="Show Details" />
          </Link> */}
        </Container>
      </View>
    </>
  );
}
