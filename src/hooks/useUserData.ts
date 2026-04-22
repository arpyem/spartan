import { useEffect, useState } from 'react';
import {
  devLog,
  sanitizeErrorForDevLog,
  summarizeTrackProgressForDevLog,
} from '@/lib/dev-logging';
import { getAppRuntime } from '@/lib/runtime';
import type { UserDoc } from '@/lib/types';

export type UserDataStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface UseUserDataResult {
  status: UserDataStatus;
  userDoc: UserDoc | null;
  error: Error | null;
}

export function useUserData(uid?: string | null): UseUserDataResult {
  const appRuntime = getAppRuntime();
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

    devLog.info('snapshot', 'user_doc_subscribed', {
      uidSuffix: uid.slice(-6),
    });
    const unsubscribe = appRuntime.subscribeUserDoc(
      uid,
      (snapshot) => {
        const nextUserDoc = snapshot as UserDoc | null;
        devLog.debug('snapshot', 'user_doc_snapshot_received', {
          uidSuffix: uid.slice(-6),
          exists: Boolean(nextUserDoc),
          tracks: nextUserDoc
            ? Object.fromEntries(
                Object.entries(nextUserDoc.tracks).map(([trackKey, progress]) => [
                  trackKey,
                  summarizeTrackProgressForDevLog(progress),
                ]),
              )
            : null,
        });
        setState({
          status: 'ready',
          userDoc: nextUserDoc,
          error: null,
        });
      },
      (error) => {
        devLog.error('snapshot', 'user_doc_snapshot_failed', {
          uidSuffix: uid.slice(-6),
          error: sanitizeErrorForDevLog(error),
        });
        setState((currentState) => ({
          status: currentState.userDoc ? 'ready' : 'error',
          userDoc: currentState.userDoc,
          error,
        }));
      },
    );

    return () => {
      devLog.debug('snapshot', 'user_doc_unsubscribed', {
        uidSuffix: uid.slice(-6),
      });
      unsubscribe();
    };
  }, [appRuntime, uid]);

  return state;
}
