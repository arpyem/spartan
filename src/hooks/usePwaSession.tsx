import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { devLog, sanitizeErrorForDevLog } from '@/lib/dev-logging';
import { isStandalonePwa, shouldShowIosInstallInstructions } from '@/lib/pwa-runtime';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

interface PwaSessionContextValue {
  canInstall: boolean;
  isStandalone: boolean;
  installError: string | null;
  installInProgress: boolean;
  showIosInstallInstructions: boolean;
  installApp: () => Promise<void>;
  clearInstallError: () => void;
}

const PwaSessionContext = createContext<PwaSessionContextValue | null>(null);

function readStandaloneState() {
  if (typeof window === 'undefined') {
    return false;
  }

  return isStandalonePwa({
    hasWindow: true,
    standaloneDisplayMode:
      typeof window.matchMedia === 'function'
      && window.matchMedia('(display-mode: standalone)').matches,
    iosStandalone: Boolean(
      (window.navigator as Navigator & { standalone?: boolean }).standalone,
    ),
  });
}

function readIosInstallInstructionState() {
  if (typeof window === 'undefined') {
    return false;
  }

  return shouldShowIosInstallInstructions({
    hasWindow: true,
    userAgent: navigator.userAgent,
    standaloneDisplayMode:
      typeof window.matchMedia === 'function'
      && window.matchMedia('(display-mode: standalone)').matches,
    iosStandalone: Boolean(
      (window.navigator as Navigator & { standalone?: boolean }).standalone,
    ),
  });
}

function normalizeInstallError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unable to open the install prompt right now.';
}

export function PwaSessionProvider({ children }: { children: ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [isStandalone, setIsStandalone] = useState(readStandaloneState);
  const [installError, setInstallError] = useState<string | null>(null);
  const [installInProgress, setInstallInProgress] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const standaloneMediaQuery = window.matchMedia('(display-mode: standalone)');
    let lastStandalone = readStandaloneState();

    devLog.info('pwa', 'install_state_initialized', {
      isStandalone: lastStandalone,
      showIosInstallInstructions: readIosInstallInstructionState(),
    });

    const syncStandaloneState = () => {
      const nextStandalone = readStandaloneState();

      if (nextStandalone === lastStandalone) {
        return;
      }

      lastStandalone = nextStandalone;
      setIsStandalone(nextStandalone);
      devLog.info('pwa', 'display_mode_changed', {
        isStandalone: nextStandalone,
      });
    };

    const handleBeforeInstallPrompt = (event: Event) => {
      const promptEvent = event as BeforeInstallPromptEvent;
      promptEvent.preventDefault();
      setDeferredPrompt(promptEvent);
      setInstallError(null);
      devLog.info('pwa', 'install_prompt_available');
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setInstallError(null);
      setInstallInProgress(false);
      setIsStandalone(true);
      lastStandalone = true;
      devLog.info('pwa', 'app_installed');
    };

    if (standaloneMediaQuery.addEventListener) {
      standaloneMediaQuery.addEventListener('change', syncStandaloneState);
    } else {
      standaloneMediaQuery.addListener(syncStandaloneState);
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      if (standaloneMediaQuery.removeEventListener) {
        standaloneMediaQuery.removeEventListener('change', syncStandaloneState);
      } else {
        standaloneMediaQuery.removeListener(syncStandaloneState);
      }
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const value = useMemo<PwaSessionContextValue>(() => ({
    canInstall: Boolean(deferredPrompt) && !isStandalone,
    isStandalone,
    installError,
    installInProgress,
    showIosInstallInstructions:
      !Boolean(deferredPrompt) && readIosInstallInstructionState(),
    async installApp() {
      if (!deferredPrompt || isStandalone) {
        return;
      }

      setInstallInProgress(true);
      setInstallError(null);
      devLog.info('pwa', 'install_prompt_requested');

      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;

        devLog.info('pwa', 'install_prompt_completed', {
          outcome: choice.outcome,
          platform: choice.platform,
        });

        if (choice.outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      } catch (error) {
        devLog.error('pwa', 'install_prompt_failed', {
          error: sanitizeErrorForDevLog(error),
        });
        setInstallError(normalizeInstallError(error));
      } finally {
        setInstallInProgress(false);
      }
    },
    clearInstallError() {
      setInstallError(null);
    },
  }), [deferredPrompt, installError, installInProgress, isStandalone]);

  return (
    <PwaSessionContext.Provider value={value}>
      {children}
    </PwaSessionContext.Provider>
  );
}

export function usePwaSession() {
  const context = useContext(PwaSessionContext);

  if (!context) {
    throw new Error('usePwaSession must be used within a PwaSessionProvider.');
  }

  return context;
}
