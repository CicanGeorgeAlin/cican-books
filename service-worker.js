const CACHE_NAME = "cican-shell-v20";

const SHELL = [
  "./",
  "./index.html",
  "./library.html",
  "./understand.html",
  "./play-v17.html",
  "./manifest.webmanifest",
  "./cican-preview.png",
  "./icons/icon-192.svg",
  "./icons/icon-512.svg",
  "./catalog/index.js",
  "./engine/book-loader.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith("cican-shell-") && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  // Navigations: prefer the live page, then fall back to the cached app shell.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(request).then(
        cached => cached || caches.match("./index.html")
      ))
    );
    return;
  }

  // Same-origin assets: network first, then cache.
  // Successful book scripts and full-text assets are cached only after
  // the user has legitimately requested them from the live app.
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy))
          );
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});