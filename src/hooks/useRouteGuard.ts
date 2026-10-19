import { useEffect } from 'react';
import { router, useSegments } from 'expo-router';

import { useAuth } from '@/context/AuthContext';

const publicRoutes = new Set(['login', 'forgot-password', 'reset-password', 'verify-otp', 'access-denied', 'register']);

export function useRouteGuard() {
  const { session, isRestoring, pendingChallengeId } = useAuth();
  const segments = useSegments();
  const route = segments[0] ?? '';

  useEffect(() => {
    if (isRestoring) return;
    if (publicRoutes.has(route)) {
      if (session && route !== 'access-denied') router.replace('/dashboard');
      if (pendingChallengeId && route !== 'verify-otp') router.replace('/verify-otp');
      return;
    }
    if (!session) {
      router.replace('/login');
    }
  }, [isRestoring, route, session, pendingChallengeId]);

  return isRestoring;
}
