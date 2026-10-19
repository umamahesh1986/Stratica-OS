import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, type ScrollViewInstance } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton';
import { AppText as Text } from '@/components/AppText';
import { Brand } from '@/components/Brand';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { FeedbackMessage } from '@/components/FeedbackMessage';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import { roleSections, type SectionDefinition } from '@/config/roleSections';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useRolePalette } from '@/hooks/useRolePalette';
import { getDashboardOverview } from '@/services/operations';
import type { IconName } from '@/types/operations';
import type { UserRole } from '@/types/auth';
import type { RolePalette } from '@/theme/rolePalettes';
import { radius, spacing } from '@/theme/tokens';

type FriendlyIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const friendlySectionIcons: Partial<Record<IconName, FriendlyIconName>> = {
  briefcase: 'briefcase-outline',
  truck: 'truck-outline',
  users: 'account-group-outline',
  'shopping-bag': 'store-outline',
  package: 'package-variant-closed',
  archive: 'archive-outline',
  'shopping-cart': 'cart-outline',
  map: 'map-marker-path',
  crosshair: 'crosshairs-gps',
  'credit-card': 'credit-card-outline',
  'bar-chart-2': 'chart-box-outline',
  'user-check': 'account-check-outline',
  settings: 'cog-outline',
  inbox: 'inbox-arrow-down-outline',
  'share-2': 'share-variant-outline',
  'check-square': 'clipboard-check-outline',
  'map-pin': 'map-marker-outline',
  clock: 'clock-outline',
  user: 'account-outline',
};

const friendlyMetricIcons: Partial<Record<IconName, FriendlyIconName>> = {
  ...friendlySectionIcons,
  'alert-circle': 'alert-circle-outline',
};

const roleTitles: Record<UserRole, string> = {
  STRATICS_ADMIN: 'Stratica Admin',
  PRODUCT_COMPANY_ADMIN: 'Product Company',
  DISTRIBUTOR_ADMIN: 'Distributor',
  FIELD_REPRESENTATIVE: 'Field Representative',
};

