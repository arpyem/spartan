import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';
import {
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth';
import {
  devLog,
  sanitizeErrorForDevLog,
  summarizeAuthUserForDevLog,
} from '@/lib/dev-logging';
import { auth, googleProvider } from '@/lib/firebase';
import { ensureUserDoc } from '@/lib/firestore';

type AuthSessionStatus = 'loading' | 'signed_out' | 'signed_in';
type BusyAction = 'sign_in' | 'sign_out' | null;
export type BootstrapStatus = 'idle' | 'running' | 'ready' | 'error';

interface AuthSessionContextValue {
  status: AuthSessionStatus;
  user: User | null;
  error: string | null;
  busyAction: BusyAction;
  bootstrapStatus: BootstrapStatus;
  bootstrapError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  retryBootstrap: () => Promise<void>;
  clearError: () => void;
}

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

function normalizeError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unable to complete the auth request right now.';
}

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthSessionStatus>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<BusyAction>(null);
  const [bootstrapStatus, setBootstrapStatus] = useState<BootstrapStatus>('idle');
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const bootstrappedUidRef = useRef<string | null>(null);
  const bootstrapUidRef = useRef<string | null>(null);
  const bootstrapPromiseRef = useRef<Promise<void> | null>(null);

  const resetBootstrapState = useCallback(() => {
    bootstrappedUidRef.current = null;
    bootstrapUidRef.current = null;
    bootstrapPromiseRef.current = null;
    setBootstrapStatus('idle');
    setBootstrapError(null);
  }, []);

  const bootstrapUser = useCallback(
    async (nextUser: User, options?: { force?: boolean }) => {
      const force = options?.force ?? false;

      if (!force && bootstrappedUidRef.current === nextUser.uid) {
        devLog.info('auth', 'bootstrap_skipped', {
          force,
          reason: 'already_bootstrapped',
          user: summarizeAuthUserForDevLog(nextUser),
        });
        if (mountedRef.current) {
          setBootstrapStatus('ready');
          setBootstrapError(null);
        }
        return;
      }

      if (!force && bootstrapUidRef.current === nextUser.uid && bootstrapPromiseRef.current) {
        devLog.debug('auth', 'bootstrap_skipped', {
          force,
          reason: 'bootstrap_in_flight',
          user: summarizeAuthUserForDevLog(nextUser),
        });
        return bootstrapPromiseRef.current;
      }

      devLog.info('auth', 'bootstrap_started', {
        force,
        user: summarizeAuthUserForDevLog(nextUser),
      });

      if (mountedRef.current) {
        setBootstrapStatus('running');
        setBootstrapError(null);
      }

      const promise = ensureUserDoc(nextUser)
        .then(() => {
          if (!mountedRef.current || auth.currentUser?.uid !== nextUser.uid) {
            return;
          }

          bootstrappedUidRef.current = nextUser.uid;
          devLog.info('auth', 'bootstrap_succeeded', {
            force,
            user: summarizeAuthUserForDevLog(nextUser),
          });
          setBootstrapStatus('ready');
          setBootstrapError(null);
        })
        .catch((nextError) => {
          if (!mountedRef.current || auth.currentUser?.uid !== nextUser.uid) {
            return;
          }

          if (bootstrappedUidRef.current === nextUser.uid) {
            bootstrappedUidRef.current = null;
          }

          devLog.error('auth', 'bootstrap_failed', {
            force,
            user: summarizeAuthUserForDevLog(nextUser),
            error: sanitizeErrorForDevLog(nextError),
          });
          setBootstrapStatus('error');
          setBootstrapError(normalizeError(nextError));
        })
        .finally(() => {
          if (bootstrapUidRef.current === nextUser.uid) {
            bootstrapUidRef.current = null;
            bootstrapPromiseRef.current = null;
          }
        });

      bootstrapUidRef.current = nextUser.uid;
      bootstrapPromiseRef.current = promise;

      return promise;
    },
    [],
  );

  useEffect(() => {
    mountedRef.current = true;
    devLog.info('auth', 'redirect_result_started');

    void getRedirectResult(auth)
      .then(async (result) => {
        devLog.info('auth', 'redirect_result_succeeded', {
          hasUser: Boolean(result?.user),
          user: summarizeAuthUserForDevLog(result?.user ?? null),
        });
        if (result?.user && mountedRef.current) {
          await bootstrapUser(result.user);
        }
      })
      .catch((nextError) => {
        devLog.error('auth', 'redirect_result_failed', {
          error: sanitizeErrorForDevLog(nextError),
        });
        if (mountedRef.current) {
          setError(normalizeError(nextError));
        }
      });

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      if (!mountedRef.current) {
        return;
      }

      devLog.info('auth', 'auth_state_changed', {
        status: nextUser ? 'signed_in' : 'signed_out',
        user: summarizeAuthUserForDevLog(nextUser),
      });
      setUser(nextUser);
      setStatus(nextUser ? 'signed_in' : 'signed_out');

      if (!nextUser) {
        resetBootstrapState();
        return;
      }

      if (bootstrappedUidRef.current === nextUser.uid) {
        setBootstrapStatus('ready');
        setBootstrapError(null);
        return;
      }

      void bootstrapUser(nextUser);
    });

    return () => {
      devLog.debug('auth', 'auth_listener_unsubscribed');
      mountedRef.current = false;
      unsubscribe();
    };
  }, [bootstrapUser, resetBootstrapState]);

  const value = useMemo<AuthSessionContextValue>(
    () => ({
      status,
      user,
      error,
      busyAction,
      bootstrapStatus,
      bootstrapError,
      async signInWithGoogle() {
        setError(null);
        setBusyAction('sign_in');
        devLog.info('auth', 'sign_in_requested');

        try {
          if (import.meta.env.DEV) {
            const result = await signInWithPopup(auth, googleProvider);
            devLog.info('auth', 'sign_in_popup_succeeded', {
              user: summarizeAuthUserForDevLog(result.user),
            });
            await bootstrapUser(result.user);
          } else {
            await signInWithRedirect(auth, googleProvider);
          }
        } catch (nextError) {
          devLog.error('auth', 'sign_in_failed', {
            error: sanitizeErrorForDevLog(nextError),
          });
          setError(normalizeError(nextError));
          setBusyAction(null);
        }
      },
      async signOutUser() {
        setError(null);
        setBusyAction('sign_out');
        devLog.info('auth', 'sign_out_requested', {
          user: summarizeAuthUserForDevLog(user),
        });

        try {
          await signOut(auth);
          devLog.info('auth', 'sign_out_succeeded', {
            user: summarizeAuthUserForDevLog(user),
          });
        } catch (nextError) {
          devLog.error('auth', 'sign_out_failed', {
            user: summarizeAuthUserForDevLog(user),
            error: sanitizeErrorForDevLog(nextError),
          });
          setError(normalizeError(nextError));
        } finally {
          setBusyAction(null);
        }
      },
      async retryBootstrap() {
        if (!user) {
          return;
        }

        devLog.info('auth', 'bootstrap_retry_requested', {
          user: summarizeAuthUserForDevLog(user),
        });
        await bootstrapUser(user, { force: true });
      },
      clearError() {
        setError(null);
      },
    }),
    [bootstrapError, bootstrapStatus, bootstrapUser, busyAction, error, status, user],
  );

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession() {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error('useAuthSession must be used within an AuthSessionProvider.');
  }

  return context;
}
