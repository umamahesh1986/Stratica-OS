import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText as Text } from '@/components/AppText';
import { AppButton } from '@/components/AppButton';
import { EmptyState } from '@/components/EmptyState';
import { FeedbackMessage } from '@/components/FeedbackMessage';
import { PageHeader } from '@/components/PageHeader';
import { Screen } from '@/components/Screen';
import { SearchField } from '@/components/SearchField';
import { StatusBadge } from '@/components/StatusBadge';
import { Surface } from '@/components/Surface';
import { LocationStatusWorkspace } from '@/features/field/LocationStatusWorkspace';
import { VisitWorkspace } from '@/features/field/VisitWorkspace';
import { NewOrderWorkspace } from '@/features/field/NewOrderWorkspace';
import { ProfileWorkspace } from '@/features/profile/ProfileWorkspace';
import { SettingsWorkspace } from '@/features/settings/SettingsWorkspace';
import { useAuth } from '@/context/AuthContext';
import { getSection } from '@/config/roleSections';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useRolePalette } from '@/hooks/useRolePalette';
import { getRecords } from '@/services/operations';
import type { OperationalRecord } from '@/types/operations';
import { colors, radius, spacing } from '@/theme/tokens';

const statusFilters = ['All', 'Active', 'Pending', 'In progress', 'Completed'];

export default function DashboardSectionRoute() {
  const { section: sectionParam } = useLocalSearchParams<{ section: string }>();
  const { session } = useAuth();
  const palette = useRolePalette();
  const section = session ? getSection(session.user.role, sectionParam) : undefined;
  const hasPermission = !!section && !!session?.user.permissions.includes(section.permission);
  const accessToken = session?.accessToken ?? '';
  const loadRecords = useCallback(
    () => section && hasPermission && !['visit', 'new-order', 'location', 'profile', 'settings'].includes(section.id)
      ? getRecords(accessToken, section.resource, section.id)
      : Promise.resolve({ records: [], updatedAt: '' }),
    [accessToken, hasPermission, section],
  );
  const { data, error, loading, refresh } = useAsyncData(loadRecords);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    if (session && (!section || !hasPermission)) router.replace('/access-denied');
  }, [hasPermission, section, session]);

  const filteredRecords = useMemo(() => {
    const records = data?.records ?? [];
    const query = search.trim().toLowerCase();
    return records.filter((record) => {
      const matchesSearch = !query || `${record.name} ${record.subtitle} ${record.status}`.toLowerCase().includes(query);
      const matchesStatus = filter === 'All' || record.status.toLowerCase() === filter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [data?.records, filter, search]);

  if (!session || !section || !hasPermission) return null;

  if (section.id === 'new-order') return <NewOrderWorkspace />;
  if (section.id === 'visit') return <VisitWorkspace />;
  if (section.id === 'location') return <LocationStatusWorkspace />;
  if (section.id === 'profile') return <ProfileWorkspace />;
  if (section.id === 'settings') return <SettingsWorkspace />;

  const createAction = section.createAction &&
    session.user.permissions.includes(section.createAction.permission)
    ? section.createAction
    : undefined;

  return (
    <Screen>
      <PageHeader
        back
        title={section.title}
        subtitle={section.description}
        action={createAction ? { label: createAction.label, icon: 'plus', onPress: () => router.push({ pathname: '/dashboard/[section]/[id]', params: { section: section.id, id: 'new' } }) } : undefined}
      />
      {section.id === 'inventory' && (
        <FeedbackMessage variant="info" message="Inventory changes are movements with an audit trail; stock totals cannot be overwritten here." />
      )}
      {error ? (
        <Surface>
          <FeedbackMessage message={error} />
          <AppButton label="Retry" icon="refresh-cw" variant="secondary" onPress={() => void refresh()} style={styles.retry} />
        </Surface>
      ) : null}
      <SearchField
        onChangeText={setSearch}
        placeholder={`Search ${section.title.toLowerCase()}`}
        value={search}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {statusFilters.map((status) => (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: filter === status }}
            key={status}
            onPress={() => setFilter(status)}
            style={[
              styles.filter,
              { borderColor: palette.border, backgroundColor: palette.surface },
              filter === status && { backgroundColor: palette.primary, borderColor: palette.primary },
            ]}
          >
            <Text style={[styles.filterText, filter === status && styles.activeFilterText]}>{status}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.listHeader}>
        <Text style={styles.listCount}>
          {loading && !data ? 'Loading records…' : `${filteredRecords.length} ${filteredRecords.length === 1 ? 'record' : 'records'}`}
        </Text>
        <Text style={styles.listHint}>Select a record for details</Text>
      </View>
      {loading && !data ? (
        <Surface><EmptyState title="Loading your records" description="Retrieving records allowed for your account." /></Surface>
      ) : filteredRecords.length ? (
        filteredRecords.map((record) => (
          <RecordRow
            key={record.id}
            onPress={() => router.push({ pathname: '/dashboard/[section]/[id]', params: { section: section.id, id: record.id } })}
            record={record}
          />
        ))
      ) : (
        <Surface>
          <EmptyState
            icon={search ? 'search' : 'inbox'}
            title={search || filter !== 'All' ? 'No matching records' : 'Nothing here yet'}
            description={search || filter !== 'All' ? 'Try another search term or status filter.' : 'New records will appear here when your organization connects its service.'}
          />
        </Surface>
      )}
      {!loading && data && (
        <Text style={styles.updated}>Updated {new Date(data.updatedAt).toLocaleString()}</Text>
      )}
    </Screen>
  );
}

function RecordRow({ record, onPress }: { record: OperationalRecord; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      <Surface style={styles.recordCard}>
        <View style={styles.recordTop}>
          <View style={styles.recordCopy}>
            <Text numberOfLines={1} style={styles.recordName}>{record.name}</Text>
            <Text numberOfLines={1} style={styles.recordSubtitle}>{record.subtitle}</Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.muted} />
        </View>
        <View style={styles.recordBottom}>
          <StatusBadge status={record.status} />
          <Text style={styles.recordDate}>{new Date(record.updatedAt).toLocaleDateString()}</Text>
        </View>
      </Surface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  filters: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  filter: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  filterText: {
    color: colors.charcoal,
    fontSize: 12,
    fontWeight: '600',
  },
  activeFilterText: {
    color: colors.surface,
  },
  listHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  listCount: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  listHint: {
    color: colors.muted,
    fontSize: 11,
  },
  recordCard: {
    gap: spacing.md,
  },
  recordTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  recordCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  recordName: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  recordSubtitle: {
    color: colors.muted,
    fontSize: 12,
  },
  recordBottom: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recordDate: {
    color: colors.muted,
    fontSize: 11,
  },
  updated: {
    color: colors.muted,
    fontSize: 11,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
  retry: {
    marginTop: spacing.md,
  },
});
