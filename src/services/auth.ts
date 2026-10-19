import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import {
  isAuthenticatedSession,
  type AuthenticatedSession,
  type LoginCredentials,
  type LoginResponse,
  type OtpCredentials,
  type UserRole,
} from '@/types/auth';
import { apiRequest, ApiError } from '@/services/api';
import { mockPermissionsForRole } from '@/services/mockData';
import { AUTH_ENDPOINTS } from '@/config/endpoints';

const ACCESS_TOKEN_KEY = 'stratics.access-token';
let webAccessToken: string | null = null;
export const DEVELOPMENT_MOCK_AUTH =
  __DEV__ && process.env.EXPO_PUBLIC_DEVELOPMENT_MOCK_AUTH === 'true';

const mockRoleByEmail: Readonly<Record<string, UserRole>> = {
  'admin@demo.stratica': 'STRATICS_ADMIN',
  'company@demo.stratica': 'PRODUCT_COMPANY_ADMIN',
  'distributor@demo.stratica': 'DISTRIBUTOR_ADMIN',
  'rep@demo.stratica': 'FIELD_REPRESENTATIVE',
};

function createMockSession(email: string, role: UserRole): AuthenticatedSession {
  const names: Record<UserRole, string> = {
    STRATICS_ADMIN: 'Alex Morgan',
    PRODUCT_COMPANY_ADMIN: 'Jordan Lee',
    DISTRIBUTOR_ADMIN: 'Taylor Brooks',
    FIELD_REPRESENTATIVE: 'Casey Rivera',
  };
  const organizationTypes: Record<UserRole, AuthenticatedSession['user']['organization']['type']> = {
    STRATICS_ADMIN: 'STRATICS',
    PRODUCT_COMPANY_ADMIN: 'PRODUCT_COMPANY',
    DISTRIBUTOR_ADMIN: 'DISTRIBUTOR',
    FIELD_REPRESENTATIVE: 'DISTRIBUTOR',
  };
  const organizationNames: Record<UserRole, string> = {
    STRATICS_ADMIN: 'Stratica Operations',
    PRODUCT_COMPANY_ADMIN: 'Demo Product Company',
    DISTRIBUTOR_ADMIN: 'Demo Distribution Network',
    FIELD_REPRESENTATIVE: 'Demo Distribution Network',
  };
  const organizationType = organizationTypes[role];
  const roleSlug = role.toLowerCase().replaceAll('_', '-');

  return {
    accessToken: `development-only-${roleSlug}`,
    user: {
      id: `mock-user-${roleSlug}`,
      displayName: names[role],
      email,
      role,
      permissions: mockPermissionsForRole(role),
      organization: {
        id: `mock-organization-${roleSlug}`,
        name: organizationNames[role],
        type: organizationType,
      },
    },
  };
}

async function persistAccessToken(accessToken: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (DEVELOPMENT_MOCK_AUTH && typeof window !== 'undefined') {
      window.sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      return;
    }
    webAccessToken = accessToken;
    return;
  }
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
}

async function readAccessToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    if (DEVELOPMENT_MOCK_AUTH && typeof window !== 'undefined') {
      return window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
    }
    return webAccessToken;
  }
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function signIn(credentials: LoginCredentials): Promise<LoginResponse> {
  if (DEVELOPMENT_MOCK_AUTH) {
    const email = credentials.email.trim().toLowerCase();
    const role = mockRoleByEmail[email];
    if (!role || credentials.password.length < 4) {
      throw new ApiError(
        'Use a listed development demo email and a password with at least 4 characters.',
      );
    }
    const session = createMockSession(email, role);
    await persistAccessToken(session.accessToken);
    return { requiresOtp: false, session };
  }

  const result = await apiRequest<LoginResponse>(AUTH_ENDPOINTS.login, {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  if (!result || typeof result !== 'object' || !('requiresOtp' in result)) {
    throw new ApiError('The service returned an invalid login response.');
  }
  if (!result.requiresOtp) {
    if (!isAuthenticatedSession(result.session)) {
      throw new ApiError('The service returned an invalid authenticated session.');
    }
    await persistAccessToken(result.session.accessToken);
  } else if (typeof result.challengeId !== 'string' || !result.challengeId) {
    throw new ApiError('The service returned an invalid OTP challenge.');
  }
  return result;
}

export async function verifyOtp(credentials: OtpCredentials): Promise<AuthenticatedSession> {
  const session = await apiRequest<AuthenticatedSession>(AUTH_ENDPOINTS.otpVerify, {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  if (!isAuthenticatedSession(session)) {
    throw new ApiError('The service returned an invalid authenticated session.');
  }
  await persistAccessToken(session.accessToken);
  return session;
}

export async function restoreSession(): Promise<AuthenticatedSession | null> {
  const accessToken = await readAccessToken();
  if (!accessToken) return null;

  if (DEVELOPMENT_MOCK_AUTH && accessToken.startsWith('development-only-')) {
    const role = (Object.values(mockRoleByEmail) as UserRole[]).find(
      (candidate) => accessToken === `development-only-${candidate.toLowerCase().replaceAll('_', '-')}`,
    );
    const email = Object.entries(mockRoleByEmail).find(([, candidate]) => candidate === role)?.[0];
    if (!role || !email) {
      await clearStoredSession();
      throw new ApiError('Saved development session is invalid. Please sign in again.');
    }
    return createMockSession(email, role);
  }

  const session = await apiRequest<AuthenticatedSession>(AUTH_ENDPOINTS.session, {}, accessToken);
  if (!isAuthenticatedSession(session)) {
    throw new ApiError('The service returned an invalid restored session.');
  }
  return session;
}

export async function requestPasswordReset(email: string): Promise<void> {
  if (DEVELOPMENT_MOCK_AUTH) {
    throw new ApiError('Password reset is not simulated in development mock mode.');
  }
  await apiRequest(AUTH_ENDPOINTS.passwordForgot, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, password: string): Promise<void> {
  if (DEVELOPMENT_MOCK_AUTH) {
    throw new ApiError('Password reset is not simulated in development mock mode.');
  }
  await apiRequest(AUTH_ENDPOINTS.passwordReset, {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}

export async function clearStoredSession(): Promise<void> {
  if (Platform.OS === 'web') {
    webAccessToken = null;
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    }
    return;
  }
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
}

export async function signOut(accessToken?: string): Promise<void> {
  await clearStoredSession();
  if (DEVELOPMENT_MOCK_AUTH) return;
  if (accessToken) {
    await apiRequest(AUTH_ENDPOINTS.logout, { method: 'POST' }, accessToken);
  }
}
