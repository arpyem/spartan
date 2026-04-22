import type {
  AppUser,
  DevLogCategory,
  DevLogEntry,
  DevLogLevel,
  DevLogValue,
  TrackProgress,
  WorkoutStats,
} from '@/lib/types';

const DEV_LOG_STORAGE_KEY = 'spartan-dev-logs:v1';
const DEV_LOG_PREFIX = '[spartan-devlog]';
const MAX_DEV_LOG_ENTRIES = 300;

type ConsoleLike = Pick<Console, 'debug' | 'info' | 'warn' | 'error'>;
type ClipboardLike = Pick<Clipboard, 'writeText'>;
type DevLogListener = () => void;

interface DevLogStoreOptions {
  enabled: boolean;
  maxEntries?: number;
  storageKey?: string;
  console?: ConsoleLike;
  storage?: Storage | null;
  clipboard?: ClipboardLike | null;
  now?: () => Date;
  routeReader?: () => string | null;
}

interface LogEventInput {
  level: DevLogLevel;
  category: DevLogCategory;
  event: string;
  route?: string | null;
  data?: unknown;
}

export interface DevLogStore {
  readonly enabled: boolean;
  getEntries: () => DevLogEntry[];
  subscribe: (listener: DevLogListener) => () => void;
  log: (input: LogEventInput) => DevLogEntry | null;
  clear: () => void;
  copy: (entries?: DevLogEntry[]) => Promise<string>;
}

declare global {
  interface Window {
    __SPARTAN_DEV_LOGS__?: {
      get: () => DevLogEntry[];
      clear: () => void;
      copy: () => Promise<string>;
    };
  }
}

function hasWindow() {
  return typeof window !== 'undefined';
}

function defaultRouteReader() {
  if (!hasWindow()) {
    return null;
  }

  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function suffix(value: string) {
  return value.slice(-6);
}

function sanitizePrimitive(
  value: string | number | boolean | null,
  key?: string,
): DevLogValue {
  if (typeof value !== 'string') {
    return value;
  }

  const normalizedKey = key?.toLowerCase();

  if (!normalizedKey) {
    return value;
  }

  if (normalizedKey === 'uid' || normalizedKey === 'userid') {
    return suffix(value);
  }

  if (normalizedKey === 'email') {
    return '[redacted-email]';
  }

  if (normalizedKey === 'note') {
    return value.length;
  }

  if (normalizedKey === 'photourl' || normalizedKey === 'photo_url') {
    return '[redacted-photo-url]';
  }

  if (
    normalizedKey.includes('token')
    || normalizedKey.includes('secret')
    || normalizedKey.includes('password')
    || normalizedKey.includes('apikey')
    || normalizedKey.includes('api_key')
  ) {
    return '[redacted]';
  }

  return value;
}

export function sanitizeErrorForDevLog(error: unknown): DevLogValue {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
    };
  }

  return {
    message: typeof error === 'string' ? error : 'Unknown error',
  };
}

export function sanitizeDevLogData(data: unknown, key?: string): DevLogValue | null {
  if (data === undefined) {
    return null;
  }

  if (
    data === null
    || typeof data === 'string'
    || typeof data === 'number'
    || typeof data === 'boolean'
  ) {
    return sanitizePrimitive(data, key);
  }

  if (data instanceof Date) {
    return data.toISOString();
  }

  if (data instanceof Error) {
    return sanitizeErrorForDevLog(data);
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeDevLogData(item));
  }

  if (typeof data === 'object') {
    const nextRecord: Record<string, DevLogValue> = {};

    for (const [recordKey, recordValue] of Object.entries(data)) {
      const normalizedKey = recordKey.toLowerCase();

      if (normalizedKey === 'uid' || normalizedKey === 'userid') {
        nextRecord.uidSuffix = typeof recordValue === 'string' ? suffix(recordValue) : null;
        continue;
      }

      if (normalizedKey === 'displayname') {
        nextRecord.hasDisplayName = Boolean(recordValue);
        continue;
      }

      if (normalizedKey === 'email') {
        nextRecord.hasEmail = Boolean(recordValue);
        continue;
      }

      if (normalizedKey === 'photourl' || normalizedKey === 'photo_url') {
        nextRecord.hasPhotoURL = Boolean(recordValue);
        continue;
      }

      if (normalizedKey === 'note') {
        nextRecord.noteLength = typeof recordValue === 'string' ? recordValue.length : 0;
        continue;
      }

      nextRecord[recordKey] = sanitizeDevLogData(recordValue, recordKey);
    }

    return nextRecord;
  }

  return String(data);
}

