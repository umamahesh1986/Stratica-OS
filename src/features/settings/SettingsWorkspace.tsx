import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { AppText as Text } from '@/components/AppText';
import { PageHeader } from '@/components/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { useRolePalette } from '@/hooks/useRolePalette';
import { DEVELOPMENT_MOCK_AUTH } from '@/services/auth';
import type { RolePalette } from '@/theme/rolePalettes';
import { radius, spacing } from '@/theme/tokens';

const roleLabels = {
  STRATICS_ADMIN: 'Stratica Admin',
  PRODUCT_COMPANY_ADMIN: 'Product Company Admin',
  DISTRIBUTOR_ADMIN: 'Distributor Admin',
  FIELD_REPRESENTATIVE: 'Field Representative',
} as const;

export function SettingsWorkspace() {
  const { session, signOut } = useAuth();
  const palette = useRolePalette();
  const styles = useMemo(() => createSettingsStyles(palette), [palette]);
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (!session) return null;

  const notificationSection = ['notifications.read', 'notifications.manage']
    .some((permission) => session.user.permissions.includes(permission));

  const finishSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.replace('/login');
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Unable to complete remote sign out.';
      router.replace({
        pathname: '/login',
        params: { notice: `You are signed out on this device, but the service did not confirm sign out: ${message}` },
      });
    } finally {
      setIsSigningOut(false);
      setConfirmingSignOut(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          back
          onBack={() => router.replace('/dashboard')}
          title="Settings"
          subtitle="Workspace preferences and access."
        />

        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Feather name="sliders" size={21} color={palette.primary} />
          </View>
          <Text style={styles.heroEyebrow}>WORKSPACE CONTROL</Text>
          <Text style={styles.heroTitle}>Your workspace,{'\n'}your way.</Text>
          <Text style={styles.heroDescription}>
            Review your organization and access details. Configuration changes are managed by your service.
          </Text>
          <View style={styles.heroTag}>
            <View style={styles.heroDot} />
            <Text style={styles.heroTagText}>Authenticated workspace</Text>
          </View>
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Workspace</Text>
          <Text style={styles.sectionHint}>Current account context</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.organizationIcon}>
            <Feather name="briefcase" size={18} color={palette.primary} />
          </View>
          <View style={styles.organizationCopy}>
            <Text style={styles.cardEyebrow}>ORGANIZATION</Text>
            <Text numberOfLines={2} style={styles.organizationName}>
              {session.user.organization.name}
            </Text>
            <Text style={styles.organizationType}>{roleLabels[session.user.role]}</Text>
          </View>
          <Feather name="check-circle" size={18} color={palette.primary} />
        </View>

        {/* <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <Text style={styles.sectionHint}>Application appearance</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.rowHeading}>
            <View style={styles.rowIcon}>
              <Feather name="droplet" size={17} color={palette.primary} />
            </View>
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>Color theme</Text>
              <Text style={styles.rowDescription}>A calm, high-contrast workspace palette</Text>
            </View>
          </View>
          <View accessibilityLabel="Current sage and forest color palette" style={styles.swatches}>
            {[palette.primaryDark, palette.primary, palette.accent, palette.primarySoft, palette.canvas].map((color) => (
              <View key={color} style={[styles.swatch, { backgroundColor: color }]} />
            ))}
            <View style={styles.currentTheme}>
              <Feather name="check" size={12} color={palette.primary} />
              <Text style={styles.currentThemeText}>Current</Text>
            </View>
          </View>
          <Text style={styles.preferenceNote}>Theme selection is not available until preferences are connected.</Text>
        </View> */}

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Account & access</Text>
          <Text style={styles.sectionHint}>Managed securely</Text>
        </View>
        <View style={styles.card}>
          <InfoRow icon="user" label="Signed in as" value={session.user.displayName} styles={styles} />
          <View style={styles.divider} />
          <InfoRow icon="mail" label="Email" value={session.user.email} styles={styles} />
          <View style={styles.divider} />
          <InfoRow icon="shield" label="Access" value={`${session.user.permissions.length} assigned permissions`} styles={styles} />
          {notificationSection && (
            <>
              <View style={styles.divider} />
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push({ pathname: '/dashboard/[section]', params: { section: 'notifications' } })}
                style={styles.actionRow}
              >
                <View style={styles.rowIcon}>
                  <Feather name="bell" size={17} color={palette.primary} />
                </View>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle}>Notifications</Text>
                  <Text style={styles.rowDescription}>View workspace updates</Text>
                </View>
                <Feather name="chevron-right" size={18} color={palette.muted} />
              </Pressable>
            </>
          )}
        </View>

        {!DEVELOPMENT_MOCK_AUTH && <View style={styles.notice}>
          <Feather name="info" size={17} color="#8C6C21" />
          <Text style={styles.noticeText}>
            Workspace settings are displayed from your authenticated account. Changes must be made through the connected service.
          </Text>
        </View>}

        <Pressable
          accessibilityRole="button"
          onPress={() => setConfirmingSignOut(true)}
          style={styles.signOut}
        >
          <Feather name="log-out" size={17} color="#9F3D38" />
          <Text style={styles.signOutText}>Sign out of this device</Text>
        </Pressable>
        <Text style={styles.footer}>Powered by Stratica. Designed for Scale.</Text>
      </ScrollView>

      <ConfirmDialog
        busy={isSigningOut}
        confirmLabel="Sign out"
        message="You will need to sign in again to access your workspace."
        onCancel={() => setConfirmingSignOut(false)}
        onConfirm={() => void finishSignOut()}
        title="Sign out?"
        visible={confirmingSignOut}
      />
    </SafeAreaView>
  );
}

