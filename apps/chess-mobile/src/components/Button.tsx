import { VariantProps, cva } from 'class-variance-authority';
import { forwardRef } from 'react';
import { Pressable, PressableProps, View } from 'react-native';
import { cn } from '~/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 transition-transform duration-100 -translate-y-1.5 active:-translate-y-0.5',
  {
    variants: {
      variant: {
        default: 'bg-[#81B44C]',
        secondary: 'bg-[#1E293B]',
        link: 'bg-transparent translate-y-0 active:translate-y-0',
      },
      size: {
        default: 'min-h-12 py-3.5 px-5',
        sm: 'min-h-9 py-2.5 px-3.5',
        lg: 'min-h-16 py-4 px-7',
        icon: 'aspect-square',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const buttonShadowVariants = cva('rounded-md', {
  variants: {
    variant: {
      default: 'bg-[#45753C]',
      secondary: 'bg-slate-700',
      link: 'bg-transparent',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

interface ButtonProps
  extends PressableProps,
    VariantProps<typeof buttonVariants>,
    VariantProps<typeof buttonShadowVariants> {
  roundClass?: string | undefined;
}

export const Button = forwardRef<View, ButtonProps>(
  ({ className, variant, size, roundClass, ...props }, ref) => {
    return (
      <View className={cn(buttonShadowVariants({ variant }), roundClass)}>
        <Pressable
          ref={ref}
          className={cn(buttonVariants({ variant, size, className }))}
          {...props}
        />
      </View>
    );
  }
);
