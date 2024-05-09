import { Feather } from '@expo/vector-icons';
import { DrawerContentComponentProps, DrawerContentScrollView } from "@react-navigation/drawer";
import { CommonActions, DrawerActions } from "@react-navigation/native";
import { Text, View } from "react-native";
import { cn } from "~/lib/utils";
import { Button } from "./Button";
import useAuth from '~/hooks/useAuth';

export const DrawerContent = (props: DrawerContentComponentProps) => {
  const { state, descriptors, navigation } = props;
  const { signOut } = useAuth();

  const handleLogout = () => {
    signOut();
  }
  return (
    <View className="flex-1 bg-slate-800">
      <View>
        {/* USER DETAILS */}
      </View>
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

          const {
            title,
            drawerLabel,
            drawerIcon,
          } = descriptors[route.key].options;
          const label =
            drawerLabel !== undefined
              ? drawerLabel
              : title !== undefined
                ? title
                : route.name;
          return (
            <Button variant={"link"} key={route.key} onPress={onPress} className={cn("flex-row gap-4 justify-start my-1", focused && 'bg-slate-700')}>
              {drawerIcon ? drawerIcon({ size: 20, focused, color: "white" }) : null}
              {typeof label === "string" ? <Text className="text-white text-xl capitalize">{label}</Text> : label({ color: "white", focused })}
            </Button>
          )
        })}
      </DrawerContentScrollView>
      <View className="p-4 border-t-slate-600 border-t gap-y-2">
        <Button variant={"link"} className="flex-row gap-4 justify-start" onPress={handleLogout}>
          <Feather name="log-out" size={20} color="white" />
          <Text className="text-white text-xl">Sign Out</Text>
        </Button>
      </View>
    </View>
  )
}