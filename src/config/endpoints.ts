const encodePath = (value: string) => encodeURIComponent(value);

export const AUTH_ENDPOINTS = {
  login: '/auth/login',
  session: '/auth/session',
  logout: '/auth/logout',
  otpVerify: '/auth/otp/verify',
  passwordForgot: '/auth/password/forgot',
  passwordReset: '/auth/password/reset',
} as const;

export const OPERATIONS_ENDPOINTS = {
  dashboardOverview: '/v1/dashboard/overview',
  collection: (resource: string) => `/v1/operations/${encodePath(resource)}`,
  record: (resource: string, recordId: string) =>
    `/v1/operations/${encodePath(resource)}/${encodePath(recordId)}`,
  action: (resource: string, recordId: string | null, action: string) =>
    `/v1/operations/${encodePath(resource)}${recordId ? `/${encodePath(recordId)}` : ''}/${encodePath(action)}`,
  visitStatus: '/v1/operations/visits/status',
  orderOptions: '/v1/operations/merchant-orders/options',
  visitAction: (action: 'check-in' | 'check-out') => `/v1/operations/visits/${action}`,
} as const;
