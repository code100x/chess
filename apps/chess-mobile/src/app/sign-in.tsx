import { router, useGlobalSearchParams, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, Linking, SafeAreaView, Text, View } from 'react-native';
import WebView from 'react-native-webview';
import base64 from "base-64";
import { useAuth } from '~/context/authcontext';

const SERVER = process.env.EXPO_PUBLIC_API_URL;

export default function SignIn() {
  const { cookie } = useLocalSearchParams<{ cookie: string }>();
  
  const { signIn, setCookie } = useAuth();
  useEffect(() => {
    if (cookie) {
      console.log("normal- ",cookie);
      const token = base64.decode(cookie);
      console.log("url encoded- ",token);
      
      setCookie(token);
      // router.replace('/');
      
    }
  }, [cookie])

  const handlePress = () => {
   signIn();
  }
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button onPress={handlePress} title='Sign In'/>
      {/* <Text onPress={handlePress} >
        Sign In
      </Text> */}
    </View>
  );
}
