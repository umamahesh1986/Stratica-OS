import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { AppText as Text } from '@/components/AppText';
import { AppButton } from '@/components/AppButton';
import { EmptyState } from '@/components/EmptyState';
import { FeedbackMessage } from '@/components/FeedbackMessage';
import { PageHeader } from '@/components/PageHeader';
import { Screen } from '@/components/Screen';
import { SectionForm } from '@/components/SectionForm';
import { StatusBadge } from '@/components/StatusBadge';
import { Surface } from '@/components/Surface';
import { useAuth } from '@/context/AuthContext';
import { getSection } from '@/config/roleSections';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useRolePalette } from '@/hooks/useRolePalette';
import { getRecord, submitOperation } from '@/services/operations';
import { colors, spacing } from '@/theme/tokens';

export default function DashboardRecordRoute() {
  const { section: sectionParam, id: recordId, mode } = useLocalSearchParams<{
    section: string;
    id: string;
    mode?: string;
  }>();
  const { session } = useAuth();
  const section = session ? getSection(session.user.role, sectionParam) : undefined;
  const authorized = !!session && !!section && session.user.permissions.includes(section.permission);
  const createAction = section?.createAction;
  const canCreate = !!createAction && !!session?.user.permissions.includes(createAction.permission);
  const accessToken = session?.accessToken ?? '';

  useEffect(() => {
    if (session && (!authorized || recordId === 'new' && !canCreate)) {
      router.replace('/access-denied');
    }
  }, [authorized, canCreate, recordId, session]);

  if (!session || !section || !authorized) return null;
  if (recordId === 'new') {
    if (!canCreate) return null;
    return <SectionForm accessToken={accessToken} section={section} />;
  }
  return (
    <RecordDetail
      accessToken={accessToken}
      mode={mode}
      recordId={recordId}
      section={section}
      userPermissions={session.user.permissions}
    />
  );
}

