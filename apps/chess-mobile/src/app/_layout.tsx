import { AuthProvider } from '~/context/authcontext';
import '../global.css';

import { Slot } from 'expo-router';

export default function Layout() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
