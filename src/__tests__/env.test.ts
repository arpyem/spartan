import { parseFirebaseEnv } from '@/lib/env';

describe('parseFirebaseEnv', () => {
  it('returns the normalized Firebase config when all keys are present', () => {
    expect(
      parseFirebaseEnv({
        VITE_FIREBASE_API_KEY: 'api-key',
        VITE_FIREBASE_AUTH_DOMAIN: 'project.firebaseapp.com',
        VITE_FIREBASE_PROJECT_ID: 'project-id',
        VITE_FIREBASE_STORAGE_BUCKET: 'project.appspot.com',
        VITE_FIREBASE_MESSAGING_SENDER_ID: 'sender-id',
        VITE_FIREBASE_APP_ID: 'app-id',
      }),
    ).toEqual({
      apiKey: 'api-key',
      authDomain: 'project.firebaseapp.com',
      projectId: 'project-id',
      storageBucket: 'project.appspot.com',
      messagingSenderId: 'sender-id',
      appId: 'app-id',
    });
  });

  it('throws a clear error when required keys are missing', () => {
    expect(() =>
      parseFirebaseEnv({
        VITE_FIREBASE_API_KEY: 'api-key',
        VITE_FIREBASE_AUTH_DOMAIN: '',
      }),
    ).toThrow(/Missing Firebase environment variables/i);
  });
});

