import { forwardRef } from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  onPress?: () => void;
  title: string;
  className?: string;
  textStyle?: string;
}

export const Button = forwardRef<TouchableOpacity, ButtonProps>(
  ({ onPress, title, className = '', textStyle = '' }, ref) => {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        ref={ref}
        className={`${styles.button} ${className}`}
        onPress={onPress}>
        <Text className={`${styles.buttonText} ${textStyle}`}>{title}</Text>
      </TouchableOpacity>
    );
  }
);

const styles = {
  button: 'items-center bg-green-500 rounded shadow-md p-4',
  buttonText: 'text-white text-3xl font-bold text-center',
};
