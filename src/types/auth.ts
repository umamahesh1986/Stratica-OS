export const USER_ROLES = [
  'STRATICS_ADMIN',
  'PRODUCT_COMPANY_ADMIN',
  'DISTRIBUTOR_ADMIN',
  'FIELD_REPRESENTATIVE',
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type Organization = {
  id: string;
  name: string;
  type: 'STRATICS' | 'PRODUCT_COMPANY' | 'DISTRIBUTOR';
};

export type AuthenticatedUser = {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  permissions: string[];
  organization: Organization;
};

export type AuthenticatedSession = {
  accessToken: string;
  user: AuthenticatedUser;
};

export type LoginResponse =
  | { requiresOtp: true; challengeId: string }
  | { requiresOtp: false; session: AuthenticatedSession };

export type LoginCredentials = {
  email: string;
  password: string;
};

export type OtpCredentials = {
  challengeId: string;
  code: string;
};

export function isUserRole(value: unknown): value is UserRole {
  return USER_ROLES.some((role) => role === value);
}

export function isAuthenticatedSession(value: unknown): value is AuthenticatedSession {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<AuthenticatedSession>;
  const user = candidate.user;
  if (typeof user !== 'object' || user === null) return false;
  const organization = user.organization;
  if (typeof organization !== 'object' || organization === null) return false;
  const organizationType = organization.type;
  const organizationMatchesRole =
    user.role === 'STRATICS_ADMIN'
      ? organizationType === 'STRATICS'
      : user.role === 'PRODUCT_COMPANY_ADMIN'
        ? organizationType === 'PRODUCT_COMPANY'
        : organizationType === 'DISTRIBUTOR';
  return (
    typeof candidate.accessToken === 'string' &&
    isUserRole(user.role) &&
    typeof user.id === 'string' &&
    typeof user.displayName === 'string' &&
    typeof user.email === 'string' &&
    Array.isArray(user.permissions) &&
    user.permissions.every((permission) => typeof permission === 'string') &&
    typeof organization.id === 'string' &&
    typeof organization.name === 'string' &&
    organizationMatchesRole
  );
}
