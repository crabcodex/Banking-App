/**
 * @bank/web — Frontend: Banco San Patricio
 *
 * Estructura planificada: ver README o wiki (Plan Frontend)
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import '@/styles/globals.css';
import { Router } from '@/app/routes';
import { QueryProvider } from '@/app/providers/QueryProvider';

async function deferRender() {
  if (import.meta.env.DEV) {
    const { worker } = await import('@/features/auth/mocks/browser');
    return worker.start({
      onUnhandledRequest: 'bypass',
    });
  }
}

deferRender().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryProvider>
        <Router />
      </QueryProvider>
    </React.StrictMode>
  );
});
