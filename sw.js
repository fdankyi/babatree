/* The Baba Tree - offline helper (service worker)
   Keeps a copy of the app on the device so it works with no internet. */
const CACHE = 'babatree-v5';
const ASSETS = ['./', './index.html'];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE)
      .then(function (cache) { return cache.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(
          keys.filter(function (k) { return k !== CACHE; })
              .map(function (k) { return caches.delete(k); })
        );
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      if (cached) return cached;
      return fetch(event.request)
        .then(function (resp) {
          var copy = resp.clone();
          caches.open(CACHE).then(function (cache) {
            try { cache.put(event.request, copy); } catch (e) {}
          });
          return resp;
        })
        .catch(function () { return caches.match('./index.html'); });
    })
  );
});
