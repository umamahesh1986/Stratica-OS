import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText as Text } from '@/components/AppText';
import { colors, radius, spacing } from '@/theme/tokens';

type FeedbackMessageProps = {
  message: string;
  variant?: 'error' | 'success' | 'info';
};

const variants = {
  error: { background: colors.dangerSoft, foreground: colors.danger, icon: 'alert-circle' as const },
  success: { background: colors.successSoft, foreground: colors.success, icon: 'check-circle' as const },
  info: { background: colors.infoSoft, foreground: colors.info, icon: 'info' as const },
};

export function FeedbackMessage({ message, variant = 'error' }: FeedbackMessageProps) {
  const palette = variants[variant];
  return (
    <View accessibilityRole="alert" style={[styles.wrap, { backgroundColor: palette.background }]}>
      <Feather name={palette.icon} size={18} color={palette.foreground} />
      <Text style={[styles.message, { color: palette.foreground }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'flex-start',
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  message: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
});
