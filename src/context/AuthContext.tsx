import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import {
  clearStoredSession,
  restoreSession,
  signIn as authenticate,
  signOut as endSession,
  verifyOtp as authenticateOtp,
} from '@/services/auth';
import type {
  AuthenticatedSession,
  LoginCredentials,
  OtpCredentials,
} from '@/types/auth';

type AuthContextValue = {
  session: AuthenticatedSession | null;
  pendingChallengeId: string | null;
  isRestoring: boolean;
  restoreError: string | null;
  signIn: (credentials: LoginCredentials) => Promise<'authenticated' | 'otp-required'>;
  verifyOtp: (code: string) => Promise<void>;
  cancelOtp: () => void;
  signOut: () => Promise<void>;
  recoverInvalidSession: () => Promise<void>;
  retryRestore: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthenticatedSession | null>(null);
  const [pendingChallengeId, setPendingChallengeId] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    restoreSession()
      .then((restored) => {
        if (mounted) {
          setSession(restored);
          setRestoreError(null);
        }
      })
      .catch((error: unknown) => {
        if (mounted) setRestoreError(error instanceof Error ? error.message : 'Session restoration failed.');
      })
      .finally(() => {
        if (mounted) setIsRestoring(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const retryRestore = useCallback(async () => {
    setIsRestoring(true);
    try {
      setSession(await restoreSession());
      setRestoreError(null);
    } catch (error) {
      setRestoreError(error instanceof Error ? error.message : 'Session restoration failed.');
    } finally {
      setIsRestoring(false);
    }
  }, []);

  const signIn = useCallback(async (credentials: LoginCredentials) => {
    const result = await authenticate(credentials);
    if (result.requiresOtp) {
      setPendingChallengeId(result.challengeId);
      return 'otp-required' as const;
    }
    setSession(result.session);
    setPendingChallengeId(null);
    return 'authenticated' as const;
  }, []);

  const verifyOtp = useCallback(async (code: string) => {
    if (!pendingChallengeId) throw new Error('There is no active verification challenge.');
    const credentials: OtpCredentials = { challengeId: pendingChallengeId, code };
    const authenticated = await authenticateOtp(credentials);
    setSession(authenticated);
    setPendingChallengeId(null);
  }, [pendingChallengeId]);

  const cancelOtp = useCallback(() => setPendingChallengeId(null), []);

  const signOut = useCallback(async () => {
    const current = session;
    setSession(null);
    setPendingChallengeId(null);
    await endSession(current?.accessToken);
  }, [session]);

  const recoverInvalidSession = useCallback(async () => {
    await clearStoredSession();
    setSession(null);
    setPendingChallengeId(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      pendingChallengeId,
      isRestoring,
      restoreError,
      signIn,
      verifyOtp,
      cancelOtp,
      signOut,
      recoverInvalidSession,
      retryRestore,
    }),
    [session, pendingChallengeId, isRestoring, restoreError, signIn, verifyOtp, cancelOtp, signOut, recoverInvalidSession, retryRestore],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
