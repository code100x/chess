
import { Stack , router } from 'expo-router';
import React from 'react';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect } from "react";
import { PRIMARY_BROWN } from "../constants/colors";
import { AuthProvider } from './context/auth/AuthContext';
import AuthScreen from './context/AuthScreen';


export default function RootLayoutNav() {
    useEffect(() => {

      router.replace("/login");
    }, []);

  
    return (
    <AuthProvider>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: PRIMARY_BROWN },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600', fontSize: 18 },
          headerTitleAlign: 'center',
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="index" options={{ headerTitle: '100X Chess' }} />
        <Stack.Screen name="game/index" options={{ headerTitle: '100X Chess' }} />
        {/* <Stack.Screen name="chessboard" options={{ headerShown: false }} /> */}
       <Stack.Screen name="auth" component={AuthScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </AuthProvider>
  );
};


