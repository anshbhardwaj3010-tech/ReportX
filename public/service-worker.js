const CACHE_NAME = 'reportx-shell-v3';
const APP_SHELL = ['/', '/manifest.webmanifest', '/reportx-icon.svg', '/favicon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL);
    const response = await fetch('/');
    const html = await response.text();
    const appAssets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((match) => match[1]);
    if (appAssets.length) await cache.addAll(appAssets);
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key.startsWith('reportx-') && key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin
    || url.pathname.startsWith('/api/') || url.pathname.startsWith('/uploads/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(async () => {
      const cachedPage = await caches.match('/', { ignoreVary: true });
      if (!cachedPage) throw new Error('ReportX offline shell is not cached.');
      return cachedPage;
    }));
    return;
  }

  event.respondWith(caches.match(request, { ignoreVary: true }).then((cachedResponse) => {
    if (cachedResponse) return cachedResponse;
    return fetch(request);
  }));
});
