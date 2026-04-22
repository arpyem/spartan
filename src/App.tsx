import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { BrowserRouter } from 'react-router-dom';
import { BootScreen } from '@/components/BootScreen';
import { AppRoutes } from '@/router';
import { AuthScreen } from '@/screens/AuthScreen';
import { auth } from '@/lib/firebase';

type AuthPhase = 'loading' | 'signed_out' | 'signed_in';

export default function App() {
  const [authPhase, setAuthPhase] = useState<AuthPhase>('loading');
  const [, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthPhase(nextUser ? 'signed_in' : 'signed_out');
    });

    return unsubscribe;
  }, []);

  if (authPhase === 'loading') {
    return <BootScreen />;
  }

  if (authPhase === 'signed_out') {
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
