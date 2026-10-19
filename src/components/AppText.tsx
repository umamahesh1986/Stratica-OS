import { StyleSheet, Text as NativeText, type TextProps, type TextStyle } from 'react-native';

import { fontFamilies } from '@/theme/tokens';

const fontByWeight: Record<string, string> = {
  '100': fontFamilies.light,
  '200': fontFamilies.light,
  '300': fontFamilies.light,
  '400': fontFamilies.regular,
  '500': fontFamilies.medium,
  '600': fontFamilies.semibold,
  '700': fontFamilies.bold,
  '800': fontFamilies.extrabold,
  '900': fontFamilies.black,
  normal: fontFamilies.regular,
  bold: fontFamilies.bold,
};

export function AppText({ style, ...props }: TextProps) {
  const weight = StyleSheet.flatten(style as TextStyle | TextStyle[] | undefined)?.fontWeight;
  const fontFamily = weight ? fontByWeight[weight] ?? fontFamilies.regular : fontFamilies.regular;

  return <NativeText {...props} style={[{ fontFamily }, style]} />;
}
