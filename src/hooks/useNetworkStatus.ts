import { useEffect, useRef, useState } from 'react';
import { devLog } from '@/lib/dev-logging';

function readOnlineState() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return true;
  }

  return navigator.onLine;
}

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(readOnlineState);
  const didLogInitialRef = useRef(false);

  useEffect(() => {
    function handleOnline() {
      devLog.info('network', 'network_status_changed', {
        isOnline: true,
      });
      setIsOnline(true);
    }

    function handleOffline() {
      devLog.warn('network', 'network_status_changed', {
        isOnline: false,
      });
      setIsOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!didLogInitialRef.current) {
      devLog.info('network', 'network_status_initialized', {
        isOnline,
      });
      didLogInitialRef.current = true;
    }
  }, [isOnline]);

  return {
    isOnline,
  };
}
