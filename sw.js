const CACHE_NAME = 'mapa-longchamps-extremo-v2';
const assets = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/transporte.js',
  '/clima.js',
  '/datos.js',
  '/icono.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// Instalar y guardar todo en el caché
self.addEventListener('install', event => {
  self.skipWaiting(); // Fuerza a que se actualice enseguida si hay una versión nueva
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Archivos guardados en caché offline');
      return cache.addAll(assets);
    })
  );
});

// Limpiar cachés viejos si actualizás la app
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))
      );
    })
  );
});

// Interceptar peticiones para que funcione sin internet
self.addEventListener('fetch', event => {
  // Ignorar peticiones que no son GET o que van a la API de clima (el clima siempre necesita internet)
  if (event.request.method !== 'GET' || event.request.url.includes('open-meteo')) return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Devuelve lo que está en memoria (rápido) o lo busca en internet
      return cachedResponse || fetch(event.request).then(networkResponse => {
        // Guarda los mapas del mapa que vas recorriendo
        return caches.open(CACHE_NAME).then(cache => {
          if (event.request.url.includes('basemaps.cartocdn.com')) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
      });
    }).catch(() => {
        // Si no hay internet y falla, no hace nada y deja que se muestre lo que ya hay
    })
  );
});