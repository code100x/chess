import { SafeAreaView, ViewProps } from 'react-native'
import { cn } from '~/lib/utils';

export function Container({children, className}:ViewProps) {
  return <SafeAreaView className={cn(styles.container, className)}>{children}</SafeAreaView>;
};

const styles = {
  container: 'flex flex-1 p-6',
};
