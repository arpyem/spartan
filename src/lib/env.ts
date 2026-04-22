const REQUIRED_FIREBASE_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

type FirebaseEnvKey = (typeof REQUIRED_FIREBASE_KEYS)[number];
type FirebaseEnvSource = Partial<Record<FirebaseEnvKey, string | undefined>>;

export interface FirebaseEnv {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

let cachedFirebaseEnv: FirebaseEnv | null = null;

export function parseFirebaseEnv(source: FirebaseEnvSource): FirebaseEnv {
  const missingKeys = REQUIRED_FIREBASE_KEYS.filter((key) => {
    const value = source[key];
    return value === undefined || value.trim() === '';
  });

  if (missingKeys.length > 0) {
    throw new Error(
      `Missing Firebase environment variables: ${missingKeys.join(', ')}`,
    );
  }

  return {
    apiKey: source.VITE_FIREBASE_API_KEY!,
    authDomain: source.VITE_FIREBASE_AUTH_DOMAIN!,
    projectId: source.VITE_FIREBASE_PROJECT_ID!,
    storageBucket: source.VITE_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: source.VITE_FIREBASE_MESSAGING_SENDER_ID!,
    appId: source.VITE_FIREBASE_APP_ID!,
  };
}

export function getFirebaseEnv(): FirebaseEnv {
  if (!cachedFirebaseEnv) {
    cachedFirebaseEnv = parseFirebaseEnv(import.meta.env);
  }

  return cachedFirebaseEnv;
}

