// Service Worker — Korea & Japonsko Trip Planner
const CACHE_NAME = 'asie-trip-v3';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/config.js',
  '/manifest.json',
];

const CDN_ASSETS = [
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',
  'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.11.0/tabler-icons.min.css',
  'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800;900&display=swap',
  'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.css',
  'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.js',
  'https://cdn.jsdelivr.net/npm/exifr@7.1.3/dist/full.umd.js',
  'https://cdn.jsdelivr.net/npm/leaflet.markercluster@1.5.3/dist/MarkerCluster.min.css',
  'https://cdn.jsdelivr.net/npm/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.min.js',
];

// Install — cache static + CDN assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cache local files (must succeed)
      cache.addAll(STATIC_ASSETS).catch(() => {});
      // Cache CDN files (best-effort)
      CDN_ASSETS.forEach((url) => {
        fetch(url).then((res) => { if (res.ok) cache.put(url, res); }).catch(() => {});
      });
    })
  );
  self.skipWaiting();
});

// Activate — delete old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch strategy:
// – Supabase API calls → network only (let app.js handle localStorage fallback)
// – Everything else   → cache first, then network (update cache on success)
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Skip non-GET and Supabase API requests
  if (event.request.method !== 'GET') return;
  if (url.includes('supabase.co/auth') || url.includes('supabase.co/rest')) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          // Fallback to index.html for document requests
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });

      return cached || networkFetch;
    })
  );
});
