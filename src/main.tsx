import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import '@fontsource/orbitron/500.css';
import '@fontsource/orbitron/700.css';
import '@fontsource/orbitron/800.css';
import '@fontsource/share-tech-mono/400.css';
import App from '@/App';
import { devLog, sanitizeErrorForDevLog } from '@/lib/dev-logging';
import '@/styles.css';

registerSW({
  immediate: true,
  onRegisteredSW(swUrl, registration) {
    devLog.info('pwa', 'service_worker_registered', {
      swUrl,
      hasRegistration: Boolean(registration),
    });
  },
  onOfflineReady() {
    devLog.info('pwa', 'service_worker_offline_ready');
  },
  onNeedRefresh() {
    devLog.info('pwa', 'service_worker_refresh_available');
  },
  onRegisterError(error) {
    devLog.error('pwa', 'service_worker_register_failed', {
      error: sanitizeErrorForDevLog(error),
    });
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
