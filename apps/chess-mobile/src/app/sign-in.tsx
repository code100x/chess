import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Image, Text, View } from 'react-native';
import base64 from "base-64";
import { useAuth } from '~/context/authcontext';
import { Container } from '~/components/Container';
import { Button } from '~/components/Button';
import BackgroundSvg from '~/components/BackgroundSvg';

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
  }
  return (
    <Container className='bg-slate-950 p-10'>
      <BackgroundSvg/>
      {/* <View className='flex-1 bg-red-200'> */}
        <View className='items-center justify-center'>
          <Text className='text-slate-300 text-4xl font-bold'>Conquer the Board with</Text>
          <Text className='text-slate-300 text-5xl font-bold'>Chess.100x</Text>
        </View>
        <Image source={require('~assets/chess.png')} className="w-3/4 h-40 max-w-full mx-auto" />
        <Button title='Hello'/>
      {/* </View> */}
    </Container>
  );
}
