import type { UserRole } from '@/types/auth';
import type { DashboardOverview, OperationalRecord, OrderOptions, RecordCollection } from '@/types/operations';
import { roleSections } from '@/config/roleSections';

export function mockPermissionsForRole(role: UserRole): string[] {
  const sections = roleSections[role];
  return [
    ...sections.map((section) => section.permission),
    ...sections.flatMap((section) => section.actions?.map((action) => action.permission) ?? []),
    ...sections.flatMap((section) => section.createAction ? [section.createAction.permission] : []),
  ];
}

export function mockOverview(role: UserRole): DashboardOverview {
  const metricsByRole: Record<UserRole, DashboardOverview['metrics']> = {
    STRATICS_ADMIN: [
      { label: 'Product companies', value: '—', context: 'No live directory data', icon: 'briefcase' },
      { label: 'Distributors', value: '—', context: 'No live directory data', icon: 'truck' },
      { label: 'Orders in progress', value: '—', context: 'No live order data', icon: 'package' },
      { label: 'Open alerts', value: '—', context: 'No live alert data', icon: 'alert-circle' },
    ],
    PRODUCT_COMPANY_ADMIN: [
      { label: 'My products', value: '—', context: 'Company-scoped service data', icon: 'package' },
      { label: 'Incoming orders', value: '—', context: 'Company-scoped service data', icon: 'inbox' },
      { label: 'Active dispatches', value: '—', context: 'Company-scoped service data', icon: 'truck' },
      { label: 'Authorized distributors', value: '—', context: 'Company-scoped service data', icon: 'share-2' },
    ],
    DISTRIBUTOR_ADMIN: [
      { label: 'Inventory items', value: '—', context: 'No live inventory data', icon: 'archive' },
      { label: 'Orders in progress', value: '—', context: 'No live order data', icon: 'shopping-cart' },
      { label: 'Field team', value: '—', context: 'No live team data', icon: 'users' },
      { label: 'Deliveries', value: '—', context: 'No live delivery data', icon: 'map' },
    ],
    FIELD_REPRESENTATIVE: [
      { label: 'Assigned work', value: '—', context: 'No live task data', icon: 'check-square' },
      { label: 'Assigned shops', value: '—', context: 'No live shop data', icon: 'shopping-bag' },
      { label: 'My orders', value: '—', context: 'No live order data', icon: 'shopping-cart' },
      { label: 'Location status', value: '—', context: 'No live location data', icon: 'crosshair' },
    ],
  };
  return {
    metrics: metricsByRole[role],
    alerts: [],
    updatedAt: new Date().toISOString(),
  };
}

function buildRecords(sectionId: string): OperationalRecord[] {
  const makeRecord = (
    index: number,
    name: string,
    subtitle: string,
    status: string,
    description: string,
    fields: Record<string, string> = {},
  ): OperationalRecord => ({
    id: `mock-record-${index}`,
    name,
    subtitle,
    status,
    updatedAt: new Date(Date.now() - index * 3_600_000).toISOString(),
    description,
    fields,
    ...(sectionId === 'location' || sectionId === 'team-tracking' || sectionId === 'live-tracking'
      ? {
          location: {
            reportedAt: new Date(Date.now() - 22 * 60_000).toISOString(),
            reportedAccuracyMeters: 38,
            isOffline: true,
            isStale: true,
            geofenceRadiusMeters: undefined,
          },
        }
      : {}),
  });

  switch (sectionId) {
    case 'inventory':
      return [
        makeRecord(1, 'Example stock item A', 'Movement history available', 'Review', 'Example inventory entry. Stock changes must be recorded as auditable movements.', { 'On-hand': 'Not connected', 'Movement log': 'No live history' }),
        makeRecord(2, 'Example stock item B', 'Movement history available', 'Review', 'Example inventory entry. Direct stock overwrites are not available.', { 'On-hand': 'Not connected', 'Movement log': 'No live history' }),
      ];
    case 'finance':
      return [makeRecord(1, 'Financial data unavailable', 'Backend integration required', 'Not connected', 'No financial values are fabricated in this preview.')];
    case 'location':
    case 'team-tracking':
    case 'live-tracking':
      return [makeRecord(1, 'Example team member', 'Last-known location — mock data', 'Stale', 'Mock location only. It is offline and stale; accuracy and reported time are shown in the detail view.')];
    case 'shops':
    case 'merchants':
      return [
        makeRecord(1, 'Example merchant A', 'Assigned merchant', 'Active', 'Example merchant record. Contact and address details are not connected.'),
        makeRecord(2, 'Example merchant B', 'Assigned merchant', 'Pending', 'Example merchant record. Contact and address details are not connected.'),
      ];
    case 'products':
      return [
        makeRecord(1, 'Example product A', 'Catalogue preview', 'Draft', 'Example catalogue entry; it is not a real product or partner submission.'),
        makeRecord(2, 'Example product B', 'Catalogue preview', 'Review', 'Example catalogue entry; it is not a real product or partner submission.'),
      ];
    case 'supply-orders':
    case 'incoming-orders':
    case 'merchant-orders':
    case 'my-orders':
      return [
        makeRecord(1, 'Example order A', 'Demo order reference', 'Pending', 'Example order with no live submission or fulfillment activity.'),
        makeRecord(2, 'Example order B', 'Demo order reference', 'In progress', 'Example order with no live submission or fulfillment activity.'),
      ];
    case 'deliveries':
      return [makeRecord(1, 'Example delivery A', 'Demo delivery assignment', 'Assigned', 'Example delivery; no live route or recipient information is available.')];
    case 'tasks':
      return [makeRecord(1, 'Example field task', 'Demo assignment', 'Assigned', 'Example task shown for preview; this is not a live assignment.')];
    case 'companies':
    case 'distributors':
    case 'field-representatives':
    case 'field-team':
    case 'distributor-network':
    case 'users':
      return [
        makeRecord(1, 'Example account A', 'Demo directory entry', 'Active', 'Example account. No actual organization or user details are included.'),
        makeRecord(2, 'Example account B', 'Demo directory entry', 'Pending', 'Example account. No actual organization or user details are included.'),
      ];
    default:
      return [makeRecord(1, 'Example record', 'Development preview', 'Review', 'Example data only. Connect the backend to view authorized records.')];
  }
}

export function mockRecordCollection(sectionId: string): RecordCollection {
  return {
    records: buildRecords(sectionId),
    updatedAt: new Date().toISOString(),
  };
}

export function mockRecordDetails(sectionId: string, id: string): OperationalRecord | null {
  return buildRecords(sectionId).find((record) => record.id === id) ?? null;
}

export function mockOrderOptions(): OrderOptions {
  return {
    merchants: buildRecords('shops'),
    products: buildRecords('products'),
  };
}
