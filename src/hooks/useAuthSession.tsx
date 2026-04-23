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
import {
  devLog,
  sanitizeErrorForDevLog,
  summarizeAuthUserForDevLog,
} from '@/lib/dev-logging';
import { getAppRuntime } from '@/lib/runtime';
import type { AppUser } from '@/lib/types';

type AuthSessionStatus = 'loading' | 'signed_out' | 'signed_in';
type BusyAction = 'sign_in' | 'sign_out' | null;
export type BootstrapStatus = 'idle' | 'running' | 'ready' | 'error';
const AUTH_INIT_TIMEOUT_MS = 6000;

interface AuthSessionContextValue {
  status: AuthSessionStatus;
  user: AppUser | null;
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
  const appRuntime = getAppRuntime();
  const [status, setStatus] = useState<AuthSessionStatus>('loading');
  const [user, setUser] = useState<AppUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<BusyAction>(null);
  const [bootstrapStatus, setBootstrapStatus] = useState<BootstrapStatus>('idle');
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const authUserRef = useRef<AppUser | null>(null);
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
    async (nextUser: AppUser, options?: { force?: boolean }) => {
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

      const promise = appRuntime.ensureUserDoc(nextUser)
        .then(() => {
          if (!mountedRef.current || authUserRef.current?.uid !== nextUser.uid) {
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
          if (!mountedRef.current || authUserRef.current?.uid !== nextUser.uid) {
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
    [appRuntime],
  );

  useEffect(() => {
    mountedRef.current = true;
    devLog.info('auth', 'redirect_result_started');

    const authInitTimeout = window.setTimeout(() => {
      if (!mountedRef.current || authUserRef.current) {
        return;
      }

      const currentUser = appRuntime.getCurrentUser();

      if (currentUser) {
        devLog.warn('auth', 'auth_state_change_delayed_recovered', {
          user: summarizeAuthUserForDevLog(currentUser),
        });
        authUserRef.current = currentUser;
        setUser(currentUser);
        setStatus('signed_in');
        void bootstrapUser(currentUser);
        return;
      }

      devLog.warn('auth', 'auth_init_timed_out');
      setStatus('signed_out');
      setError('Firebase auth took too long to initialize. Retry sign-in. If this keeps happening on your phone, clear site data and try again.');
    }, AUTH_INIT_TIMEOUT_MS);

    void appRuntime.getRedirectResult()
      .then(async (result) => {
        devLog.info('auth', 'redirect_result_succeeded', {
          hasUser: Boolean(result),
          user: summarizeAuthUserForDevLog(result),
        });
        if (result && mountedRef.current) {
          authUserRef.current = result;
          setUser(result);
          setStatus('signed_in');
          await bootstrapUser(result);
          return;
        }

        if (!result && mountedRef.current && !authUserRef.current) {
          const currentUser = appRuntime.getCurrentUser();

          if (currentUser) {
            devLog.warn('auth', 'redirect_result_missing_current_user_recovered', {
              user: summarizeAuthUserForDevLog(currentUser),
            });
            authUserRef.current = currentUser;
            setUser(currentUser);
            setStatus('signed_in');
            await bootstrapUser(currentUser);
          }
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

    const unsubscribe = appRuntime.onAuthStateChanged((nextUser) => {
      if (!mountedRef.current) {
        return;
      }

      devLog.info('auth', 'auth_state_changed', {
        status: nextUser ? 'signed_in' : 'signed_out',
        user: summarizeAuthUserForDevLog(nextUser),
      });
      authUserRef.current = nextUser;
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
      window.clearTimeout(authInitTimeout);
      unsubscribe();
    };
  }, [appRuntime, bootstrapUser, resetBootstrapState]);

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
          const result = await appRuntime.signInWithGoogle();
          if (result) {
            devLog.info('auth', 'sign_in_popup_succeeded', {
              user: summarizeAuthUserForDevLog(result),
            });
            await bootstrapUser(result);
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
          await appRuntime.signOut();
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
    [appRuntime, bootstrapError, bootstrapStatus, bootstrapUser, busyAction, error, status, user],
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
