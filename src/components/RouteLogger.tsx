import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { devLog } from '@/lib/dev-logging';

export function RouteLogger() {
  const location = useLocation();

  useEffect(() => {
    devLog.info('route', 'route_changed', {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
    });
  }, [location.hash, location.pathname, location.search]);

  return null;
}
