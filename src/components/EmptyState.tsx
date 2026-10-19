import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText as Text } from '@/components/AppText';
import { colors, spacing } from '@/theme/tokens';

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: 'inbox' | 'search' | 'wifi-off';
};

export function EmptyState({ title, description, icon = 'inbox' }: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <Feather name={icon} size={25} color={colors.muted} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxxl,
  },
  title: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
});
