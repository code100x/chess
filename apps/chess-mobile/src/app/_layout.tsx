import '../global.css';

import { setBackgroundColorAsync, setBehaviorAsync, setVisibilityAsync } from 'expo-navigation-bar';
import { Slot } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useState } from 'react';
import { SplashScreen } from '~/components';
import { RecoilRoot } from 'recoil';

export default function Layout() {
  setStatusBarStyle("light");
  setVisibilityAsync("hidden");
  setBehaviorAsync("overlay-swipe");
  setBackgroundColorAsync("rgb(2 6 23)");

  const [splashAnimationFinished, setSplashAnimationFinished] = useState(false);
  if (!splashAnimationFinished) {
    return (
      <SplashScreen
        onAnimationFinish={(isCancelled) => {
          if (!isCancelled) {
            setSplashAnimationFinished(true);
          }
        }}
      />
    )
  }

  return (
    <RecoilRoot>
      <Slot />
    </RecoilRoot>
  );
}
