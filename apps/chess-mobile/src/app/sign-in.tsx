import { router, useGlobalSearchParams, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, SafeAreaView, Text, View } from 'react-native';
import WebView from 'react-native-webview';
import { useAuth } from '~/context/authcontext';

const SERVER = process.env.EXPO_PUBLIC_API_URL;

export default function SignIn() {
  const { cookie } = useLocalSearchParams<{ cookie: string }>();
  const { signIn, setCookie } = useAuth();

  const [uri, setURL] = useState("");
  useEffect(() => {
    Linking.addEventListener("url", () => {
      setURL("");
    });
    return () => {
      Linking.removeAllListeners("url");
    };
  }, []);


  const openUrl = (url:any) => {
    setURL(url);
  };

  console.log("cookie", cookie);
  useEffect(() => {
    if (cookie) {
      setCookie(cookie);
      router.replace('/');
      
    }
  }, [cookie])

  const handlePress = async () => {
    openUrl(`${SERVER}/auth/google`)
    // await signIn();
    // router.replace('/(app)/details');
  }
  return (
    <>
      {uri ? 
          <WebView userAgent="Chrome/18.0.1025.133 Mobile Safari/535.19" source={{uri}}/>
      :
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text onPress={handlePress} >
            Sign In
          </Text>
        </View>
      }
    </>
  );
}
