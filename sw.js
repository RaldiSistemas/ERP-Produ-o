// Service worker — Raldi Produção
// Estratégia: rede primeiro, cache como rede de segurança offline.
// O chão de fábrica precisa do dado mais novo; o cache só existe para o
// caso de o Wi-Fi cair no meio do galpão.
const CACHE = 'producao-v6';
const ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) =>
    Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('message', (e) => {
  if (e.data && e.data.tipo === 'ativar') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req).then((res) => {
      const clone = res.clone();
      caches.open(CACHE).then((c) => c.put(req, clone));
      return res;
    }).catch(() => caches.match(req))
  );
});
