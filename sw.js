/* ==========================================================================
   TABBI: Tipp-ArbeitsBlätter-Bibliothek – Offline Service Worker (sw.js)
   ========================================================================== */

const CACHE_NAME = 'tabbi-offline-v5';

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/tabbi.css',
  './js/tabbi-core.js',
  './js/blaetter-katalog.js',
  './assets/icon.svg',
  './assets/schulheft-hintergrund.svg',
  './blaetter/001_zahlenhaeuser_und_freunde.html',
  './blaetter/001b_zahlenfreunde.html',
  './blaetter/002_zahlen_bis_5_finger_tuerme_wuerfel.html',
  './blaetter/003_punktebilder_und_fische.html',
  './blaetter/004_zaehlen_mit_strichlisten.html',
  './blaetter/005_zaehlen_einkreisen_buendeln.html',
  './blaetter/006_gleiche_mengen_anmalen.html',
  './blaetter/007_zahlen_bis_20_zehner_und_einer.html',
  './blaetter/008_nachbarzahlen_und_zahlenstrahl_20.html',
  './blaetter/009_zwergen_und_riesenaufgaben.html',
  './blaetter/010_zehneruebergang_und_zahlenmauern_20.html',
  './blaetter/011_click_und_mix.html',
  './assets/haende/hand_L_0.svg',
  './assets/haende/hand_L_1.svg',
  './assets/haende/hand_L_2.svg',
  './assets/haende/hand_L_3.svg',
  './assets/haende/hand_L_4.svg',
  './assets/haende/hand_L_5.svg',
  './assets/haende/hand_R_0.svg',
  './assets/haende/hand_R_1.svg',
  './assets/haende/hand_R_2.svg',
  './assets/haende/hand_R_3.svg',
  './assets/haende/hand_R_4.svg',
  './assets/haende/hand_R_5.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
