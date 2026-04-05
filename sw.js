/* MAKARIO — Service Worker v2.0 */
const CACHE_NAME = 'makario-v2';
const STATIC_ASSETS = ['/','/index.html','/style.css','/app.js','/manifest.json','/icon-192.svg','/icon-512.svg'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api')) {
    event.respondWith(fetch(event.request).catch(() => new Response(JSON.stringify({success:false,error:'Hors ligne'}),{headers:{'Content-Type':'application/json'}})));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => {
    if (cached) return cached;
    return fetch(event.request).then(res => {
      if (res.ok) { const clone = res.clone(); caches.open(CACHE_NAME).then(c => c.put(event.request, clone)); }
      return res;
    }).catch(() => event.request.mode === 'navigate' ? caches.match('/index.html') : new Response('',{status:408}));
  }));
});