function InfoRow({
  icon,
  label,
  value,
  styles,
}: {
  icon: 'user' | 'mail' | 'shield';
  label: string;
  value: string;
  styles: ReturnType<typeof createSettingsStyles>;
}) {
  const palette = useRolePalette();

  return (
    <View style={styles.infoRow}>
      <View style={styles.rowIcon}>
        <Feather name={icon} size={17} color={palette.primary} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text numberOfLines={2} style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function createSettingsStyles(palette: RolePalette) {
  return StyleSheet.create({
  safeArea: {
    backgroundColor: palette.canvas,
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  hero: {
    backgroundColor: palette.primaryDark,
    borderRadius: 22,
    gap: spacing.sm,
    overflow: 'hidden',
    padding: spacing.xl,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: palette.primaryPale,
    borderRadius: 14,
    height: 42,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: 42,
  },
  heroEyebrow: {
    color: palette.accentSoft,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  heroTitle: {
    color: palette.surface,
    fontSize: 27,
    fontWeight: '800',
    lineHeight: 32,
  },
  heroDescription: {
    color: palette.surface,
    fontSize: 13,
    lineHeight: 19,
    maxWidth: 320,
  },
  heroTag: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.11)',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  heroDot: {
    backgroundColor: palette.highlight,
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  heroTagText: {
    color: palette.surface,
    fontSize: 11,
    fontWeight: '600',
  },
  sectionHeading: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  sectionTitle: {
    color: palette.ink,
    fontSize: 17,
    fontWeight: '800',
  },
  sectionHint: {
    color: palette.muted,
    fontSize: 10,
  },
  card: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  organizationIcon: {
    alignItems: 'center',
    backgroundColor: palette.primarySoft,
    borderRadius: 13,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  organizationCopy: {
    flex: 1,
    gap: 3,
  },
  cardEyebrow: {
    color: palette.muted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  organizationName: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: '800',
  },
  organizationType: {
    color: palette.muted,
    fontSize: 12,
  },
  rowHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  rowIcon: {
    alignItems: 'center',
    backgroundColor: palette.primaryPale,
    borderRadius: 12,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  rowCopy: {
    flex: 1,
    gap: 3,
  },
  rowTitle: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '700',
  },
  rowDescription: {
    color: palette.muted,
    fontSize: 11,
    lineHeight: 16,
  },
  swatches: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  swatch: {
    borderColor: palette.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 27,
    width: 27,
  },
  currentTheme: {
    alignItems: 'center',
    backgroundColor: palette.primarySoft,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 4,
    marginLeft: 'auto',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  currentThemeText: {
    color: palette.primary,
    fontSize: 10,
    fontWeight: '700',
  },
  preferenceNote: {
    color: palette.muted,
    fontSize: 11,
    lineHeight: 16,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 48,
  },
  infoLabel: {
    color: palette.muted,
    fontSize: 10,
  },
  infoValue: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    backgroundColor: palette.border,
    height: StyleSheet.hairlineWidth,
    marginLeft: 50,
  },
  actionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 48,
  },
  notice: {
    alignItems: 'flex-start',
    backgroundColor: palette.accentSoft,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  noticeText: {
    color: '#6F5722',
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
  },
  signOut: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.sm,
  },
  signOutText: {
    color: '#9F3D38',
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    color: palette.muted,
    fontSize: 10,
    textAlign: 'center',
  },
  });
}
