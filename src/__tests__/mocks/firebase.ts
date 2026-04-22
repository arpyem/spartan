import type { User } from 'firebase/auth';

type AuthListener = (user: User | null) => void;
type SnapshotListener = (snapshot: MockDocumentSnapshot) => void;
type SnapshotErrorListener = (error: Error) => void;

interface MockDocRef {
  __kind: 'doc';
  path: string;
  id: string;
}

interface MockCollectionRef {
  __kind: 'collection';
  path: string;
  id: string;
}

interface MockDb {
  __kind: 'firestore-mock';
}

interface IncrementValue {
  __kind: 'increment';
  amount: number;
}

interface MockDocumentSnapshot {
  exists: () => boolean;
  data: () => unknown;
  id: string;
  ref: MockDocRef;
}

interface MockBatchOperation {
  type: 'set' | 'update';
  ref: MockDocRef;
  data: Record<string, unknown>;
}

interface StoredDoc {
  exists: boolean;
  data: Record<string, unknown>;
}

const authListeners = new Set<AuthListener>();
const snapshotListeners = new Map<
  string,
  Set<{ next: SnapshotListener; error?: SnapshotErrorListener }>
>();
const docStore = new Map<string, StoredDoc>();
const committedBatches: MockBatchOperation[][] = [];
let emitAuthImmediately = true;
let autoIdCounter = 0;

export const auth = {
  currentUser: null as User | null,
};

export const db: MockDb = {
  __kind: 'firestore-mock',
};

export const googleProvider = {
  providerId: 'google.com',
};

export const firebaseApp = {
  name: 'spartan-gains-test',
};

function cloneData(data: Record<string, unknown>) {
  return structuredClone(data);
}

function getSegmentId(path: string) {
  const segments = path.split('/');
  return segments[segments.length - 1];
}

function createSnapshot(ref: MockDocRef): MockDocumentSnapshot {
  const stored = docStore.get(ref.path);

  return {
    exists: () => stored?.exists ?? false,
    data: () => cloneData(stored?.data ?? {}),
    id: ref.id,
    ref,
  };
}

function setStoredDoc(path: string, data: Record<string, unknown>, exists = true) {
  docStore.set(path, {
    exists,
    data: cloneData(data),
  });
}

function applyNestedFieldUpdate(
  target: Record<string, unknown>,
  fieldPath: string,
  value: unknown,
) {
  const segments = fieldPath.split('.');
  let cursor: Record<string, unknown> = target;

  for (const segment of segments.slice(0, -1)) {
    if (
      !Object.prototype.hasOwnProperty.call(cursor, segment) ||
      typeof cursor[segment] !== 'object' ||
      cursor[segment] === null
    ) {
      cursor[segment] = {};
    }

    cursor = cursor[segment] as Record<string, unknown>;
  }

  const finalSegment = segments[segments.length - 1];
  const currentValue = cursor[finalSegment];

  if (isIncrementValue(value)) {
    cursor[finalSegment] = (typeof currentValue === 'number' ? currentValue : 0) + value.amount;
    return;
  }

  cursor[finalSegment] = value;
}

export function setInitialAuthState(user: User | null) {
  auth.currentUser = user;
}

export function setAuthBootstrapMode(mode: 'immediate' | 'deferred') {
  emitAuthImmediately = mode === 'immediate';
}

export function emitAuthState(user: User | null) {
  auth.currentUser = user;
  for (const listener of authListeners) {
    listener(user);
  }
}

export function onAuthStateChangedMock(_auth: unknown, listener: AuthListener) {
  authListeners.add(listener);

  if (emitAuthImmediately) {
    listener(auth.currentUser);
  }

  return () => {
    authListeners.delete(listener);
  };
}

export function docMock(
  parent: MockDb | MockCollectionRef | MockDocRef,
  ...segments: string[]
): MockDocRef {
  if (parent.__kind === 'collection' && segments.length === 0) {
    autoIdCounter += 1;
    const id = `mock-doc-${autoIdCounter}`;
    return {
      __kind: 'doc',
      path: `${parent.path}/${id}`,
      id,
    };
  }

  const basePath = parent.__kind === 'firestore-mock' ? '' : parent.path;
  const path = [...(basePath ? [basePath] : []), ...segments].join('/');

  return {
    __kind: 'doc',
    path,
    id: getSegmentId(path),
  };
}

