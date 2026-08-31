/**
 * sw.js - Service Worker Offline Cache para Jaque al Rey (PWA)
 * Soporte 100% offline para partidas, academia, minijuegos y puzzles.
 */

const CACHE_NAME = 'jaque-al-rey-v1.2.0';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/i18n.js',
  './js/pieces.js',
  './js/audio.js',
  './js/engine.js',
  './js/board.js',
  './js/board_themes.js',
  './js/notebook.js',
  './js/academy.js',
  './js/minigames.js',
  './js/puzzles.js',
  './js/ai.js',
  './js/app.js',
  './manifest.webmanifest',
  './assets/icons/favicon-32x32.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/og_banner.png',
  './assets/backgrounds/bg_day.png',
  './assets/backgrounds/bg_night.png',
  './assets/tiles/pattern_wood_bark.png',
  './assets/tiles/pattern_jungle_dark.png',
  './assets/tiles/board_light_stone.png',
  './assets/tiles/board_dark_stone.png',
  './assets/tiles/board_light_grass.png',
  './assets/tiles/board_dark_grass.png',
  './assets/tiles/board_light_clay.png',
  './assets/tiles/board_dark_clay.png',
  './assets/ui/banner_gold.png',
  './assets/ui/banner_emerald.png',
  './assets/ui/banner_earth.png',
  './assets/ui/banner_ruby.png',
  './assets/ui/banner_stone.png',
  './assets/ui/corner_leaf_tl.png',
  './assets/ui/corner_leaf_tr.png',
  './assets/ui/corner_leaf_bl.png',
  './assets/ui/corner_leaf_br.png',
  './assets/ui/frame_wood_orchid.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_ASSETS).catch(err => {
        console.warn('[SW] Precache asset skip:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Stale-While-Revalidate para archivos propios
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
