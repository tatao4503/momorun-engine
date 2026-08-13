// 모모런 엔진 공개본 서비스 워커.
const CACHE_NAME = 'momorun-engine-v2';
const APP_ASSETS = [
  "./",
  "./modes.html",
  "./momotalk.html",
  "./life.html",
  "./privacy.html",
  "./css/modes.css",
  "./css/lite.css",
  "./css/life.css",
  "./js/core.js",
  "./js/mode-router.js",
  "./js/character-loader.js",
  "./js/character-theme.js",
  "./js/character-settings.js",
  "./js/lite.js",
  "./js/life.js",
  "./voice/manifest.js",
  "./original/lumi/character.js",
  "./original/lumi/avatar.jpg",
  "./original/lumi/mobile.jpg",
  "./original/companion/character.js",
  "./original/companion/avatar.jpg",
  "./original/companion/mobile.jpg",
  "./original/companion/desktop.jpg",
  "./original/companion/icon-192.png",
  "./original/companion/icon-512.png",
  "./manifest.webmanifest"
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const codeAsset = /\.(?:html|css|js)$/.test(url.pathname) || url.pathname.endsWith('/');
  if (event.request.mode === 'navigate' || (url.origin === self.location.origin && codeAsset)) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then(hit => hit || caches.match('./modes.html'))),
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then(hit => hit || fetch(event.request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      }
      return response;
    })),
  );
});
