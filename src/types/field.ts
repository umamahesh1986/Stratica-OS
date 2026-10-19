import type { LocationSnapshot } from '@/types/operations';

export type ActiveVisit = {
  id: string;
  merchantId: string;
  merchantName: string;
  checkedInAt: string;
};

export type VisitStatus = {
  activeVisit: ActiveVisit | null;
  location: LocationSnapshot | null;
  updatedAt: string;
};
