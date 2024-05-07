import { useAuth } from '~/context/authcontext';
import { Redirect } from 'expo-router';
import { Container, Loading } from '~/components';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { DrawerContent } from '~/components/DrawerContent';
import { AntDesign } from '@expo/vector-icons';
export default function Layout() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Container className='bg-slate-950 items-center justify-center'>
        <Loading />
      </Container>
    )
  }
  if (!session) {
    return <Redirect href={"/sign-in"} />
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer screenOptions={{ headerShown: false }} drawerContent={(props) => <DrawerContent {...props} />}>
        <Drawer.Screen
          name='index'
          options={{
            drawerLabel: 'Home',
            drawerIcon: (props) => <AntDesign name="home" {...props} />
          }}
        />
        <Drawer.Screen
          name="details"
        />
      </Drawer>
    </GestureHandlerRootView>
  )
}
