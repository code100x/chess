import { router, useGlobalSearchParams, useLocalSearchParams, useNavigation } from 'expo-router';
import { Text, View } from 'react-native';
import { useAuth } from '~/context/authcontext';

export default function SignIn() {
  const params  = useLocalSearchParams();
  console.log(params);
  
  const { signIn } = useAuth();
  const handlePress = async () => {
    // await signIn();
    // router.replace('/(app)/details');
  }
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text onPress={handlePress} >
        Sign In
      </Text>
    </View>
  );
}
