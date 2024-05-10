import { AntDesign } from '@expo/vector-icons';
import base64 from 'base-64';
import { router, useLocalSearchParams } from 'expo-router';
import { openAuthSessionAsync } from 'expo-web-browser';
import { useEffect } from 'react';
import { Image, Text, View } from 'react-native';
import { useSetRecoilState } from 'recoil';
import { BackgroundSvg, Button, Container, Loading, Logo } from '~/components';
import { storedCookie } from '~/store/atoms/cookie';

const apiUrl = process.env.EXPO_PUBLIC_API_URL;
const signIn = async () => {
  try {
    const authUrl = `${apiUrl}/auth/google`;
    await openAuthSessionAsync(authUrl);
  } catch (error) {
    console.log(error);
  }
}

export default function SignIn() {
  const { cookie } = useLocalSearchParams<{ cookie: string }>();
  const setCookie = useSetRecoilState(storedCookie);
  const isLoading = false;
  useEffect(() => {
    if (cookie) {
      const token = base64.decode(cookie);
      setCookie(token);
      router.replace("/")
    }
  }, [cookie]);

  const handlePressGoogle = () => {
    signIn();
  };
  return (
    <>
      <Container className="bg-slate-950 p-10">
        <BackgroundSvg />
        <View className="flex-1 justify-end gap-y-8 py-10">
          <View className="items-center justify-center gap-y-3">
            <Text className="text-4xl font-bold text-slate-300">Conquer the Board with</Text>
            <Logo />
          </View>
          <Image source={require('~assets/chess.png')} className="mx-auto max-h-60 max-w-full" />
          <View className="gap-y-6">
            <Button
              className="flex-row gap-x-4 rounded-xl"
              roundClass="rounded-xl"
              size="lg"
              onPress={handlePressGoogle}>
              <AntDesign name="google" size={24} color="white" />
              <Text className="text-2xl font-bold text-white">Login with Google</Text>
            </Button>
            <Button
              className="flex-row gap-x-4 rounded-xl"
              roundClass="rounded-xl"
              size="lg"
              onPress={() => console.log('Button pressed: GITHUB')}>
              <AntDesign name="github" size={24} color="white" />
              <Text className="text-2xl font-bold text-white">Login with Github</Text>
            </Button>
            <View className="relative items-center justify-center">
              <View className="absolute h-[1px] w-full bg-slate-400" />
              <Text className="bg-slate-950 px-2 text-xl font-bold text-white">OR</Text>
            </View>
            <Button
              variant="secondary"
              className="flex-row gap-x-4 rounded-xl"
              roundClass="rounded-xl"
              size="lg"
              onPress={() => router.push('/guest')}>
              <Text className="text-2xl font-bold text-white">Play as Guest</Text>
            </Button>
          </View>
        </View>
      </Container>
      {isLoading && (
        <View className="absolute h-full w-full items-center justify-center bg-black/50">
          <Loading className="bg-slate-950" />
        </View>
      )}
    </>
  );
}
