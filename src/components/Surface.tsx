import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useRolePalette } from '@/hooks/useRolePalette';
import { radius, spacing } from '@/theme/tokens';

type SurfaceProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
}>;

export function Surface({ children, style, padded = true }: SurfaceProps) {
  const palette = useRolePalette();
  return (
    <View
      style={[
        styles.surface,
        { backgroundColor: palette.surface, borderColor: palette.border },
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  padded: {
    padding: spacing.lg,
  },
});
