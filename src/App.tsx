import { BrowserRouter } from 'react-router-dom';
import { BootScreen } from '@/components/BootScreen';
import { AppRoutes } from '@/router';
import { AuthScreen } from '@/screens/AuthScreen';
import { AuthSessionProvider, useAuthSession } from '@/hooks/useAuthSession';

function AppShell() {
  const { status } = useAuthSession();

  if (status === 'loading') {
    return <BootScreen />;
  }

  if (status === 'signed_out') {
    return <AuthScreen />;
  }

  return (
    <BrowserRouter
      future={{
        v7_relativeSplatPath: true,
        v7_startTransition: true,
      }}
    >
      <AppRoutes />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthSessionProvider>
      <AppShell />
    </AuthSessionProvider>
  );
}
