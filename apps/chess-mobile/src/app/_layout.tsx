import '../global.css';

import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{ navigationBarHidden: true, statusBarHidden: true, statusBarStyle: 'auto' }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="details" options={{ title: 'Details' }} />
    </Stack>
  );
}