export function collectionMock(
  parent: MockDb | MockDocRef | MockCollectionRef,
  ...segments: string[]
): MockCollectionRef {
  const basePath = parent.__kind === 'firestore-mock' ? '' : parent.path;
  const path = [...(basePath ? [basePath] : []), ...segments].join('/');

  return {
    __kind: 'collection',
    path,
    id: getSegmentId(path),
  };
}

export async function getDocMock(ref: MockDocRef) {
  return createSnapshot(ref);
}

export async function setDocMock(ref: MockDocRef, data: Record<string, unknown>) {
  setStoredDoc(ref.path, data);
}

export async function updateDocMock(
  ref: MockDocRef,
  data: Record<string, unknown>,
) {
  const stored = docStore.get(ref.path);
  const nextData = cloneData(stored?.data ?? {});

  for (const [fieldPath, value] of Object.entries(data)) {
    applyNestedFieldUpdate(nextData, fieldPath, value);
  }

  setStoredDoc(ref.path, nextData);
}

export function incrementMock(amount: number) {
  return { __kind: 'increment' as const, amount };
}

export function serverTimestampMock() {
  return { __kind: 'serverTimestamp' as const };
}

export function writeBatchMock(_db: typeof db) {
  const operations: MockBatchOperation[] = [];

  return {
    set(ref: MockDocRef, data: Record<string, unknown>) {
      operations.push({ type: 'set', ref, data });
    },
    update(ref: MockDocRef, data: Record<string, unknown>) {
      operations.push({ type: 'update', ref, data });
    },
    async commit() {
      committedBatches.push(
        operations.map((operation) => ({
          ...operation,
          data: cloneData(operation.data),
        })),
      );

      for (const operation of operations) {
        if (operation.type === 'set') {
          setStoredDoc(operation.ref.path, operation.data);
          continue;
        }

        await updateDocMock(operation.ref, operation.data);
      }
    },
  };
}

function isIncrementValue(value: unknown): value is IncrementValue {
  return (
    typeof value === 'object' &&
    value !== null &&
    '__kind' in value &&
    value.__kind === 'increment' &&
    'amount' in value &&
    typeof value.amount === 'number'
  );
}

export function onSnapshotMock(
  ref: MockDocRef,
  next: SnapshotListener,
  error?: SnapshotErrorListener,
) {
  const listeners = snapshotListeners.get(ref.path) ?? new Set();
  const listener = { next, error };
  listeners.add(listener);
  snapshotListeners.set(ref.path, listeners);

  return () => {
    const currentListeners = snapshotListeners.get(ref.path);
    currentListeners?.delete(listener);

    if (currentListeners?.size === 0) {
      snapshotListeners.delete(ref.path);
    }
  };
}

export function seedDoc(path: string, data: Record<string, unknown>) {
  setStoredDoc(path, data);
}

export function emitDocSnapshot(path: string, data: Record<string, unknown>) {
  setStoredDoc(path, data);
  const ref = {
    __kind: 'doc' as const,
    path,
    id: getSegmentId(path),
  };

  for (const listener of snapshotListeners.get(path) ?? []) {
    listener.next(createSnapshot(ref));
  }
}

export function emitSnapshotError(path: string, error: Error) {
  for (const listener of snapshotListeners.get(path) ?? []) {
    listener.error?.(error);
  }
}

export function getStoredDoc(path: string) {
  const stored = docStore.get(path);

  if (!stored) {
    return null;
  }

  return {
    exists: stored.exists,
    data: cloneData(stored.data),
  };
}

export function getCommittedBatches() {
  return committedBatches.map((batch) =>
    batch.map((operation) => ({
      ...operation,
      data: cloneData(operation.data),
    })),
  );
}

export function getSnapshotListenerCount(path: string) {
  return snapshotListeners.get(path)?.size ?? 0;
}

export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    uid: 'spartan-117',
    displayName: 'Master Chief',
    email: 'chief@example.com',
    photoURL: 'https://example.com/chief.png',
    emailVerified: true,
    isAnonymous: false,
    metadata: {} as User['metadata'],
    providerData: [],
    providerId: 'firebase',
    refreshToken: 'refresh-token',
    tenantId: null,
    delete: vi.fn(),
    getIdToken: vi.fn(),
    getIdTokenResult: vi.fn(),
    reload: vi.fn(),
    toJSON: vi.fn(),
    ...overrides,
  } as User;
}

export function resetFirebaseMocks() {
  authListeners.clear();
  snapshotListeners.clear();
  docStore.clear();
  committedBatches.length = 0;
  auth.currentUser = null;
  emitAuthImmediately = true;
  autoIdCounter = 0;
}
