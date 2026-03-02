import { StrictMode } from 'react';

import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';

import App from './App.tsx';
import './i18n';
import './index.css';

import './fonts.css';
import '@bettergov/kapwa/kapwa.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>
);
