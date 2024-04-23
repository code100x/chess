
import React from 'react';
import { Stack, router } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect } from "react";
import { PRIMARY_BROWN } from "../constants/colors";
import { AuthProvider } from './context/authcontext'; 


export default function RootLayoutNav() {
  useEffect(() => {
    router.replace('/login');
  }, []);

  return (
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: PRIMARY_BROWN },
              headerTintColor: "#fff",
              headerTitleStyle: {
                fontWeight: "600",
                fontSize: 18,
              },
              headerTitleAlign: "center",
              headerShadowVisible: false
            }}
          >
            <Stack.Screen name="index" options={{ headerTitle: `100X Chess` }} />
            <Stack.Screen name="game/index" options={{ headerTitle: `100X Chess` }} />
          </Stack>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </AuthProvider>

  );
}
