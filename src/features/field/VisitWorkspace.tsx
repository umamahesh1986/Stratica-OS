import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText as Text } from '@/components/AppText';
import { AppButton } from '@/components/AppButton';
import { EmptyState } from '@/components/EmptyState';
import { FeedbackMessage } from '@/components/FeedbackMessage';
import { PageHeader } from '@/components/PageHeader';
import { Screen } from '@/components/Screen';
import { StatusBadge } from '@/components/StatusBadge';
import { Surface } from '@/components/Surface';
import { useAuth } from '@/context/AuthContext';
import { useRolePalette } from '@/hooks/useRolePalette';
import { useAsyncData } from '@/hooks/useAsyncData';
import { getRecords, getVisitStatus, submitVisitCapture } from '@/services/operations';
import type { OperationalRecord, VisitCapture } from '@/types/operations';
import type { VisitStatus } from '@/types/field';
import { colors, radius, spacing } from '@/theme/tokens';

export function VisitWorkspace() {
  const { session } = useAuth();
  const token = session?.accessToken ?? '';
  const loadShops = useCallback(() => getRecords(token, 'merchants', 'shops'), [token]);
  const loadVisit = useCallback(() => getVisitStatus(token), [token]);
  const shopsQuery = useAsyncData(loadShops);
  const visitQuery = useAsyncData(loadVisit);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string>('Not requested');
  const [capture, setCapture] = useState<VisitCapture | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const shops = shopsQuery.data?.records ?? [];
  const selectedShop = shops.find((shop) => shop.id === selectedShopId) ?? shops[0];
  const activeVisit = visitQuery.data?.activeVisit ?? null;

  const handleVisit = async () => {
    if (!session) return;
    if (!activeVisit && !selectedShop) {
      setError('No assigned shop is available for a visit.');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      let permission = await Location.getForegroundPermissionsAsync();
      if (!permission.granted && permission.canAskAgain) {
        permission = await Location.requestForegroundPermissionsAsync();
      }
      setPermissionStatus(permission.granted ? 'Allowed while using the app' : 'Permission denied');
      if (!permission.granted) {
        throw new Error('Location permission is required to record a visit check-in or check-out.');
      }
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) throw new Error('Device location services are turned off.');

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const reportedAccuracy = position.coords.accuracy;
      const positionCapture: VisitCapture = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracyMeters: typeof reportedAccuracy === 'number' ? reportedAccuracy : null,
        capturedAt: new Date(position.timestamp).toISOString(),
      };
      setCapture(positionCapture);

      const updatedStatus = await submitVisitCapture(
        session.accessToken,
        activeVisit ? 'check-out' : 'check-in',
        positionCapture,
        activeVisit?.id ?? selectedShop?.id ?? '',
      );
      visitQuery.refresh().catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : 'Visit was saved, but status could not be refreshed.');
      });
      setStatusOverride(updatedStatus);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to record this visit.');
    } finally {
      setBusy(false);
    }
  };

  const [statusOverride, setStatusOverride] = useState<VisitStatus | null>(null);
  const effectiveVisit = statusOverride ? statusOverride.activeVisit : activeVisit;
  const location = statusOverride ? statusOverride.location : visitQuery.data?.location;
  const locationLabel = useMemo(() => {
    if (!location) return 'No location report available';
    if (location.isOffline) return 'Offline report';
    if (location.isStale) return 'Last report is stale';
    return 'Latest report available';
  }, [location]);

  useEffect(() => {
    let active = true;
    Location.getForegroundPermissionsAsync()
      .then((permission) => {
        if (active) {
          setPermissionStatus(
            permission.granted
              ? 'Allowed while using the app'
              : permission.canAskAgain
                ? 'Not allowed'
                : 'Blocked in device settings',
          );
        }
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Unable to read location permission status.');
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <Screen>
      <PageHeader back title="Visit check-in / check-out" subtitle="Record an assigned shop visit." />
      {shopsQuery.error && <FeedbackMessage message={shopsQuery.error} />}
      {visitQuery.error && (
        <Surface>
          <FeedbackMessage message={visitQuery.error} />
          <AppButton label="Retry" variant="secondary" icon="refresh-cw" onPress={() => void visitQuery.refresh()} />
        </Surface>
      )}
      {error && <FeedbackMessage message={error} />}

      <Surface style={styles.statusCard}>
        <View style={styles.statusHeading}>
          <Text style={styles.cardTitle}>Current visit</Text>
          <StatusBadge status={effectiveVisit ? 'In progress' : 'Not checked in'} />
        </View>
        <Text style={styles.shopName}>{effectiveVisit?.merchantName ?? selectedShop?.name ?? 'Choose an assigned shop'}</Text>
        <Text style={styles.muted}>
          {effectiveVisit
            ? `Checked in ${new Date(effectiveVisit.checkedInAt).toLocaleString()}`
            : 'Check in when you arrive. Check out when the visit is complete.'}
        </Text>
      </Surface>

      {!effectiveVisit && (
        <View style={styles.shopList}>
          <Text style={styles.cardTitle}>Assigned shops</Text>
          {shopsQuery.loading && !shopsQuery.data ? (
            <Surface><EmptyState title="Loading assigned shops" description="Retrieving shops assigned to your account." /></Surface>
          ) : shops.length ? (
            shops.map((shop) => (
              <ShopOption
                key={shop.id}
                onPress={() => setSelectedShopId(shop.id)}
                selected={shop.id === (selectedShop?.id ?? selectedShopId)}
                shop={shop}
              />
            ))
          ) : (
            <Surface><EmptyState title="No shops assigned" description="Ask your distributor to assign a shop before starting a visit." /></Surface>
          )}
        </View>
      )}

      <Surface style={styles.statusCard}>
        <Text style={styles.cardTitle}>Location and permission</Text>
        <InfoRow label="Permission" value={permissionStatus} />
        <InfoRow label="Latest report" value={locationLabel} />
        <InfoRow
          label="Reported accuracy"
          value={location?.reportedAccuracyMeters == null
            ? capture?.accuracyMeters == null ? 'Not reported' : `±${capture.accuracyMeters.toFixed(0)} m`
            : `±${location.reportedAccuracyMeters} m`}
        />
        <InfoRow
          label="Reported at"
          value={location?.reportedAt
            ? new Date(location.reportedAt).toLocaleString()
            : capture?.capturedAt ? new Date(capture.capturedAt).toLocaleString() : 'Not reported'}
        />
        {location?.geofenceRadiusMeters !== undefined && (
          <Text style={styles.footnote}>
            Configured geofence radius: {location.geofenceRadiusMeters} m. The reported accuracy is separate; a 10 m radius is not assumed to be precise.
          </Text>
        )}
        {!location?.geofenceRadiusMeters && (
          <Text style={styles.footnote}>Geofence radius: not configured. Accuracy varies by device and conditions.</Text>
        )}
      </Surface>
      <AppButton
        label={effectiveVisit ? 'Check out of visit' : 'Check in to shop'}
        loading={busy}
        onPress={() => void handleVisit()}
        disabled={!effectiveVisit && !selectedShop}
      />
      <Text style={styles.footnote}>Location is requested only for this foreground visit action. No background tracking is enabled.</Text>
    </Screen>
  );
}

function ShopOption({
  shop,
  selected,
  onPress,
}: {
  shop: OperationalRecord;
  selected: boolean;
  onPress: () => void;
}) {
  const palette = useRolePalette();

  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress}>
      <Surface style={[
        styles.shopOption,
        selected && styles.shopSelected,
        { borderColor: selected ? palette.primary : palette.border },
      ]}
      >
        <View style={[styles.radio, { borderColor: selected ? palette.primary : palette.muted }]}>
          {selected && <View style={[styles.radioDot, { backgroundColor: palette.primary }]} />}
        </View>
        <View style={styles.shopCopy}>
          <Text style={styles.shopName}>{shop.name}</Text>
          <Text style={styles.muted}>{shop.subtitle}</Text>
        </View>
      </Surface>
    </Pressable>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statusCard: {
    gap: spacing.md,
  },
  statusHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  shopName: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  muted: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  shopList: {
    gap: spacing.md,
  },
  shopOption: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  shopSelected: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  radio: {
    alignItems: 'center',
    borderColor: colors.muted,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  radioDot: {
    backgroundColor: colors.ink,
    borderRadius: radius.pill,
    height: 10,
    width: 10,
  },
  shopCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  infoRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  infoValue: {
    color: colors.charcoal,
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  footnote: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 17,
  },
});
