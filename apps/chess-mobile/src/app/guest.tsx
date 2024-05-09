import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import base64 from 'base-64';
import { BackgroundSvg, Button, Container, Logo } from '~/components';
import useAuth from '~/hooks/useAuth';

export default function SignIn() {
  const { cookie } = useLocalSearchParams<{ cookie: string }>();

  const { signIn, setCookie } = useAuth();
  // useEffect(() => {
  //   if (cookie) {
  //     console.log("normal- ",cookie);
  //     const token = base64.decode(cookie);
  //     console.log("url encoded- ",token);

  //     setCookie(token);
  //     // router.replace('/');

  //   }
  // }, [cookie])

  const handlePress = () => {
    signIn();
  };
  return (
    <Container className="bg-slate-950 px-10 py-20">
      <BackgroundSvg />
      <Logo icon size={'md'} style={{ justifyContent: 'flex-start' }} />
      <View className="my-10 gap-y-6">
        <TextInput
          className="rounded-md bg-slate-700 px-6 py-4 text-xl text-slate-200 placeholder:text-slate-400"
          placeholder="Username"
        />
        <Button
          className="flex-row gap-x-4 rounded-xl"
          roundClass="rounded-xl"
          size="lg"
          onPress={() => console.log('Button pressed: GOOGLE')}>
          <Text className="text-2xl font-bold text-white">Play Online</Text>
        </Button>
        <Pressable onPress={() => router.replace('/sign-in')}>
          <Text className="text-right text-lg text-slate-400 underline">
            Sign in to save your progress
          </Text>
        </Pressable>
      </View>
    </Container>
  );
}