function RecordDetail({
  accessToken,
  mode,
  recordId,
  section,
  userPermissions,
}: {
  accessToken: string;
  mode?: string;
  recordId: string;
  section: NonNullable<ReturnType<typeof getSection>>;
  userPermissions: string[];
}) {
  const loadRecord = useCallback(
    () => getRecord(accessToken, section.resource, section.id, recordId),
    [accessToken, recordId, section],
  );
  const { data: record, error, loading, refresh } = useAsyncData(loadRecord);
  const [actionError, setActionError] = useState<string | null>(null);
  const palette = useRolePalette();
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const updateAction = section.actions?.find((action) =>
    action.id === 'update' && userPermissions.includes(action.permission),
  );

  if (mode === 'edit' && updateAction && record) {
    return <SectionForm accessToken={accessToken} actionId={updateAction.id} record={record} section={section} />;
  }

  const runAction = (action: NonNullable<typeof section.actions>[number]) => {
    if (action.id === 'update') {
      router.push({
        pathname: '/dashboard/[section]/[id]',
        params: { section: section.id, id: recordId, mode: 'edit' },
      });
      return;
    }
    if (action.id === 'movement' || action.id === 'assign') {
      router.push({
        pathname: '/dashboard/[section]/[id]',
        params: { section: section.id, id: 'new' },
      });
      return;
    }
    Alert.alert(`${action.label}?`, `Confirm this action for “${record?.name ?? 'this record'}”.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: action.label,
        style: action.id === 'reject' ? 'destructive' : 'default',
        onPress: () => {
          setActionError(null);
          setBusyAction(action.id);
          void submitOperation(accessToken, section.resource, recordId, action.id, {})
            .then(() => {
              Alert.alert('Action completed', 'The service confirmed this update.');
              void refresh();
            })
            .catch((cause: unknown) => {
              setActionError(cause instanceof Error ? cause.message : 'The action could not be completed.');
            })
            .finally(() => setBusyAction(null));
        },
      },
    ]);
  };

  return (
    <Screen>
      <PageHeader back title={section.title} subtitle="Record details" />
      {error && (
        <Surface>
          <FeedbackMessage message={error} />
          <AppButton label="Retry" variant="secondary" icon="refresh-cw" onPress={() => void refresh()} style={styles.retry} />
        </Surface>
      )}
      {actionError && <FeedbackMessage message={actionError} />}
      {loading && !record ? (
        <Surface><EmptyState title="Loading record" description="Retrieving details authorized for your account." /></Surface>
      ) : !record ? (
        <Surface><EmptyState title="Record unavailable" description="This record may have been removed or may not be available to your account." /></Surface>
      ) : (
        <>
          <Surface style={styles.identity}>
            <View style={styles.identityTop}>
              <View style={[styles.icon, { backgroundColor: palette.primarySoft }]}>
                <Feather name={section.icon} size={21} color={palette.primary} />
              </View>
              <StatusBadge status={record.status} />
            </View>
            <Text style={styles.name}>{record.name}</Text>
            <Text style={styles.subtitle}>{record.subtitle}</Text>
            <Text style={styles.description}>{record.description}</Text>
            <Text style={styles.updated}>Updated {new Date(record.updatedAt).toLocaleString()}</Text>
          </Surface>

          {!!record.fields && Object.keys(record.fields).length > 0 && (
            <Surface style={styles.details}>
              <Text style={styles.sectionTitle}>Details</Text>
              {Object.entries(record.fields).map(([label, value]) => (
                <View key={label} style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{label}</Text>
                  <Text style={styles.detailValue}>{value}</Text>
                </View>
              ))}
            </Surface>
          )}

          {section.id === 'inventory' && (
            <Surface style={styles.details}>
              <Text style={styles.sectionTitle}>Inventory movement history</Text>
              {record.movements?.length ? (
                record.movements.map((movement) => (
                  <View key={movement.id} style={styles.movement}>
                    <View style={styles.movementHeader}>
                      <Text style={styles.detailValue}>{movement.type} · {movement.quantity} {movement.unit}</Text>
                      <StatusBadge status={movement.type.toLowerCase()} />
                    </View>
                    <Text style={styles.detailLabel}>{movement.reason}</Text>
                    <DetailRow label="Recorded" value={new Date(movement.recordedAt).toLocaleString()} />
                    <DetailRow label="Recorded by" value={movement.recordedBy} />
                    <DetailRow label="Reference" value={movement.reference} />
                  </View>
                ))
              ) : (
                <EmptyState
                  title="No movement history"
                  description="The service will show auditable stock movements here when inventory history is connected."
                />
              )}
            </Surface>
          )}

          {record.location && (
            <Surface style={styles.details}>
              <Text style={styles.sectionTitle}>Location report</Text>
              <View style={styles.locationTag}>
                <Feather name={record.location.isOffline ? 'wifi-off' : 'map-pin'} size={16} color={record.location.isOffline ? colors.warning : colors.info} />
                <Text style={styles.locationStatus}>
                  {record.location.isOffline ? 'Offline report' : record.location.isStale ? 'Stale report' : 'Most recent report'}
                </Text>
              </View>
              <DetailRow label="Reported at" value={new Date(record.location.reportedAt).toLocaleString()} />
              <DetailRow
                label="Reported accuracy"
                value={record.location.reportedAccuracyMeters === null
                  ? 'Not reported'
                  : `±${record.location.reportedAccuracyMeters} m`}
              />
              <DetailRow label="Offline status" value={record.location.isOffline ? 'Device reported offline' : 'Online at report time'} />
              <DetailRow label="Stale status" value={record.location.isStale ? 'Stale — verify before acting' : 'Not marked stale'} />
              {record.location.geofenceRadiusMeters !== undefined && (
                <Text style={styles.geofenceNote}>
                  Configured geofence radius: {record.location.geofenceRadiusMeters} m. Reported location accuracy is independent and does not guarantee precise geofence validation.
                </Text>
              )}
            </Surface>
          )}

          {!!section.actions?.filter((action) => userPermissions.includes(action.permission)).length && (
            <View style={styles.actions}>
              {section.actions
                ?.filter((action) => userPermissions.includes(action.permission))
                .map((action) => (
                  <AppButton
                    disabled={!!busyAction && busyAction !== action.id}
                    key={action.id}
                    label={action.label}
                    loading={busyAction === action.id}
                    onPress={() => runAction(action)}
                    variant={action.id === 'reject' ? 'danger' : action.id === 'update' ? 'secondary' : 'primary'}
                  />
                ))}
            </View>
          )}
          <Text style={styles.scopeNote}>Actions are checked by your service using this authenticated session.</Text>
        </>
      )}
    </Screen>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  identity: {
    gap: spacing.md,
  },
  identityTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  icon: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: 12,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  name: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
  },
  description: {
    color: colors.charcoal,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.xs,
  },
  updated: {
    color: colors.muted,
    fontSize: 11,
    marginTop: spacing.sm,
  },
  details: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  detailRow: {
    alignItems: 'flex-start',
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
  },
  detailLabel: {
    color: colors.muted,
    flex: 1,
    fontSize: 12,
  },
  detailValue: {
    color: colors.charcoal,
    flex: 1.2,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  movement: {
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  movementHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationTag: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  locationStatus: {
    color: colors.warning,
    fontSize: 13,
    fontWeight: '700',
  },
  geofenceNote: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  actions: {
    gap: spacing.md,
  },
  scopeNote: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
  retry: {
    marginTop: spacing.md,
  },
});
