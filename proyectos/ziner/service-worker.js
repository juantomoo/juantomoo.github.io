// ZineR Service Worker v1.0.0
const CACHE_NAME = 'ziner-cache-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './js/app.js',
  './js/config.js',
  './js/foldingSchemes.js',
  './js/imageManager.js',
  './js/layoutEngine.js',
  './js/markdownParser.js',
  './js/pagination.js',
  './js/pdfGenerator.js',
  './js/storage.js',
  './manifest.json',
  './favicon.ico',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png'
];

// Recursos externos a cachear
const EXTERNAL_ASSETS = [
  'https://cdnjs.cloudflare.com/ajax/libs/marked/9.1.6/marked.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

// Instalación - cachear recursos estáticos
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cacheando recursos estáticos');
        // Cachear assets locales
        const localPromise = cache.addAll(STATIC_ASSETS).catch(err => {
          console.warn('[SW] Error cacheando algunos recursos locales:', err);
        });
        // Intentar cachear recursos externos (pueden fallar por CORS)
        const externalPromise = Promise.all(
          EXTERNAL_ASSETS.map(url => 
            fetch(url, { mode: 'cors' })
              .then(response => {
                if (response.ok) {
                  return cache.put(url, response);
                }
              })
              .catch(err => console.warn('[SW] No se pudo cachear:', url))
          )
        );
        return Promise.all([localPromise, externalPromise]);
      })
      .then(() => {
        console.log('[SW] Instalación completada');
        return self.skipWaiting();
      })
  );
});

// Activación - limpiar caches antiguos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando Service Worker...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => {
              console.log('[SW] Eliminando cache antiguo:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Activación completada');
        return self.clients.claim();
      })
  );
});

// Fetch - estrategia Network First con fallback a cache
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // Solo manejar GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Para Google Fonts, usar estrategia Cache First
  if (request.url.includes('fonts.googleapis.com') || request.url.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(request)
        .then(cached => {
          if (cached) {
            return cached;
          }
          return fetch(request)
            .then(response => {
              if (response.ok) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(request, responseClone);
                });
              }
              return response;
            });
        })
    );
    return;
  }
  
  // Para recursos locales y CDN, usar Network First con cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Si la respuesta es válida, cachearla
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, buscar en cache
        return caches.match(request)
          .then((cached) => {
            if (cached) {
              return cached;
            }
            // Si es una navegación, devolver index.html del cache
            if (request.mode === 'navigate') {
              return caches.match('./index.html');
            }
            // Si no hay nada en cache, devolver respuesta de error
            return new Response('Recurso no disponible offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Mensaje para actualización manual del cache
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      console.log('[SW] Cache limpiado manualmente');
    });
  }
});
