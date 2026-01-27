const CACHE_NAME = 'en-el-nido-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/stories.js',
    '/app.js',
    '/manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
            .catch(() => {
                // Cache failed, but service worker can still work
            })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
            .catch(() => {
                // Both cache and network failed
            })
    );
});
