import { StyleSheet, View } from 'react-native';

import { AppText as Text } from '@/components/AppText';
import { colors, radius } from '@/theme/tokens';

type StatusBadgeProps = {
  status: string;
};

function paletteForStatus(status: string) {
  const normalized = status.toLowerCase();
  if (['active', 'accepted', 'completed', 'delivered', 'online'].includes(normalized)) {
    return { background: colors.successSoft, foreground: colors.success };
  }
  if (['pending', 'review', 'assigned', 'in progress', 'draft', 'stale'].includes(normalized)) {
    return { background: colors.warningSoft, foreground: colors.warning };
  }
  if (['rejected', 'blocked', 'failed', 'overdue'].includes(normalized)) {
    return { background: colors.dangerSoft, foreground: colors.danger };
  }
  return { background: colors.infoSoft, foreground: colors.info };
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const palette = paletteForStatus(status);
  return (
    <View style={[styles.badge, { backgroundColor: palette.background }]}>
      <Text style={[styles.label, { color: palette.foreground }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
  },
});
