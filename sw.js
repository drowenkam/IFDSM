/* Offline-first IFDSM core files. Optional PDFs are cached on successful online viewing. */
const VERSION='ifdsm-navigation-backfix-20261109-v9';
const APP_FILES=['./','./index.html','./notes.html','./reader.html','./assets/styles.css','./assets/app.js','./assets/notes.js','./assets/notes.css','./assets/icon.svg','./assets/icon-192.png','./assets/icon-512.png','./assets/notebook-cover.webp','./data/questions.js','./data/keypoints.js','./data/chapters.js','./manifest.webmanifest'];
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
    if(response.ok && response.type==='basic' && !req.headers.has('range')){
      const clone=response.clone();caches.open(VERSION).then(cache=>cache.put(req,clone)).catch(()=>{});
    }
    return response;
  }).catch(()=>{
    if(url.pathname.toLowerCase().endsWith('.pdf'))return new Response('This PDF is not cached offline. Save it to Files when online.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
    if(req.mode==='navigate')return caches.match(url.pathname.endsWith('/notes.html')?'./notes.html':url.pathname.endsWith('/reader.html')?'./reader.html':'./index.html');
    return new Response('This file is not available offline. Connect to the internet and open it once.',{status:503,statusText:'Offline file unavailable',headers:{'Content-Type':'text/plain; charset=utf-8'}});
  })));
});
