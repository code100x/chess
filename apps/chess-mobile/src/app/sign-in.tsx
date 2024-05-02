import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Image, Text, View } from 'react-native';
import base64 from "base-64";
import { useAuth } from '~/context/authcontext';
import { Container } from '~/components/Container';
import { Button } from '~/components/Button';
import BackgroundSvg from '~/components/BackgroundSvg';
import { AntDesign } from '@expo/vector-icons';

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
        <View className='gap-y-6'>
          <Button 
            className='flex-row gap-x-4 rounded-xl' 
            roundClass='rounded-xl'
            size='lg'
            onPress={()=>console.log("Button pressed: GOOGLE")}
          >
            <AntDesign name="google" size={24} color="white" />
            <Text className='text-white font-bold text-2xl'>Login with Google</Text>
          </Button>
          <Button 
            className='flex-row gap-x-4 rounded-xl' 
            roundClass='rounded-xl'
            size='lg'
            onPress={()=>console.log("Button pressed: GITHUB")}
          >
            <AntDesign name="github" size={24} color="white" />
            <Text className='text-white font-bold text-2xl'>Login with Github</Text>
          </Button>
          <View className='relative items-center justify-center'>
            <View className='absolute h-px bg-white w-full'/>
            <Text className='text-white font-bold text-xl px-2 bg-slate-950'>OR</Text>
          </View>
          <Button 
            variant="secondary"
            className='flex-row gap-x-4 rounded-xl' 
            roundClass='rounded-xl'
            size='lg'
            onPress={()=>console.log("Button pressed: GUEST")}
          >
            <Text className='text-white font-bold text-2xl'>Play as Guest</Text>
          </Button>
        </View>
      {/* </View> */}
    </Container>
  );
}
