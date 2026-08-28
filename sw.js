// Service Worker — Korea & Japonsko Trip Planner
const CACHE_NAME = 'asie-trip-v19';

// Samostatná přihrádka na stažené dokumenty. Schválně NEobsahuje číslo verze
// a úklid při aktualizaci ji vynechává — jinak by každá úprava aplikace
// smazala vstupenky připravené na cestu.
const DOCS_CACHE = 'asie-docs';

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

// Activate — delete old caches (přihrádku s dokumenty necháváme být)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys
        .filter((k) => k !== CACHE_NAME && k !== DOCS_CACHE)
        .map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Otevření dokumentu z místní zásoby.
// Aplikace neskáče přímo na Supabase (to je cizí web, kam service worker nevidí),
// ale na tuhle adresu uvnitř aplikace. Tady soubor vytáhneme z přihrádky
// a vrátíme ho, jako by přišel ze sítě — prohlížeč pak PDF zobrazí normálně.
async function serveDoc(target) {
  const chyba = (nadpis, text) => new Response(
    `<!doctype html><html lang="cs"><head><meta charset="utf-8">
     <meta name="viewport" content="width=device-width,initial-scale=1">
     <title>${nadpis}</title><style>
       body{margin:0;min-height:100dvh;display:flex;align-items:center;justify-content:center;
            background:#faf6ee;color:#3e3830;font-family:ui-sans-serif,system-ui,sans-serif;padding:24px}
       div{max-width:22rem;text-align:center}
       h1{font-size:1.1rem;margin:0 0 .6rem}p{margin:0;font-size:.9rem;color:#857c70;line-height:1.6}
     </style></head><body><div><h1>${nadpis}</h1><p>${text}</p></div></body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });

  if (!target) return chyba('Chybí odkaz', 'Adresa dokumentu se nepodařilo přečíst.');

  const cache = await caches.open(DOCS_CACHE);
  const ulozeny = await cache.match(target);
  if (ulozeny) return ulozeny;

  try {
    const res = await fetch(target);
    if (!res.ok) throw new Error(res.status);
    cache.put(target, res.clone()).catch(() => {});
    return res;
  } catch {
    return chyba('Dokument není po ruce',
      'Nejsi připojená a tenhle dokument zatím není stažený do telefonu. ' +
      'Až budeš online, otevři Kalendář → Dokumenty a klepni na „Připravit do mobilu“.');
  }
}

// Fetch strategy:
// – Supabase API calls → network only (let app.js handle localStorage fallback)
// – Everything else   → cache first, then network (update cache on success)
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Skip non-GET and Supabase API requests
  if (event.request.method !== 'GET') return;
  if (url.includes('supabase.co/auth') || url.includes('supabase.co/rest')) return;

  // Otevření dokumentu z místní zásoby (viz serveDoc výše)
  const adresa = new URL(url);
  if (adresa.pathname.endsWith('/dokument')) {
    event.respondWith(serveDoc(adresa.searchParams.get('u')));
    return;
  }

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
