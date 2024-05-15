import { cn } from "~/lib/utils"
import { Text as ThemedText } from './Themed';
import { TextProps } from "react-native";
import { VariantProps, cva } from "class-variance-authority";

const Text = (props: TextProps) => {
  return <ThemedText maxFontSizeMultiplier={1} {...props} />;
};

const positionVariants = cva(
  'absolute p-0.5 font-bold',
  {
    variants: {
      position: {
        default: 'top-0 left-0',
        "top-right": 'top-0 right-0',
        "bottom-left": 'bottom-0 left-0',
        "bottom-right": 'bottom-0 right-0',
      }
    },
    defaultVariants: {
      position: 'default',
    },
  }
);

interface BoardNotationProps extends VariantProps<typeof positionVariants> {
  white: boolean,
  value: number | string
}

export const BoardNotation = ({ white, value, position }: BoardNotationProps) => {
  return (
    <Text
      className={cn(positionVariants({ position }),
        !white ? 'text-[#EBEDD0]' : 'text-[#739552]'
      )}>
      {value}
    </Text>
  )
}