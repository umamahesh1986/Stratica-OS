import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppText as Text } from '@/components/AppText';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PageHeader } from '@/components/PageHeader';
import { Screen } from '@/components/Screen';
import { Surface } from '@/components/Surface';
import { useAuth } from '@/context/AuthContext';
import { useRolePalette } from '@/hooks/useRolePalette';
import { colors, spacing } from '@/theme/tokens';

const roleLabels = {
  STRATICS_ADMIN: 'Stratica Admin',
  PRODUCT_COMPANY_ADMIN: 'Product Company Admin',
  DISTRIBUTOR_ADMIN: 'Distributor Admin',
  FIELD_REPRESENTATIVE: 'Field Representative',
} as const;

export function ProfileWorkspace() {
  const { session, signOut } = useAuth();
  const palette = useRolePalette();
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  if (!session) return null;

  const confirmSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.replace('/login');
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Unable to complete remote sign out.';
      router.replace({ pathname: '/login', params: { notice: `You are signed out on this device, but the service did not confirm sign out: ${message}` } });
    } finally {
      setIsSigningOut(false);
      setConfirmingSignOut(false);
    }
  };

  return (
    <Screen>
      <PageHeader back title="Profile" subtitle="Your authenticated account." />
      <Surface style={styles.profile}>
        <View style={[styles.avatar, { backgroundColor: palette.primarySoft }]}>
          <Text style={[styles.initials, { color: palette.primary }]}>{session.user.displayName.split(' ').map((part) => part[0]).join('').slice(0, 2)}</Text>
        </View>
        <Text style={styles.name}>{session.user.displayName}</Text>
        <Text style={styles.email}>{session.user.email}</Text>
      </Surface>
      <Surface style={styles.details}>
        <Detail label="Role" value={roleLabels[session.user.role]} />
        <Detail label="Organization" value={session.user.organization.name} />
        <Detail label="Authorized workspace" value="Managed by your organization's service" />
      </Surface>
      <Text style={styles.note}>Role and organization access are provided by the authenticated service, not selected in the app.</Text>
      <AppButton label="Sign out" icon="log-out" variant="secondary" onPress={() => setConfirmingSignOut(true)} />
      <ConfirmDialog
        busy={isSigningOut}
        confirmLabel="Sign out"
        message="You will need to sign in again to access your workspace."
        onCancel={() => setConfirmingSignOut(false)}
        onConfirm={() => void confirmSignOut()}
        title="Sign out?"
        visible={confirmingSignOut}
      />
    </Screen>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  profile: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxxl,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  initials: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '800',
  },
  name: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '800',
  },
  email: {
    color: colors.muted,
    fontSize: 13,
  },
  details: {
    gap: spacing.lg,
  },
  detail: {
    gap: spacing.xs,
  },
  detailLabel: {
    color: colors.muted,
    fontSize: 12,
  },
  detailValue: {
    color: colors.charcoal,
    fontSize: 14,
    fontWeight: '600',
  },
  note: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
});
