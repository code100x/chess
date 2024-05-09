import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Image, Text, View } from 'react-native';
import base64 from "base-64";
import { AntDesign } from '@expo/vector-icons';
import { BackgroundSvg, Button, Container, Loading, Logo } from '~/components';
import useAuth from '~/hooks/useAuth';

export default function SignIn() {
  const { cookie } = useLocalSearchParams<{ cookie: string }>();
  const { signIn, setCookie, isLoading } = useAuth();

  useEffect(() => {
    if (cookie) {
      const token = base64.decode(cookie);
      setCookie(token);
    }
  }, [cookie])

  const handlePressGoogle = () => {
    signIn();
  }
  return (
    <>
      <Container className='bg-slate-950 p-10'>
        <BackgroundSvg />
        <View className='flex-1 py-10 gap-y-8 justify-end'>
          <View className='items-center justify-center gap-y-3'>
            <Text className='text-slate-300 text-4xl font-bold'>Conquer the Board with</Text>
            <Logo />
          </View>
          <Image source={require('~assets/chess.png')} className="max-h-60 max-w-full mx-auto" />
          <View className='gap-y-6'>
            <Button
              className='flex-row gap-x-4 rounded-xl'
              roundClass='rounded-xl'
              size='lg'
              onPress={handlePressGoogle}
            >
              <AntDesign name="google" size={24} color="white" />
              <Text className='text-white font-bold text-2xl'>Login with Google</Text>
            </Button>
            <Button
              className='flex-row gap-x-4 rounded-xl'
              roundClass='rounded-xl'
              size='lg'
              onPress={() => console.log("Button pressed: GITHUB")}
            >
              <AntDesign name="github" size={24} color="white" />
              <Text className='text-white font-bold text-2xl'>Login with Github</Text>
            </Button>
            <View className='relative items-center justify-center'>
              <View className='absolute h-[1px] bg-slate-400 w-full' />
              <Text className='text-white font-bold text-xl px-2 bg-slate-950'>OR</Text>
            </View>
            <Button
              variant="secondary"
              className='flex-row gap-x-4 rounded-xl'
              roundClass='rounded-xl'
              size='lg'
              onPress={() => router.push("/guest")}
            >
              <Text className='text-white font-bold text-2xl'>Play as Guest</Text>
            </Button>
          </View>
        </View>
      </Container>
      {isLoading && <View className='absolute bg-black/50 h-full w-full items-center justify-center'>
        <Loading className='bg-slate-950' />
      </View>}
    </>
  );
}
