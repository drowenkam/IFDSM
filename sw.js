/* Offline-first static assets. No server requests for user answers or progress. */
const VERSION='ifdsm-1000-v2-notebook';
const APP_FILES=['./','./index.html','./assets/styles.css','./assets/app.js','./assets/icon.svg','./assets/icon-192.png','./assets/icon-512.png','./assets/notebook-cover.webp','./data/questions.js','./manifest.webmanifest'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(APP_FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('ifdsm-')&&k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return;
  event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(response=>{
    if(response.ok&&response.type==='basic'){
      const clone=response.clone();caches.open(VERSION).then(cache=>cache.put(req,clone)).catch(()=>{});
    }
    return response;
  }).catch(()=>caches.match('./index.html'))));
});
