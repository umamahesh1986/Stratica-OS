import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText as Text } from '@/components/AppText';
import { AppButton } from '@/components/AppButton';
import { EmptyState } from '@/components/EmptyState';
import { FeedbackMessage } from '@/components/FeedbackMessage';
import { PageHeader } from '@/components/PageHeader';
import { Screen } from '@/components/Screen';
import { StatusBadge } from '@/components/StatusBadge';
import { Surface } from '@/components/Surface';
import { useAuth } from '@/context/AuthContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import { getVisitStatus } from '@/services/operations';
import { colors, spacing } from '@/theme/tokens';

export function LocationStatusWorkspace() {
  const { session } = useAuth();
  const token = session?.accessToken ?? '';
  const loadStatus = useCallback(() => getVisitStatus(token), [token]);
  const { data, error, loading, refresh } = useAsyncData(loadStatus);
  const [permission, setPermission] = useState<Location.PermissionResponse | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);

  const readPermission = async () => {
    setRequesting(true);
    setPermissionError(null);
    try {
      let result = await Location.getForegroundPermissionsAsync();
      if (!result.granted && result.canAskAgain) {
        result = await Location.requestForegroundPermissionsAsync();
      }
      setPermission(result);
    } catch (cause) {
      setPermissionError(cause instanceof Error ? cause.message : 'Unable to read location permission status.');
    } finally {
      setRequesting(false);
    }
  };

  const report = data?.location;
  const permissionLabel = permission
    ? permission.granted
      ? 'Allowed while using the app'
      : permission.canAskAgain
        ? 'Not allowed'
        : 'Blocked in device settings'
    : 'Not checked';
  const reportStatus = report?.isOffline ? 'Offline' : report?.isStale ? 'Stale' : report ? 'Current' : 'No report';

  useEffect(() => {
    let active = true;
    Location.getForegroundPermissionsAsync()
      .then((result) => {
        if (active) setPermission(result);
      })
      .catch((cause: unknown) => {
        if (active) setPermissionError(cause instanceof Error ? cause.message : 'Unable to read location permission status.');
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <Screen>
      <PageHeader back title="Location tracking status" subtitle="Transparent location and report freshness." />
      <FeedbackMessage variant="info" message="Location is captured only when you request a visit action. The app does not track location in the background." />
      {permissionError && <FeedbackMessage message={permissionError} />}
      {error && (
        <Surface>
          <FeedbackMessage message={error} />
          <AppButton label="Retry report status" icon="refresh-cw" variant="secondary" onPress={() => void refresh()} style={{ marginTop: spacing.md }} />
        </Surface>
      )}
      <Surface style={{ gap: spacing.md }}>
        <TextBlock title="Device permission" body={permissionLabel} />
        <AppButton
          label={permission?.granted ? 'Refresh permission status' : 'Check location permission'}
          loading={requesting}
          onPress={() => void readPermission()}
          variant="secondary"
        />
      </Surface>
      <Surface style={{ gap: spacing.md }}>
        <ViewStatus status={reportStatus} />
        {loading && !data ? (
          <EmptyState title="Loading location status" description="Retrieving your last authorized location report." />
        ) : report ? (
          <>
            <TextBlock title="Reported at" body={new Date(report.reportedAt).toLocaleString()} />
            <TextBlock
              title="Reported accuracy"
              body={report.reportedAccuracyMeters == null ? 'Not reported' : `±${report.reportedAccuracyMeters} m`}
            />
            <TextBlock title="Offline" body={report.isOffline ? 'Yes' : 'No'} />
            <TextBlock title="Stale" body={report.isStale ? 'Yes — verify before acting' : 'No'} />
            <TextBlock
              title="Configured geofence radius"
              body={report.geofenceRadiusMeters === undefined ? 'Not configured' : `${report.geofenceRadiusMeters} m`}
            />
            <TextBlock title="Tracking mode" body="Foreground visit capture only" />
            <TextBlock title="Status checked" body={data ? new Date(data.updatedAt).toLocaleString() : '—'} />
          </>
        ) : (
          <EmptyState title="No location report" description="A report will appear after the service receives an authorized location update." />
        )}
      </Surface>
      <Text style={styles.note}>A configured geofence radius is not a claim of location precision. Device accuracy and report freshness are shown separately.</Text>
    </Screen>
  );
}

function TextBlock({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.textBlock}>
      <Text style={styles.label}>{title}</Text>
      <Text style={styles.value}>{body}</Text>
    </View>
  );
}

function ViewStatus({ status }: { status: string }) {
  return (
    <View style={styles.statusLine}>
      <Text style={styles.label}>Latest report status</Text>
      <StatusBadge status={status} />
    </View>
  );
}

const styles = StyleSheet.create({
  textBlock: {
    gap: spacing.xs,
  },
  label: {
    color: colors.muted,
    fontSize: 12,
  },
  value: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '600',
  },
  statusLine: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  note: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
  },
});
