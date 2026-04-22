import { createDevLogStore } from '@/lib/dev-logging';

function createMemoryStorage(initialEntries?: string) {
  const store = new Map<string, string>();

  if (initialEntries) {
    store.set('spartan-dev-logs:v1', initialEntries);
  }

  return {
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    key(index: number) {
      return [...store.keys()][index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
    get length() {
      return store.size;
    },
  } as Storage;
}

describe('dev logging store', () => {
  it('no-ops when disabled', () => {
    const store = createDevLogStore({
      enabled: false,
      storage: createMemoryStorage(),
    });

    expect(
      store.log({
        level: 'info',
        category: 'app',
        event: 'disabled_event',
      }),
    ).toBeNull();
    expect(store.getEntries()).toEqual([]);
  });

  it('rehydrates and truncates to the last 300 entries', () => {
    const entries = Array.from({ length: 305 }, (_, index) => ({
      id: `entry-${index}`,
      timestamp: `2026-04-22T00:00:${String(index).padStart(2, '0')}Z`,
      level: 'info',
      category: 'app',
      event: `event_${index}`,
      route: '/',
      data: null,
    }));
    const store = createDevLogStore({
      enabled: true,
      storage: createMemoryStorage(JSON.stringify(entries)),
    });

    expect(store.getEntries()).toHaveLength(300);
    expect(store.getEntries()[0]?.id).toBe('entry-5');
    expect(store.getEntries().at(-1)?.id).toBe('entry-304');
  });

  it('sanitizes payloads and mirrors to the matching console level', () => {
    const consoleSink = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
    const store = createDevLogStore({
      enabled: true,
      console: consoleSink,
      storage: createMemoryStorage(),
      routeReader: () => '/log/cardio',
      now: () => new Date('2026-04-22T00:00:00.000Z'),
    });

    const entry = store.log({
      level: 'warn',
      category: 'write',
      event: 'payload_sanitized',
      data: {
        uid: 'spartan-117',
        email: 'chief@example.com',
        displayName: 'Master Chief',
        photoURL: 'https://example.com/chief.png',
        note: 'Heavy deadlift session',
        token: 'secret-token',
      },
    });

    expect(entry?.route).toBe('/log/cardio');
    expect(entry?.data).toEqual({
      uidSuffix: 'an-117',
      hasEmail: true,
      hasDisplayName: true,
      hasPhotoURL: true,
      noteLength: 22,
      token: '[redacted]',
    });
    expect(consoleSink.warn).toHaveBeenCalledTimes(1);
  });

  it('persists entries, copies them, and clears the store', async () => {
    const storage = createMemoryStorage();
    const clipboard = {
      writeText: vi.fn().mockResolvedValue(undefined),
    };
    const store = createDevLogStore({
      enabled: true,
      storage,
      clipboard,
    });

    store.log({
      level: 'info',
      category: 'app',
      event: 'persisted_event',
    });

    expect(storage.getItem('spartan-dev-logs:v1')).toContain('persisted_event');

    const copied = await store.copy();

    expect(copied).toContain('persisted_event');
    expect(clipboard.writeText).toHaveBeenCalledWith(copied);

    store.clear();
    expect(store.getEntries()).toEqual([]);
    expect(storage.getItem('spartan-dev-logs:v1')).toBeNull();
  });
});
