import { resolveFirebaseAuthDomain } from '@/lib/firebase';

describe('resolveFirebaseAuthDomain', () => {
  const originalWindow = globalThis.window;

  afterEach(() => {
    globalThis.window = originalWindow;
  });

  it('keeps the configured firebaseapp.com auth domain when window is unavailable', () => {
    // @ts-expect-error test intentionally removes window
    delete globalThis.window;

    expect(resolveFirebaseAuthDomain('spartan-867b0.firebaseapp.com')).toBe(
      'spartan-867b0.firebaseapp.com',
    );
  });

  it('keeps the configured auth domain on localhost', () => {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        location: {
          host: 'localhost:5173',
        },
      },
    });

    expect(resolveFirebaseAuthDomain('spartan-867b0.firebaseapp.com')).toBe(
      'spartan-867b0.firebaseapp.com',
    );
  });

  it('switches redirect auth to the current Hosting domain on production origins', () => {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        location: {
          host: 'spartan-867b0.web.app',
        },
      },
    });

    expect(resolveFirebaseAuthDomain('spartan-867b0.firebaseapp.com')).toBe(
      'spartan-867b0.web.app',
    );
  });
});
