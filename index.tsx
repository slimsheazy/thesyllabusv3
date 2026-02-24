
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import * as geminiService from './services/geminiService';
import * as astrologyService from './services/astrologyService';
import * as dbService from './services/dbService';
import { useSyllabusStore } from './store';
import { useResonance } from './hooks/useResonance';

// Expose internals to window for dynamic/eval context access
(window as any).esoteric = {
  services: { geminiService, astrologyService, dbService },
  hooks: { useSyllabusStore, useResonance },
  React
};

// Register Service Worker for PWA capabilities
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
