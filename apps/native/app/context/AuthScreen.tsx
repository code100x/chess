import React from 'react';
import { View, Text } from 'react-native';
import GoogleSignIn from './auth/ GoogleSignIn';


const AuthScreen: React.FC = () => {
  return (
    <View>
      <Text>Sign in with Google to continue</Text>
      <GoogleSignIn />
    </View>
  );
};

export default AuthScreen;