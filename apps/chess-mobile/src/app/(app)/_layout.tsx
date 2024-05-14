import { AntDesign } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { PixelRatio } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRecoilValueLoadable } from 'recoil';
import { Container, DrawerContent, Loading } from '~/components';
import { userAtom } from '~/store/atoms/user';

export default function Layout() {
  const { contents: user, state } = useRecoilValueLoadable(userAtom);

  const isLoading = state === 'loading';

  if (isLoading) {
    return (
      <Container className="items-center justify-center bg-slate-950">
        <Loading />
      </Container>
    );
  }
  if (!user) {
    return <Redirect href={'/sign-in'} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{ headerShown: false }}
        drawerContent={(props) => <DrawerContent {...props} />}>
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: 'Home',
            drawerIcon: (props) => <AntDesign name="home" {...props} />,
          }}
        />
        <Drawer.Screen name="details" />
        <Drawer.Screen name="game" options={{ swipeEnabled: false, drawerItemStyle: { display: "none" } }} />
      </Drawer>
    </GestureHandlerRootView>
  );
}
