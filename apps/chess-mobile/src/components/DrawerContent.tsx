import { Feather } from '@expo/vector-icons';
import { DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import { CommonActions, DrawerActions } from '@react-navigation/native';
import { View } from 'react-native';
import { cn } from '~/lib/utils';
import { Button } from './Button';
import { useSetRecoilState } from 'recoil';
import { storedCookie } from '~/store/atoms';
import { ProfileCard } from './ProfileCard';
import { Text } from './Themed';

export const DrawerContent = (props: DrawerContentComponentProps) => {
  const { state, descriptors, navigation } = props;
  const setCookie = useSetRecoilState(storedCookie);
  const handleLogout = () => {
    setCookie(null);
  };
  return (
    <View className="flex-1 bg-slate-800">
      <ProfileCard />
      <DrawerContentScrollView className="p-4">
        {state.routes.map((route, idx) => {
          const focused = idx === state.index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'drawerItemPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!event.defaultPrevented) {
              navigation.dispatch({
                ...(focused
                  ? DrawerActions.closeDrawer()
                  : CommonActions.navigate({ name: route.name, merge: true })),
                target: state.key,
              });
            }
          };

          const { title, drawerLabel, drawerIcon, drawerItemStyle } =
            descriptors[route.key].options;
          const label =
            drawerLabel !== undefined ? drawerLabel : title !== undefined ? title : route.name;
          return (
            <Button
              variant={'link'}
              key={route.key}
              onPress={onPress}
              style={drawerItemStyle}
              className={cn('my-1 flex-row justify-start gap-4', focused && 'bg-slate-700')}>
              {drawerIcon ? drawerIcon({ size: 20, focused, color: 'white' }) : null}
              {typeof label === 'string' ? (
                <Text className="capitalize text-white">{label}</Text>
              ) : (
                label({ color: 'white', focused })
              )}
            </Button>
          );
        })}
      </DrawerContentScrollView>
      <View className="gap-y-2 border-t border-t-slate-600 p-4">
        <Button variant={'link'} className="flex-row justify-start gap-4" onPress={handleLogout}>
          <Feather name="log-out" size={20} color="white" />
          <Text className="text-white">Sign Out</Text>
        </Button>
      </View>
    </View>
  );
};
