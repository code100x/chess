import { Stack, router } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import { PRIMARY_BROWN } from '../constants/colors';
// import Loading from "../components/loading";

export default function RootLayoutNav() {
  useEffect(() => {
    router.replace('/login');
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack
          // https://reactnavigation.org/docs/headers#sharing-common-options-across-screens
          screenOptions={{
            headerStyle: { backgroundColor: PRIMARY_BROWN },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: '600',
              fontSize: 18,
            },
            headerTitleAlign: 'center',
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              headerTitle: `100X Chess`,
            }}
          />
          <Stack.Screen
            name="game/index"
            options={{
              headerTitle: `100X Chess`,
            }}
          />

          {/* <Stack.Screen name="chessboard" options={{ headerShown: false }} /> */}
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
