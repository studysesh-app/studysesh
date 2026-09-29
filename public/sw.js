/* Dev and pre-Workbox fallback. `npm run build:web` replaces dist/sw.js with a
 * Workbox worker that precaches the exported site. This file only exists so the
 * app stays installable during `expo start --web`, where that build has not run.
 * It does not cache anything, so Metro and network requests are left alone.
 */
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', () => {
  // A fetch handler is required for installation. Leaving the event alone
  // keeps the browser on the network.
});