export default function DashboardRoute() {
  const { session, signOut } = useAuth();
  const palette = useRolePalette();
  const styles = useMemo(() => createDashboardStyles(palette), [palette]);
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollViewInstance | null>(null);
  const [attentionY, setAttentionY] = useState(0);
  const [workspaceY, setWorkspaceY] = useState(0);
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const accessToken = session?.accessToken ?? '';
  const loadOverview = useCallback(
    () => getDashboardOverview(accessToken, session?.user.role ?? 'STRATICS_ADMIN'),
    [accessToken, session?.user.role],
  );
  const { data, error, loading, refresh } = useAsyncData(loadOverview);

  if (!session) return null;

  const visibleSections = roleSections[session.user.role].filter((section) =>
    session.user.permissions.includes(section.permission),
  );
  const notificationsSection = visibleSections.find((section) => section.id === 'notifications');
  const accountSection = visibleSections.find((section) =>
    ['profile', 'settings', 'company-profile'].includes(section.id),
  );
  const openSection = (section: SectionDefinition | undefined) => {
    if (section) router.push({ pathname: '/dashboard/[section]', params: { section: section.id } });
  };

  const logout = async () => {
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
      <View style={styles.topline}>
        <View style={styles.brandTitle}>
          <Brand compact />
        </View>
        <View style={styles.headerActions}>
          {notificationsSection && (
            <Pressable
              accessibilityLabel="Open notifications"
              accessibilityRole="button"
              onPress={() => openSection(notificationsSection)}
              style={styles.headerButton}
            >
              <MaterialCommunityIcons name="bell-outline" color={palette.ink} size={20} />
              <View style={styles.notificationDot} />
            </Pressable>
          )}
          <Pressable
            accessibilityLabel={accountSection ? 'Open account' : 'Sign out'}
            accessibilityRole="button"
            onPress={() => accountSection ? openSection(accountSection) : setConfirmingSignOut(true)}
            style={styles.avatar}
          >
            {accountSection ? (
              <Text style={styles.avatarText}>
                {session.user.displayName.split(' ').map((part) => part[0]).join('').slice(0, 2)}
              </Text>
            ) : (
              <MaterialCommunityIcons name="logout-variant" color={palette.ink} size={19} />
            )}
          </Pressable>
          {accountSection && (
            <Pressable
              accessibilityLabel="Sign out"
              accessibilityRole="button"
              onPress={() => setConfirmingSignOut(true)}
              style={styles.headerButton}
            >
              <MaterialCommunityIcons name="logout-variant" color={palette.ink} size={19} />
            </Pressable>
          )}
        </View>
      </View>

      <ConfirmDialog
        busy={isSigningOut}
        confirmLabel="Sign out"
        message="You will need to sign in again to access your workspace."
        onCancel={() => setConfirmingSignOut(false)}
        onConfirm={() => void logout()}
        title="Sign out?"
        visible={confirmingSignOut}
      />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcome}>
          <View style={styles.welcomeTop}>
            <View style={styles.rolePill}>
              <View style={styles.roleDot} />
              <Text style={styles.eyebrow}>{roleTitles[session.user.role].toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.greeting}>Good day, {session.user.displayName.split(' ')[0]}</Text>
          <Text numberOfLines={1} style={styles.organization}>{session.user.organization.name}</Text>
          <View style={styles.welcomeBottom}>
            <Text style={styles.telemetryDetail}>
              {error ? 'Needs attention' : loading ? 'Updating…' : 'Overview'}
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.sectionSubtitle}>Operational pulse across your workspace</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Refresh dashboard overview"
            onPress={() => void refresh()}
            style={styles.refreshButton}
          >
            <Text style={styles.refreshText}>Refresh</Text>
            <MaterialCommunityIcons name="refresh" size={17} color={palette.primary} />
          </Pressable>
        </View>

        {loading && !data ? (
          <View style={styles.loadingCard}>
            <Text style={styles.loadingText}>Loading your authorized overview…</Text>
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            <FeedbackMessage message={error} />
            <AppButton label="Retry" icon="refresh-cw" variant="secondary" onPress={() => void refresh()} style={styles.retry} />
          </View>
        ) : data ? (
          <View style={styles.metricGrid}>
            {data.metrics.map((metric) => (
              <View key={metric.label} style={styles.metric}>
                <View style={styles.metricHeader}>
                  <View style={styles.metricIcon}>
                    <MaterialCommunityIcons
                      name={friendlyMetricIcons[metric.icon] ?? 'application-outline'}
                      size={20}
                      color={palette.primary}
                    />
                  </View>
                  <View style={styles.metricTag}>
                    <Text style={styles.metricTagText}>Live data pending</Text>
                  </View>
                </View>
                <Text style={styles.metricValue}>{metric.value}</Text>
                <Text style={styles.metricLabel}>{metric.label}</Text>
                <Text numberOfLines={2} style={styles.metricContext}>
                  {metric.context ?? 'No live service data'}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <View
          onLayout={(event) => setAttentionY(event.nativeEvent.layout.y)}
          style={styles.sectionBlock}
        >
          <View style={styles.sectionHeading}>
            <View style={styles.sectionHeadingLeft}>
              <View style={styles.headingDot} />
              <Text style={styles.sectionTitle}>Needs attention</Text>
            </View>
            <Text style={styles.sectionHint}>
              {data ? `Updated ${new Date(data.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Status'}
            </Text>
          </View>
          {error ? (
            <View style={styles.attentionPanel}>
              <FeedbackMessage message={error} />
              <AppButton label="Retry" icon="refresh-cw" variant="secondary" onPress={() => void refresh()} style={styles.retry} />
            </View>
          ) : data?.alerts.length ? (
            data.alerts.map((alert) => (
              <View key={alert.id} style={styles.attentionPanel}>
                <View style={styles.attentionCard}>
                  <View style={styles.attentionHeader}>
                    <Text style={styles.alertTitle}>{alert.title}</Text>
                    <StatusBadge status={alert.severity} />
                  </View>
                  <Text style={styles.alertDetail}>{alert.detail}</Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => void refresh()}
                    style={styles.diagnosticButton}
                  >
                    <MaterialCommunityIcons name="refresh" color={palette.surface} size={17} />
                    <Text style={styles.diagnosticText}>Refresh overview</Text>
                  </Pressable>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.attentionPanel}>
              <EmptyState title="No alerts to display" description="Workspace alerts will appear here when available." />
            </View>
          )}
        </View>

        <View
          onLayout={(event) => setWorkspaceY(event.nativeEvent.layout.y)}
          style={styles.sectionBlock}
        >
          <View style={styles.sectionHeading}>
            <View>
              <Text style={styles.sectionTitle}>Your workspace</Text>
              <Text style={styles.sectionSubtitle}>Tools available to your role</Text>
            </View>
            <View style={styles.areaCount}>
              <Text style={styles.areaCountText}>{visibleSections.length} areas</Text>
            </View>
          </View>
          {visibleSections.length ? (
            <View style={styles.sectionGrid}>
              {visibleSections.map((section) => (
                <Pressable
                  accessibilityRole="button"
                  key={section.id}
                  onPress={() => openSection(section)}
                  style={({ pressed }) => [styles.sectionCard, pressed && styles.pressed]}
                >
                  <View style={styles.sectionCardTop}>
                    <View style={styles.sectionIcon}>
                      <MaterialCommunityIcons
                        name={friendlySectionIcons[section.icon] ?? 'application-outline'}
                        size={21}
                        color={palette.primary}
                      />
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={19} color={palette.muted} />
                  </View>
                  <Text numberOfLines={1} style={styles.sectionName}>{section.title}</Text>
                  <Text numberOfLines={2} style={styles.sectionDescription}>{section.description}</Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.attentionPanel}>
              <EmptyState
                title="No workspace areas assigned"
                description="Your account does not currently have any dashboard permissions. Ask your organization administrator for access."
              />
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
        <BottomTab
          icon="view-dashboard-outline"
          label="Overview"
          palette={palette}
          selected
          styles={styles}
          onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
        />
        <BottomTab
          icon="alert-circle-outline"
          label="Alerts"
          palette={palette}
          styles={styles}
          onPress={() => scrollRef.current?.scrollTo({ y: attentionY, animated: true })}
        />
        <BottomTab
          icon="view-grid-outline"
          label="Workspace"
          palette={palette}
          styles={styles}
          onPress={() => scrollRef.current?.scrollTo({ y: workspaceY, animated: true })}
        />
        <BottomTab
          icon={accountSection?.id === 'settings' ? 'cog-outline' : 'account-outline'}
          label="Account"
          palette={palette}
          styles={styles}
          onPress={() => accountSection ? openSection(accountSection) : setConfirmingSignOut(true)}
        />
      </View>
    </SafeAreaView>
  );
}

function BottomTab({
  icon,
  label,
  palette,
  styles,
  selected = false,
  onPress,
}: {
  icon: FriendlyIconName;
  label: string;
  palette: RolePalette;
  styles: ReturnType<typeof createDashboardStyles>;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={styles.tab}
    >
      <MaterialCommunityIcons name={icon} size={21} color={selected ? palette.primary : palette.muted} />
      <Text style={[styles.tabLabel, selected && styles.tabLabelSelected]}>{label}</Text>
    </Pressable>
  );
}

function createDashboardStyles(palette: RolePalette) {
  return StyleSheet.create({
  safeArea: {
    backgroundColor: palette.canvas,
    flex: 1,
  },
  topline: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderBottomColor: palette.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 62,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  brandTitle: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  headerTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    position: 'relative',
    width: 40,
  },
  notificationDot: {
    backgroundColor: palette.accent,
    borderColor: palette.canvas,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 9,
    position: 'absolute',
    right: 8,
    top: 7,
    width: 9,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  avatarText: {
    color: palette.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  content: {
    alignSelf: 'center',
    gap: spacing.md,
    maxWidth: 920,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    width: '100%',
  },
  welcome: {
    backgroundColor: palette.primaryDark,
    borderColor: palette.primaryDark,
    borderRadius: radius.lg,
    borderWidth: 1,
    elevation: 3,
    gap: spacing.sm,
    padding: spacing.lg,
    shadowColor: palette.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 9,
  },
  welcomeTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rolePill: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  roleDot: {
    backgroundColor: palette.highlight,
    borderRadius: radius.pill,
    height: 7,
    width: 7,
  },
  eyebrow: {
    color: palette.accentSoft,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  greeting: {
    color: palette.surface,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginTop: spacing.xs,
  },
  organization: {
    color: palette.surface,
    fontSize: 12,
  },
  welcomeBottom: {
    alignItems: 'center',
    borderTopColor: 'rgba(255,255,255,0.16)',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.md,
  },
  telemetryDetail: {
    color: palette.accentSoft,
    fontSize: 10,
    fontWeight: '700',
  },
  sectionBlock: {
    gap: spacing.md,
    paddingTop: spacing.xs,
  },
  sectionHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionHeadingLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headingDot: {
    backgroundColor: palette.highlight,
    borderRadius: radius.pill,
    height: 8,
    width: 8,
  },
  sectionTitle: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: palette.muted,
    fontSize: 10,
    marginTop: 3,
  },
  refreshButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 38,
    paddingHorizontal: spacing.sm,
  },
  refreshText: {
    color: palette.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metric: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexBasis: '48%',
    flexGrow: 1,
    minHeight: 132,
    padding: spacing.md,
  },
  metricHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricIcon: {
    alignItems: 'center',
    backgroundColor: palette.primarySoft,
    borderRadius: radius.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  metricTag: {
    backgroundColor: palette.primaryPale,
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  metricTagText: {
    color: palette.primary,
    fontSize: 8,
    fontWeight: '700',
  },
  metricValue: {
    color: palette.ink,
    fontSize: 23,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
  metricLabel: {
    color: palette.ink,
    fontSize: 11,
    fontWeight: '700',
  },
  metricContext: {
    color: palette.muted,
    fontSize: 9,
    lineHeight: 13,
    marginTop: 3,
  },
  sectionHint: {
    color: palette.muted,
    fontSize: 9,
  },
  attentionPanel: {
    backgroundColor: palette.alert,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  attentionCard: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  attentionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  alertTitle: {
    color: palette.ink,
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
  },
  alertDetail: {
    color: palette.muted,
    fontSize: 10,
    lineHeight: 15,
  },
  diagnosticButton: {
    alignItems: 'center',
    backgroundColor: palette.primaryDark,
    borderRadius: 5,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 36,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  diagnosticText: {
    color: palette.surface,
    fontSize: 10,
    fontWeight: '700',
  },
  areaCount: {
    backgroundColor: palette.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  areaCountText: {
    color: palette.primary,
    fontSize: 9,
    fontWeight: '700',
  },
  sectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  sectionCard: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexBasis: '48%',
    flexGrow: 1,
    gap: spacing.sm,
    minHeight: 118,
    padding: spacing.md,
  },
  sectionCardTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  sectionIcon: {
    alignItems: 'center',
    backgroundColor: palette.primarySoft,
    borderRadius: radius.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  sectionName: {
    color: palette.ink,
    fontSize: 11,
    fontWeight: '800',
  },
  sectionDescription: {
    color: palette.muted,
    fontSize: 9,
    lineHeight: 13,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.99 }],
  },
  loadingCard: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: 90,
    justifyContent: 'center',
  },
  loadingText: {
    color: palette.muted,
    fontSize: 12,
  },
  errorCard: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  retry: {
    marginTop: spacing.md,
  },
  footer: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingBottom: spacing.md,
    paddingTop: spacing.lg,
  },
  footerTagline: {
    color: palette.muted,
    fontSize: 9,
  },
  bottomBar: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderTopColor: palette.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    gap: 3,
    justifyContent: 'center',
    minHeight: 48,
  },
  tabLabel: {
    color: palette.muted,
    fontSize: 9,
    fontWeight: '600',
  },
  tabLabelSelected: {
    color: palette.primary,
    fontWeight: '800',
  },
  });
}
