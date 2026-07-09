// Installable-only service worker. Intentionally does not cache or
// intercept anything — every screen depends on live prices/news/analysis,
// so serving cached data would show stale numbers as if current.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // No-op: requests always go to the network.
});
