import type { PropsWithChildren } from 'react';
import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText as Text } from '@/components/AppText';
import { Brand } from '@/components/Brand';
import { Screen } from '@/components/Screen';
import { colors, spacing, typography } from '@/theme/tokens';

type AuthScaffoldProps = PropsWithChildren<{
  title: string;
  description: string;
  backLabel?: string;
  backHref?: '/login';
}>;

export function AuthScaffold({
  title,
  description,
  backLabel = 'Back to sign in',
  backHref = '/login',
  children,
}: AuthScaffoldProps) {
  return (
    <Screen contentStyle={styles.content}>
      <Brand />
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        {children}
        <Link href={backHref} style={styles.backLink}>
          {backLabel}
        </Link>
      </View>
      <Text style={styles.footer}>Powered by Stratica. Designed for Scale.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingTop: spacing.xxxl,
  },
  body: {
    gap: spacing.lg,
    maxWidth: 500,
    paddingVertical: spacing.xxxl,
    width: '100%',
  },
  title: {
    color: colors.ink,
    fontSize: typography.heading,
    fontWeight: '800',
  },
  description: {
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: 21,
    marginBottom: spacing.sm,
  },
  backLink: {
    color: colors.charcoal,
    fontFamily: 'Figtree_700Bold',
    fontSize: 14,
    fontWeight: '700',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  footer: {
    color: colors.muted,
    fontSize: 11,
    fontFamily: 'Figtree_400Regular',
    paddingBottom: spacing.xxl,
    textAlign: 'center',
  },
});
