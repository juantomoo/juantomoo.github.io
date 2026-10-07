/* ============================================================
   Astral Math Path — Service Worker v1
   Estrategia: Network First (navegación) + Cache First (estáticos)
   Desarrollado por Juan Tomoo © Todos los derechos reservados
   ============================================================ */

const CACHE_NAME = 'astral-math-path-v1';

// Recursos esenciales a pre-cachear durante la instalación
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/game.css',
  './js/audio/synths.js',
  './js/graphics/colors.js',
  './js/core/leaderboard.js',
  './js/core/curriculum.js',
  './js/core/input.js',
  './js/graphics/particles.js',
  './js/graphics/tunnel.js',
  './js/core/engine.js',
  './js/main.js',
  './assets/logo.png',
  './assets/cover.png',
  './assets/icons/icon-192x192.png',
  './assets/icons/icon-512x512.png'
];

// ——— INSTALL: pre-cachear todos los assets estáticos ———
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Pre-cacheando assets del juego…');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[SW] Instalación completada. Activando…');
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error('[SW] Error en pre-caché:', err);
      })
  );
});

// ——— ACTIVATE: purgar versiones de caché obsoletas ———
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Eliminando caché obsoleta:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Service Worker activo y controlando clientes.');
      return self.clients.claim();
    })
  );
});

// ——— FETCH: estrategia por tipo de recurso ———
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Ignorar peticiones que no sean GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorar requests de otros orígenes (Google Fonts, analytics, etc.)
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    // Para fuentes externas: cache first para evitar bloqueos offline
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          }
          return networkResponse;
        }).catch(() => new Response('', { status: 503 }));
      })
    );
    return;
  }

  // 1. Navegación HTML: Network First con fallback a caché → offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Sin red: servir desde caché
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback absoluto: index.html para jugar offline
          return caches.match('./index.html');
        })
    );
    return;
  }

  // 2. Assets estáticos (CSS, JS, imágenes, fuentes locales): Cache First
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // No está en caché: buscar en red y guardar
      return fetch(request).then((networkResponse) => {
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type === 'error'
        ) {
          return networkResponse;
        }

        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });

        return networkResponse;
      }).catch(() => {
        // Sin red y sin caché para este asset: respuesta vacía
        return new Response('', { status: 503, statusText: 'Offline' });
      });
    })
  );
});
