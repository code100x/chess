import { useEffect } from "react";
import { StyleSheet, Text, View, ViewProps } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { cn } from "~/lib/utils";

export const Loading = ({className, ...props}:ViewProps) => {
  const deg = useSharedValue(0);
  const animatedStyles = useAnimatedStyle(() => ({
    transform:[{rotate: `${deg.value * 360}deg`}]
  }))
  useEffect(() => {
    deg.value = withRepeat(withTiming(1, {duration:1000}), -1);
  }, [deg.value])

  return (
    <View 
      style={{ borderWidth: StyleSheet.hairlineWidth }} 
      className={cn("flex-row items-center gap-x-3 border-slate-500 px-6 py-3 rounded-md", className)}
      {...props}
    >
      <Animated.View style={[animatedStyles]} className="relative border w-6 border-slate-300 aspect-square border-r-0 border-b-0 rounded-full"/>
      <Text className="text-slate-300 text-xl">Loading...</Text>
    </View>
  )
};