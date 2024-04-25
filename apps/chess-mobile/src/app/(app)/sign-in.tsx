import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { useAuth } from '~/context/authcontext';

export default function SignIn() {
  // const { } = useAuth();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text
        // onPress={() => {
        //   // signIn();
        //   // Navigate after signing in. You may want to tweak this to ensure sign-in is
        //   // successful before navigating.
        //   router.replace('/');
        // }}
      >
        Sign In
      </Text>
    </View>
  );
}
