import { Text as DefaultText, TextProps } from 'react-native';

export function Text(props: TextProps) {
  const { maxFontSizeMultiplier, ...otherProps } = props;

  return <DefaultText {...otherProps} maxFontSizeMultiplier={maxFontSizeMultiplier || 1.25} />;
}
