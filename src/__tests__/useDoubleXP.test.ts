import { act, renderHook } from '@testing-library/react';

const getDoubleXPStatusMock = vi.fn();

vi.mock('@/lib/xp', () => ({
  getDoubleXPStatus: getDoubleXPStatusMock,
}));

describe('useDoubleXP', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    getDoubleXPStatusMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the current status and refreshes on the interval', async () => {
    getDoubleXPStatusMock
      .mockReturnValueOnce({ active: false, upcoming: true })
      .mockReturnValueOnce({ active: false, upcoming: true })
      .mockReturnValue({ active: true, upcoming: false });

    const { useDoubleXP } = await import('@/hooks/useDoubleXP');
    const { result } = renderHook(() => useDoubleXP());

    expect(result.current).toEqual({ active: false, upcoming: true });

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(result.current).toEqual({ active: true, upcoming: false });
  });
});
