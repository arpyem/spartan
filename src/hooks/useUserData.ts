import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserDoc } from '@/lib/types';

export type UserDataStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface UseUserDataResult {
  status: UserDataStatus;
  userDoc: UserDoc | null;
  error: Error | null;
}

export function useUserData(uid?: string | null): UseUserDataResult {
  const [state, setState] = useState<UseUserDataResult>({
    status: uid ? 'loading' : 'idle',
    userDoc: null,
    error: null,
  });

  useEffect(() => {
    if (!uid) {
      setState({
        status: 'idle',
        userDoc: null,
        error: null,
      });
      return;
    }

    setState({
      status: 'loading',
      userDoc: null,
      error: null,
    });

    const userRef = doc(db, 'users', uid);
    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        setState({
          status: 'ready',
          userDoc: snapshot.exists() ? (snapshot.data() as UserDoc) : null,
          error: null,
        });
      },
      (error) => {
        setState((currentState) => ({
          status: currentState.userDoc ? 'ready' : 'error',
          userDoc: currentState.userDoc,
          error,
        }));
      },
    );

    return unsubscribe;
  }, [uid]);

  return state;
}
