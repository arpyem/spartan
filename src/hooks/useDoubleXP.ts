import { useEffect, useState } from 'react';
import { getDoubleXPStatus } from '@/lib/xp';
import type { DoubleXPStatus } from '@/lib/types';

const STATUS_REFRESH_MS = 60 * 1000;

export function useDoubleXP(): DoubleXPStatus {
  const [status, setStatus] = useState<DoubleXPStatus>(() => getDoubleXPStatus());

  useEffect(() => {
    const refresh = () => {
      setStatus(getDoubleXPStatus());
    };

    refresh();

    const intervalId = window.setInterval(refresh, STATUS_REFRESH_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return status;
}
