import type { FirebaseApp } from 'firebase/app';
import { initializeApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  getAuth,
  setPersistence,
} from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { devLog, sanitizeErrorForDevLog } from '@/lib/dev-logging';
import { getFirebaseEnv } from '@/lib/env';

export interface FirebaseServices {
  firebaseApp: FirebaseApp;
  auth: Auth;
  db: Firestore;
  googleProvider: GoogleAuthProvider;
}

let cachedServices: FirebaseServices | null = null;

export function resolveFirebaseAuthDomain(defaultAuthDomain: string): string {
  if (typeof window === 'undefined') {
    return defaultAuthDomain;
  }

  const currentHost = window.location.host.trim();

  if (!currentHost) {
    return defaultAuthDomain;
  }

  const normalizedDefault = defaultAuthDomain.trim().toLowerCase();
  const normalizedHost = currentHost.toLowerCase();
  const isLocalHost = normalizedHost === 'localhost'
    || normalizedHost.startsWith('localhost:')
    || normalizedHost === '127.0.0.1'
    || normalizedHost.startsWith('127.0.0.1:');

  if (isLocalHost || normalizedHost === normalizedDefault) {
    return defaultAuthDomain;
  }

  // Redirect auth should use the active Hosting origin on production domains so
  // the auth helper and app stay same-origin on browsers with storage partitioning.
  return currentHost;
}

export function getFirebaseServices(): FirebaseServices {
  if (cachedServices) {
    return cachedServices;
  }

  const firebaseEnv = getFirebaseEnv();
  const firebaseApp = initializeApp({
    apiKey: firebaseEnv.apiKey,
    authDomain: resolveFirebaseAuthDomain(firebaseEnv.authDomain),
    projectId: firebaseEnv.projectId,
    storageBucket: firebaseEnv.storageBucket,
    messagingSenderId: firebaseEnv.messagingSenderId,
    appId: firebaseEnv.appId,
  });
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const googleProvider = new GoogleAuthProvider();

  void setPersistence(auth, browserLocalPersistence).catch((error) => {
    if (import.meta.env.DEV) {
      devLog.warn('auth', 'auth_persistence_config_failed', {
        error: sanitizeErrorForDevLog(error),
      });
    }
  });

  cachedServices = {
    firebaseApp,
    auth,
    db,
    googleProvider,
  };

  return cachedServices;
}
