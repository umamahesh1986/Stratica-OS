import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText as Text } from '@/components/AppText';
import { AppButton } from '@/components/AppButton';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/context/AuthContext';
import { colors, spacing, typography } from '@/theme/tokens';

export default function AccessDeniedRoute() {
  const { session, signOut } = useAuth();
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

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
    <Screen contentStyle={styles.content}>
      <View style={styles.message}>
        <View style={styles.icon}>
          <Feather name="shield" color={colors.danger} size={28} />
        </View>
        <Text style={styles.title}>Access not available</Text>
        <Text style={styles.body}>
          {session
            ? 'Your account does not have permission to view this area. Access is controlled by your organization.'
            : 'You need an authorized account to access this area.'}
        </Text>
      </View>
      {session ? (
        <AppButton label="Return to my workspace" onPress={() => router.replace('/dashboard')} />
      ) : (
        <AppButton label="Back to sign in" onPress={() => router.replace('/login')} />
      )}
      {session && (
        <AppButton
          label="Sign out"
          variant="secondary"
          onPress={() => setConfirmingSignOut(true)}
        />
      )}
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

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  message: {
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.xxl,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: 24,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  title: {
    color: colors.ink,
    fontSize: typography.heading,
    fontWeight: '800',
    textAlign: 'center',
  },
  body: {
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: 22,
    maxWidth: 360,
    textAlign: 'center',
  },
});
