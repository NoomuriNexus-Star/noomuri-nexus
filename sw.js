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

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener
