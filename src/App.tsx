import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { BootScreen } from '@/components/BootScreen';
import { RouteLogger } from '@/components/RouteLogger';
import { AppRoutes } from '@/router';
import { AuthScreen } from '@/screens/AuthScreen';
import { AuthSessionProvider, useAuthSession } from '@/hooks/useAuthSession';
import { PwaSessionProvider } from '@/hooks/usePwaSession';
import { devLog } from '@/lib/dev-logging';

const DevLogPanel = import.meta.env.DEV
  ? lazy(async () => {
      const module = await import('@/components/DevLogPanel');
      return { default: module.DevLogPanel };
    })
  : null;

function AppShell() {
  const { status } = useAuthSession();

  useEffect(() => {
    devLog.info('app', 'app_shell_rendered', {
      status,
    });
  }, [status]);

  if (status === 'loading') {
    return (
      <>
        <BootScreen />
        {DevLogPanel ? (
          <Suspense fallback={null}>
            <DevLogPanel />
          </Suspense>
        ) : null}
      </>
    );
  }

  if (status === 'signed_out') {
    return (
      <>
        <AuthScreen />
        {DevLogPanel ? (
          <Suspense fallback={null}>
            <DevLogPanel />
          </Suspense>
        ) : null}
      </>
    );
  }

  return (
    <>
      <BrowserRouter
        future={{
          v7_relativeSplatPath: true,
          v7_startTransition: true,
        }}
      >
        <RouteLogger />
        <Suspense fallback={<BootScreen />}>
          <AppRoutes />
        </Suspense>
      </BrowserRouter>
      {DevLogPanel ? (
        <Suspense fallback={null}>
          <DevLogPanel />
        </Suspense>
      ) : null}
    </>
  );
}

export default function App() {
  useEffect(() => {
    devLog.info('app', 'app_mounted');
  }, []);

  return (
    <PwaSessionProvider>
      <AuthSessionProvider>
        <AppShell />
      </AuthSessionProvider>
    </PwaSessionProvider>
  );
}
