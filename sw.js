// Service Worker for Nexus PWA
const CACHE_NAME = "nexus-cache-v1";
const urlsToCache = [
  "/noomuri-nexus/",
  "/noomuri-nexus/index.html",
  "/noomuri-nexus/style.css",
  "/noomuri-nexus/app.js",
  "/noomuri-nexus/manifest.json",
  "/noomuri-nexus/sw.js",
  "/noomuri-nexus/icon-192.png",
  "/noomuri-nexus/icon-512.png"
];

// Install event: cache files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch event: serve cached files if available
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