export function summarizeAuthUserForDevLog(user: AppUser | null | undefined): DevLogValue {
  if (!user) {
    return {
      signedIn: false,
    };
  }

  return {
    signedIn: true,
    uidSuffix: suffix(user.uid),
    hasDisplayName: Boolean(user.displayName),
    hasEmail: Boolean(user.email),
    hasPhotoURL: Boolean(user.photoURL),
  };
}

export function summarizeTrackProgressForDevLog(progress: TrackProgress): DevLogValue {
  return {
    xp: progress.xp,
    tour: progress.tour,
  };
}

export function summarizeWorkoutStatsForDevLog(stats: WorkoutStats): DevLogValue {
  return {
    totalWorkouts: stats.totalWorkouts,
    totalXp: stats.totalXp,
  };
}

function formatConsoleLabel(entry: DevLogEntry) {
  return `${DEV_LOG_PREFIX} ${entry.level.toUpperCase()} ${entry.category}.${entry.event}`;
}

function serializeEntries(entries: DevLogEntry[]) {
  return JSON.stringify(entries, null, 2);
}

function restoreEntries(storage: Storage | null, storageKey: string): DevLogEntry[] {
  if (!storage) {
    return [];
  }

  try {
    const raw = storage.getItem(storageKey);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as DevLogEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function createDevLogStore({
  enabled,
  maxEntries = MAX_DEV_LOG_ENTRIES,
  storageKey = DEV_LOG_STORAGE_KEY,
  console: sink = console,
  storage = hasWindow() ? window.sessionStorage : null,
  clipboard = hasWindow() ? window.navigator?.clipboard ?? null : null,
  now = () => new Date(),
  routeReader = defaultRouteReader,
}: DevLogStoreOptions): DevLogStore {
  let entries = enabled ? restoreEntries(storage, storageKey).slice(-maxEntries) : [];
  const listeners = new Set<DevLogListener>();
  let counter = 0;

  function notify() {
    listeners.forEach((listener) => listener());
  }

  function persist() {
    if (!enabled || !storage) {
      return;
    }

    try {
      if (entries.length === 0) {
        storage.removeItem(storageKey);
        return;
      }

      storage.setItem(storageKey, serializeEntries(entries));
    } catch {
      // Ignore persistence failures in dev logging.
    }
  }

  function mirrorToConsole(entry: DevLogEntry) {
    const method = sink[entry.level] ?? sink.info;
    method.call(sink, formatConsoleLabel(entry), entry.data ?? {});
  }

  return {
    enabled,
    getEntries() {
      return entries;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    log(input) {
      if (!enabled) {
        return null;
      }

      counter += 1;
      const entry: DevLogEntry = {
        id: `${now().getTime()}-${counter}`,
        timestamp: now().toISOString(),
        level: input.level,
        category: input.category,
        event: input.event,
        route: input.route ?? routeReader(),
        data: sanitizeDevLogData(input.data),
      };

      entries = [...entries, entry].slice(-maxEntries);
      persist();
      mirrorToConsole(entry);
      notify();
      return entry;
    },
    clear() {
      if (!enabled) {
        return;
      }

      entries = [];
      persist();
      notify();
    },
    async copy(targetEntries = entries) {
      const text = serializeEntries(targetEntries);

      if (enabled && clipboard?.writeText) {
        await clipboard.writeText(text);
      }

      return text;
    },
  };
}

export const devLogStore = createDevLogStore({
  enabled: import.meta.env.DEV,
});

export const devLog = {
  debug(category: DevLogCategory, event: string, data?: unknown, route?: string | null) {
    return devLogStore.log({ level: 'debug', category, event, data, route });
  },
  info(category: DevLogCategory, event: string, data?: unknown, route?: string | null) {
    return devLogStore.log({ level: 'info', category, event, data, route });
  },
  warn(category: DevLogCategory, event: string, data?: unknown, route?: string | null) {
    return devLogStore.log({ level: 'warn', category, event, data, route });
  },
  error(category: DevLogCategory, event: string, data?: unknown, route?: string | null) {
    return devLogStore.log({ level: 'error', category, event, data, route });
  },
};

if (devLogStore.enabled && hasWindow()) {
  window.__SPARTAN_DEV_LOGS__ = {
    get: () => devLogStore.getEntries(),
    clear: () => devLogStore.clear(),
    copy: () => devLogStore.copy(),
  };
}
