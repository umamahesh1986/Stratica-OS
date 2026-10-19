import type { ComponentProps } from 'react';
import type { Feather } from '@expo/vector-icons';

export type IconName = ComponentProps<typeof Feather>['name'];

export type Metric = {
  label: string;
  value: string;
  context?: string;
  icon: IconName;
};

export type AlertItem = {
  id: string;
  title: string;
  detail: string;
  severity: 'info' | 'warning' | 'critical';
};

export type DashboardOverview = {
  metrics: Metric[];
  alerts: AlertItem[];
  updatedAt: string;
};

export type LocationSnapshot = {
  reportedAt: string;
  reportedAccuracyMeters: number | null;
  isOffline: boolean;
  isStale: boolean;
  geofenceRadiusMeters?: number;
};

export type InventoryMovement = {
  id: string;
  type: 'INBOUND' | 'OUTBOUND' | 'ADJUSTMENT';
  quantity: number;
  unit: string;
  reason: string;
  recordedAt: string;
  recordedBy: string;
  reference: string;
};

export type OperationalRecord = {
  id: string;
  name: string;
  subtitle: string;
  status: string;
  updatedAt: string;
  description: string;
  location?: LocationSnapshot;
  movements?: InventoryMovement[];
  fields?: Record<string, string>;
};

export type RecordCollection = {
  records: OperationalRecord[];
  updatedAt: string;
};

export type OrderOptions = {
  merchants: OperationalRecord[];
  products: OperationalRecord[];
};

export type VisitCapture = {
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
  capturedAt: string;
};
