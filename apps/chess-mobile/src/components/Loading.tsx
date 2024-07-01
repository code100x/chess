import { memo, useEffect } from 'react';
import { StyleSheet, Text, View, ViewProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { cn } from '~/lib/utils';

interface LoadingProps extends ViewProps {
  message?: string;
}
export const Loading = memo(({ className, message, ...props }: LoadingProps) => {
  const deg = useSharedValue(0);
  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ rotate: `${deg.value * 360}deg` }],
  }));
  useEffect(() => {
    deg.value = withRepeat(withTiming(1, { duration: 1000 }), -1);
  }, [deg.value]);

  return (
    <View
      style={{ borderWidth: StyleSheet.hairlineWidth }}
      className={cn(
        'flex-row items-center gap-x-3 rounded-md border-slate-500 px-6 py-3',
        className
      )}
      {...props}>
      <Animated.View
        style={[animatedStyles]}
        className="relative aspect-square w-6 rounded-full border border-b-0 border-r-0 border-slate-300"
      />
      <Text className="text-slate-300">{message ?? 'Loading...'}</Text>
    </View>
  );
});
