/*
 * Offline support. The build (build/offline.ts) puts the list of app files
 * in PRECACHE and a content hash in VERSION at the top of this file.
 *
 * Everything is saved on first visit, so the app opens and works with no
 * signal on site. A new version is downloaded in the background and used
 * once the buyer taps "Update" or next opens the app.
 */
/* global PRECACHE, VERSION */

const PREFIX = "handover-check-";
const CACHE = PREFIX + VERSION;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        cache.addAll(
          PRECACHE.map((url) => new Request(url, { cache: "reload" })),
        ),
      ),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(PREFIX) && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  if (new URL(request.url).origin !== self.location.origin) return;

  // The app is a single page, so every page load gets the saved index.html.
  const lookup =
    request.mode === "navigate"
      ? caches.match("index.html", { cacheName: CACHE })
      : caches.match(request, { cacheName: CACHE });

  event.respondWith(lookup.then((cached) => cached || fetch(request)));
});
