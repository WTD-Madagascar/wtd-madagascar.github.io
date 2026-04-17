const CACHE_NAME='wtd-madagascar-v1';
const ASSETS=['./','./index.html','./bot.html','./admin.html','./liens.html','./manifest.json','./assets/css/main.css','./assets/js/app.js','./assets/js/wtd-driver.js','./assets/data/services.json','./assets/data/documents.json','./assets/data/transport.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE_NAME).then(cache=>cache.put(e.request,copy));return r;}).catch(()=>caches.match('./index.html'))));});
