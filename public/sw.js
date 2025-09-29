// Empty service worker to prevent errors
self.addEventListener('install', function(event) {
  // Do nothing on install
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  // Do nothing on activate
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(event) {
  // Don't intercept any requests - let them go through normally
  return;
});