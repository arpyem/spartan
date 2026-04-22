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

export function getFirebaseServices(): FirebaseServices {
  if (cachedServices) {
    return cachedServices;
  }

  const firebaseEnv = getFirebaseEnv();
  const firebaseApp = initializeApp({
    apiKey: firebaseEnv.apiKey,
    authDomain: firebaseEnv.authDomain,
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
