import type { User } from 'firebase/auth';

type Listener = (user: User | null) => void;

const listeners = new Set<Listener>();

export const auth = {
  currentUser: null as User | null,
};

export const db = {
  __kind: 'firestore-mock',
};

export const googleProvider = {
  providerId: 'google.com',
};

export const firebaseApp = {
  name: 'spartan-gains-test',
};

let emitImmediately = true;

export function setInitialAuthState(user: User | null) {
  auth.currentUser = user;
}

export function setAuthBootstrapMode(mode: 'immediate' | 'deferred') {
  emitImmediately = mode === 'immediate';
}

export function emitAuthState(user: User | null) {
  auth.currentUser = user;
  for (const listener of listeners) {
    listener(user);
  }
}

export function onAuthStateChangedMock(_auth: unknown, listener: Listener) {
  listeners.add(listener);

  if (emitImmediately) {
    listener(auth.currentUser);
  }

  return () => {
    listeners.delete(listener);
  };
}

export function resetFirebaseMocks() {
  listeners.clear();
  auth.currentUser = null;
  emitImmediately = true;
}

