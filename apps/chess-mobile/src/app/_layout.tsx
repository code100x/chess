import { AuthProvider } from '~/context/authcontext';
import '../global.css';

import { Slot } from 'expo-router';
import { useState } from 'react';
import SplashScreen from '~/components/SplashScreen';

export default function Layout() {
  const [splashAnimationFinished, setSplashAnimationFinished] = useState(false);
  if (!splashAnimationFinished) {
    return (
      <SplashScreen
        onAnimationFinish={(isCancelled) => {
          console.log("isCancelled", isCancelled);
          if (!isCancelled) {
            setSplashAnimationFinished(true);
          }
        }}
      />
    )
  }

  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
