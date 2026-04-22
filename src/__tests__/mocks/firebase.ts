import type { User } from 'firebase/auth';

type AuthListener = (user: User | null) => void;
type SnapshotNextListener = (snapshot: unknown) => void;
type SnapshotErrorListener = (error: Error) => void;
type SnapshotListener = {
  next: SnapshotNextListener;
  error?: SnapshotErrorListener;
};

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

interface MockQueryDocumentSnapshot {
  id: string;
  ref: MockDocRef;
  data: () => unknown;
}

interface MockQuerySnapshot {
  docs: MockQueryDocumentSnapshot[];
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

interface RedirectResult {
  user: User;
}

interface PopupResult {
  user: User;
}

type SeedCollectionDoc = Record<string, unknown> & { __id?: string };

const authListeners = new Set<AuthListener>();
const snapshotListeners = new Map<string, Set<SnapshotListener>>();
const docStore = new Map<string, StoredDoc>();
const committedBatches: MockBatchOperation[][] = [];
let emitAuthImmediately = true;
let autoIdCounter = 0;
let pendingRedirectResult: RedirectResult | null = null;
let pendingPopupResult: PopupResult | null = null;
let redirectResultError: Error | null = null;
let signInError: Error | null = null;
let signOutError: Error | null = null;
let batchCommitError: Error | null = null;
let setDocError: Error | null = null;
const authActionCalls = {
  getRedirectResult: 0,
  signInWithPopup: 0,
  signInWithRedirect: 0,
  signOut: 0,
};

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

function cloneData<T>(data: T): T {
  return structuredClone(data);
}

function getSegmentId(path: string) {
  const segments = path.split('/');
  return segments[segments.length - 1];
}

function getParentCollectionPath(path: string) {
  const segments = path.split('/');

  if (segments.length <= 1) {
    return null;
  }

  return segments.slice(0, -1).join('/');
}

function isDocumentPath(path: string) {
  return path.split('/').length % 2 === 0;
}

function isDirectChildOfCollection(docPath: string, collectionPath: string) {
  return (
    docPath.startsWith(`${collectionPath}/`) &&
    docPath.split('/').length === collectionPath.split('/').length + 1
  );
}

function createDocRef(path: string): MockDocRef {
  return {
    __kind: 'doc',
    path,
    id: getSegmentId(path),
  };
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

function createCollectionSnapshot(collectionPath: string): MockQuerySnapshot {
  const docs = [...docStore.entries()]
    .filter(([path, stored]) => stored.exists && isDirectChildOfCollection(path, collectionPath))
    .sort(([leftPath], [rightPath]) => leftPath.localeCompare(rightPath))
    .map(([path, stored]) => ({
      id: getSegmentId(path),
      ref: createDocRef(path),
      data: () => cloneData(stored.data),
    }));

  return { docs };
}

function emitPathSnapshot(path: string) {
  const listeners = snapshotListeners.get(path);

  if (!listeners) {
    return;
  }

  const snapshot = isDocumentPath(path)
    ? createSnapshot(createDocRef(path))
    : createCollectionSnapshot(path);

  for (const listener of listeners) {
    listener.next(snapshot);
  }
}

function notifyDocAndParentCollection(path: string) {
  emitPathSnapshot(path);
  const parentCollectionPath = getParentCollectionPath(path);

  if (parentCollectionPath) {
    emitPathSnapshot(parentCollectionPath);
  }
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

function replaceCollectionDocs(path: string, docs: SeedCollectionDoc[]) {
  for (const existingPath of [...docStore.keys()]) {
    if (isDirectChildOfCollection(existingPath, path)) {
      docStore.delete(existingPath);
    }
  }

  docs.forEach((docData, index) => {
    const { __id, ...data } = docData;
    const docId = __id ?? `seed-doc-${index + 1}`;
    setStoredDoc(`${path}/${docId}`, data);
  });
}

export function setInitialAuthState(user: User | null) {
  auth.currentUser = user;
}

export function setAuthBootstrapMode(mode: 'immediate' | 'deferred') {
  emitAuthImmediately = mode === 'immediate';
}

export function setRedirectResult(user: User | null) {
  pendingRedirectResult = user ? { user } : null;
}

export function setPopupResult(user: User | null) {
  pendingPopupResult = user ? { user } : null;
}

export function setAuthActionError(
  action: 'redirect_result' | 'sign_in' | 'sign_out',
  error: Error | null,
) {
  if (action === 'redirect_result') {
    redirectResultError = error;
    return;
  }

  if (action === 'sign_in') {
    signInError = error;
    return;
  }

  signOutError = error;
}

export function setBatchCommitError(error: Error | null) {
  batchCommitError = error;
}

export function setSetDocError(error: Error | null) {
  setDocError = error;
}

export function getAuthActionCalls() {
  return { ...authActionCalls };
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

export async function getRedirectResultMock() {
  authActionCalls.getRedirectResult += 1;

  if (redirectResultError) {
    throw redirectResultError;
  }

  const nextResult = pendingRedirectResult;
  pendingRedirectResult = null;
  return nextResult;
}

export async function signInWithRedirectMock() {
  authActionCalls.signInWithRedirect += 1;

  if (signInError) {
    throw signInError;
  }
}

export async function signInWithPopupMock() {
  authActionCalls.signInWithPopup += 1;

  if (signInError) {
    throw signInError;
  }

  const nextResult = pendingPopupResult ?? { user: createMockUser() };
  pendingPopupResult = null;
  auth.currentUser = nextResult.user;
  emitAuthState(nextResult.user);
  return nextResult;
}

export async function signOutMock() {
  authActionCalls.signOut += 1;

  if (signOutError) {
    throw signOutError;
  }

  emitAuthState(null);
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

  return createDocRef(path);
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
  if (setDocError) {
    throw setDocError;
  }

  setStoredDoc(ref.path, data);
  notifyDocAndParentCollection(ref.path);
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
  notifyDocAndParentCollection(ref.path);
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
      if (batchCommitError) {
        throw batchCommitError;
      }

      committedBatches.push(
        operations.map((operation) => ({
          ...operation,
          data: cloneData(operation.data),
        })),
      );

      for (const operation of operations) {
        if (operation.type === 'set') {
          setStoredDoc(operation.ref.path, operation.data);
          notifyDocAndParentCollection(operation.ref.path);
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
  ref: MockDocRef | MockCollectionRef,
  next: SnapshotNextListener,
  error?: SnapshotErrorListener,
) {
  const listeners = snapshotListeners.get(ref.path) ?? new Set();
  const listener = { next, error };
  listeners.add(listener);
  snapshotListeners.set(ref.path, listeners);
  next(isDocumentPath(ref.path) ? createSnapshot(createDocRef(ref.path)) : createCollectionSnapshot(ref.path));

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

export function seedCollection(path: string, docs: SeedCollectionDoc[]) {
  replaceCollectionDocs(path, docs);
}

export function emitDocSnapshot(path: string, data: Record<string, unknown>) {
  setStoredDoc(path, data);
  notifyDocAndParentCollection(path);
}

export function emitCollectionSnapshot(path: string, docs: SeedCollectionDoc[]) {
  replaceCollectionDocs(path, docs);
  emitPathSnapshot(path);
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
  pendingRedirectResult = null;
  pendingPopupResult = null;
  redirectResultError = null;
  signInError = null;
  signOutError = null;
  batchCommitError = null;
  setDocError = null;
  authActionCalls.getRedirectResult = 0;
  authActionCalls.signInWithPopup = 0;
  authActionCalls.signInWithRedirect = 0;
  authActionCalls.signOut = 0;
}
