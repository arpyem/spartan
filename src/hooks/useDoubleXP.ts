import { useEffect, useState } from 'react';
import { getDoubleXPStatus } from '@/lib/xp';
import { getAppRuntime } from '@/lib/runtime';
import type { DoubleXPStatus } from '@/lib/types';

const STATUS_REFRESH_MS = 60 * 1000;

export function useDoubleXP(): DoubleXPStatus {
  const appRuntime = getAppRuntime();
  const readStatus = () => appRuntime.getDoubleXPStatusOverride() ?? getDoubleXPStatus();
  const [status, setStatus] = useState<DoubleXPStatus>(() => readStatus());

  useEffect(() => {
    const refresh = () => {
      setStatus(readStatus());
    };

    refresh();

    const intervalId = window.setInterval(refresh, STATUS_REFRESH_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [appRuntime]);

  return status;
}
