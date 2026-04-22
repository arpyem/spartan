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
  getFirebaseServices: () => ({
    firebaseApp,
    auth,
    db,
    googleProvider,
  }),
}));

describe('firebase module mocking', () => {
  it('can mock the Firebase boundary without touching real services', async () => {
    const module = await import('@/lib/firebase');
    const services = module.getFirebaseServices();

    expect(services.firebaseApp).toBe(firebaseApp);
    expect(services.auth).toBe(auth);
    expect(services.db).toBe(db);
    expect(services.googleProvider).toBe(googleProvider);
  });
});
