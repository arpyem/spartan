import { initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  getAuth,
  setPersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { devLog, sanitizeErrorForDevLog } from '@/lib/dev-logging';
import { getFirebaseEnv } from '@/lib/env';

const firebaseEnv = getFirebaseEnv();

export const firebaseApp = initializeApp({
  apiKey: firebaseEnv.apiKey,
  authDomain: firebaseEnv.authDomain,
  projectId: firebaseEnv.projectId,
  storageBucket: firebaseEnv.storageBucket,
  messagingSenderId: firebaseEnv.messagingSenderId,
  appId: firebaseEnv.appId,
});

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const googleProvider = new GoogleAuthProvider();

void setPersistence(auth, browserLocalPersistence).catch((error) => {
  if (import.meta.env.DEV) {
    devLog.warn('auth', 'auth_persistence_config_failed', {
      error: sanitizeErrorForDevLog(error),
    });
  }
});
