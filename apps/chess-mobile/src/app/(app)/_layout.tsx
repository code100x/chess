import { AntDesign } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRecoilValue } from 'recoil';
import { Container, Loading } from '~/components';
import { DrawerContent } from '~/components/DrawerContent';
import useAuth from '~/hooks/useAuth';
import { loadingAtom } from '~/store/atoms/loading';
import { userAtom } from '~/store/atoms/user';
import { authentication } from '~/store/selectors/authentication';

export default function Layout() {
  const user = useRecoilValue(userAtom);
  const isLoading = useRecoilValue(loadingAtom);
  // useAuth();

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
      </Drawer>
    </GestureHandlerRootView>
  );
}
