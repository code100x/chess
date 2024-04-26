import { useAuth } from '~/context/authcontext';
import { Stack, Redirect } from 'expo-router';
import { Text, View } from 'react-native';

export default function Layout() {
  const { session, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <View className='bg-red-500 flex-1 justify-center'>
        <Text className='text-3xl font-bold mx-auto text-center my-4'> LOADING....... </Text>
      </View>
    )
  }
  if(!session) {
    return <Redirect href={"/sign-in"} />
  }

  return <Stack/>
}
