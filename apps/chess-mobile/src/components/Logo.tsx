import { FontAwesome5 } from '@expo/vector-icons';
import { VariantProps, cva } from 'class-variance-authority';
import { forwardRef } from 'react';
import { Text, View, ViewProps } from 'react-native';
import { cn } from '~/lib/utils';

const logoVariants = cva(
  "text-slate-300",
  {
    variants: {
      size: {
        default:"text-5xl font-bold",
        sm:"text-3xl font-medium",
        md:"text-4xl font-semibold",
      },
    },
    defaultVariants: {
      size: "default",
    }
  }
);

const iconVariants = {
  default:32,
  sm:20,
  md:24,
};

const iconSize = (size: (keyof typeof iconVariants) | null | undefined) => {
  if(!size) return iconVariants["default"];
  return iconVariants[size];
}


interface LogoProps extends ViewProps, VariantProps<typeof logoVariants> {
  icon?: boolean
}

export const Logo = forwardRef<View, LogoProps>(
  ({ className, size, icon = false, ...props }, ref) => {
    return (
      <View
        className='inline-flex items-center justify-center flex-row gap-x-2'
        ref={ref}
        {...props}
      >
        {icon && <FontAwesome5 name="chess-bishop" size={iconSize(size)} color="rgb(203 213 225)" />}
        <Text className={cn(logoVariants({size, className}))}>Chess.100x</Text>
      </View>
    );
  }
);
