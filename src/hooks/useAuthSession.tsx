import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';
import {
  getRedirectResult,
  onAuthStateChanged,
  signInWithRedirect,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { ensureUserDoc } from '@/lib/firestore';

type AuthSessionStatus = 'loading' | 'signed_out' | 'signed_in';
type BusyAction = 'sign_in' | 'sign_out' | null;

interface AuthSessionContextValue {
  status: AuthSessionStatus;
  user: User | null;
  error: string | null;
  busyAction: BusyAction;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
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
  const bootstrappedUsersRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let isActive = true;

    async function bootstrapUser(nextUser: User | null) {
      if (!nextUser || bootstrappedUsersRef.current.has(nextUser.uid)) {
        return;
      }

      bootstrappedUsersRef.current.add(nextUser.uid);

      try {
        await ensureUserDoc(nextUser);
      } catch (nextError) {
        if (isActive) {
          setError(normalizeError(nextError));
        }
      }
    }

    void getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          await bootstrapUser(result.user);
        }
      })
      .catch((nextError) => {
        if (isActive) {
          setError(normalizeError(nextError));
        }
      });

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      if (!isActive) {
        return;
      }

      setUser(nextUser);
      setStatus(nextUser ? 'signed_in' : 'signed_out');

      void bootstrapUser(nextUser);
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo<AuthSessionContextValue>(
    () => ({
      status,
      user,
      error,
      busyAction,
      async signInWithGoogle() {
        setError(null);
        setBusyAction('sign_in');

        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (nextError) {
          setError(normalizeError(nextError));
          setBusyAction(null);
        }
      },
      async signOutUser() {
        setError(null);
        setBusyAction('sign_out');

        try {
          await signOut(auth);
        } catch (nextError) {
          setError(normalizeError(nextError));
        } finally {
          setBusyAction(null);
        }
      },
      clearError() {
        setError(null);
      },
    }),
    [busyAction, error, status, user],
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
