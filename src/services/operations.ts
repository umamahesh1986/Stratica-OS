import { apiRequest, ApiError } from '@/services/api';
import { DEVELOPMENT_MOCK_AUTH } from '@/services/auth';
import { mockOrderOptions, mockOverview, mockRecordCollection, mockRecordDetails } from '@/services/mockData';
import type {
  DashboardOverview,
  OrderOptions,
  OperationalRecord,
  RecordCollection,
  VisitCapture,
} from '@/types/operations';
import type { UserRole } from '@/types/auth';
import type { VisitStatus } from '@/types/field';
import { OPERATIONS_ENDPOINTS } from '@/config/endpoints';

export async function getDashboardOverview(accessToken: string, role: UserRole): Promise<DashboardOverview> {
  if (DEVELOPMENT_MOCK_AUTH) return mockOverview(role);
  return apiRequest<DashboardOverview>(OPERATIONS_ENDPOINTS.dashboardOverview, {}, accessToken);
}

export async function getRecords(
  accessToken: string,
  resource: string,
  sectionId: string,
): Promise<RecordCollection> {
  if (DEVELOPMENT_MOCK_AUTH) return mockRecordCollection(sectionId);
  return apiRequest<RecordCollection>(OPERATIONS_ENDPOINTS.collection(resource), {}, accessToken);
}

export async function getRecord(
  accessToken: string,
  resource: string,
  sectionId: string,
  recordId: string,
): Promise<OperationalRecord> {
  if (DEVELOPMENT_MOCK_AUTH) {
    const record = mockRecordDetails(sectionId, recordId);
    if (!record) throw new ApiError('This preview record could not be found.', 404);
    return record;
  }
  return apiRequest<OperationalRecord>(OPERATIONS_ENDPOINTS.record(resource, recordId), {}, accessToken);
}

export async function submitOperation(
  accessToken: string,
  resource: string,
  recordId: string | null,
  action: string,
  payload: Record<string, unknown>,
): Promise<void> {
  if (DEVELOPMENT_MOCK_AUTH) {
    throw new ApiError('Development mock mode: no data was submitted. Connect an authorized backend to perform this action.');
  }
  const path = OPERATIONS_ENDPOINTS.action(resource, recordId, action);
  await apiRequest<unknown>(path, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, accessToken);
}

export async function submitVisitCapture(
  accessToken: string,
  action: 'check-in' | 'check-out',
  capture: VisitCapture,
  relatedId: string,
): Promise<VisitStatus> {
  if (DEVELOPMENT_MOCK_AUTH) {
    throw new ApiError('Development mock mode: no visit was submitted. Connect an authorized backend to record this visit.');
  }
  const idField = action === 'check-in' ? 'merchantId' : 'visitId';
  return apiRequest<VisitStatus>(
    OPERATIONS_ENDPOINTS.visitAction(action),
    {
      method: 'POST',
      body: JSON.stringify({ [idField]: relatedId, ...capture }),
    },
    accessToken,
  );
}

export async function getVisitStatus(accessToken: string): Promise<VisitStatus> {
  if (DEVELOPMENT_MOCK_AUTH) {
    return {
      activeVisit: null,
      location: {
        reportedAt: new Date(Date.now() - 22 * 60_000).toISOString(),
        reportedAccuracyMeters: 38,
        isOffline: true,
        isStale: true,
      },
      updatedAt: new Date().toISOString(),
    };
  }
  return apiRequest<VisitStatus>(OPERATIONS_ENDPOINTS.visitStatus, {}, accessToken);
}

export async function getOrderOptions(accessToken: string): Promise<OrderOptions> {
  if (DEVELOPMENT_MOCK_AUTH) return mockOrderOptions();
  return apiRequest<OrderOptions>(OPERATIONS_ENDPOINTS.orderOptions, {}, accessToken);
}
