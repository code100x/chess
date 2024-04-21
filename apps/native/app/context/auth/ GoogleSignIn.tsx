import React, { useContext } from 'react';
import { View, Text, Button } from 'react-native';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import AuthContext from './AuthContext';

const GoogleSignIn: React.FC = () => {
  const { signIn } = useContext(AuthContext);

  return (
    <View>
      <GoogleSigninButton
        style={{ width: 192, height: 48 }}
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={signIn}
      />
    </View>
  );
};

export default GoogleSignIn;