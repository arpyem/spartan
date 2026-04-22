import {
  auth,
  db,
  firebaseApp,
  googleProvider,
} from '@/__tests__/mocks/firebase';

vi.mock('@/lib/firebase', () => ({
  firebaseApp,
  auth,
  db,
  googleProvider,
}));

describe('firebase module mocking', () => {
  it('can mock the Firebase boundary without touching real services', async () => {
    const module = await import('@/lib/firebase');

    expect(module.firebaseApp).toBe(firebaseApp);
    expect(module.auth).toBe(auth);
    expect(module.db).toBe(db);
    expect(module.googleProvider).toBe(googleProvider);
  });
});
