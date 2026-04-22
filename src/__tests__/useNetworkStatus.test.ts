import { act, renderHook } from '@testing-library/react';

function setOnlineState(isOnline: boolean) {
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    value: isOnline,
  });
}

describe('useNetworkStatus', () => {
  beforeEach(() => {
    setOnlineState(true);
  });

  it('tracks online and offline browser events', async () => {
    const { useNetworkStatus } = await import('@/hooks/useNetworkStatus');
    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.isOnline).toBe(true);

    await act(async () => {
      setOnlineState(false);
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current.isOnline).toBe(false);

    await act(async () => {
      setOnlineState(true);
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current.isOnline).toBe(true);
  });
});
