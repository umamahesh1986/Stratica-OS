import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText as Text } from '@/components/AppText';
import { useRolePalette } from '@/hooks/useRolePalette';
import { spacing, typography } from '@/theme/tokens';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  back?: boolean;
  onBack?: () => void;
  action?: { label: string; icon: 'plus' | 'filter' | 'more-horizontal'; onPress: () => void };
};

export function PageHeader({ title, subtitle, back = false, onBack, action }: PageHeaderProps) {
  const palette = useRolePalette();

  return (
    <View style={styles.row}>
      <View style={styles.leading}>
        {back && (
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={10}
            onPress={onBack ?? (() => {
              if (router.canGoBack()) router.back();
              else router.replace('/dashboard');
            })}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={19} color={palette.primary} />
          </Pressable>
        )}
        <View style={styles.text}>
          <Text style={[styles.title, { color: palette.ink }]}>{title}</Text>
          {subtitle && <Text style={[styles.subtitle, { color: palette.muted }]}>{subtitle}</Text>}
        </View>
      </View>
      {action && (
        <Pressable
          accessibilityLabel={action.label}
          accessibilityRole="button"
          onPress={action.onPress}
          style={[styles.action, { backgroundColor: palette.surface, borderColor: palette.border }]}
        >
          <Feather name={action.icon} size={18} color={palette.primary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  leading: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    gap: spacing.md,
  },
  backButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 32,
  },
  text: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.title,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
  },
  action: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
});
