/* Offline-first IFDSM core files. Optional PDFs are cached on successful online viewing. */
const VERSION='ifdsm-full-visible-v12-20261109';
const APP_FILES=['./','./index.html','./notes.html','./volume1.html','./reader.html','./assets/styles.css','./assets/app.js','./assets/notes.js','./assets/notes-v12.js','./assets/notes.css','./assets/notes-v12.css','./assets/icon.svg','./assets/icon-192.png','./assets/icon-512.png','./assets/notebook-cover.webp','./data/questions.js','./data/keypoints.js','./data/chapters.js','./data/full_notes.js','./data/full_notes-v12.js','./manifest.webmanifest'];
const FIGURES=['./assets/figures/figure-623.webp', './assets/figures/figure-624.webp', './assets/figures/figure-625.webp', './assets/figures/figure-627.webp', './assets/figures/figure-629.webp', './assets/figures/figure-631.webp', './assets/figures/figure-633.webp', './assets/figures/figure-634.webp', './assets/figures/figure-635.webp', './assets/figures/figure-636.webp', './assets/figures/figure-638.webp', './assets/figures/figure-640.webp', './assets/figures/figure-641.webp', './assets/figures/figure-643.webp', './assets/figures/figure-644.webp', './assets/figures/figure-645.webp', './assets/figures/figure-646.webp', './assets/figures/figure-647.webp', './assets/figures/figure-648.webp', './assets/figures/figure-650.webp', './assets/figures/figure-651.webp', './assets/figures/figure-653.webp', './assets/figures/figure-654.webp', './assets/figures/figure-656.webp', './assets/figures/figure-657.webp', './assets/figures/figure-658.webp', './assets/figures/figure-659.webp', './assets/figures/figure-660.webp', './assets/figures/figure-662.webp', './assets/figures/figure-664.webp', './assets/figures/figure-665.webp', './assets/figures/figure-667.webp', './assets/figures/figure-669.webp', './assets/figures/figure-671.webp', './assets/figures/figure-673.webp', './assets/figures/figure-675.webp', './assets/figures/figure-676.webp', './assets/figures/figure-677.webp'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(APP_FILES.concat(FIGURES))).then(()=>self.skipWaiting()));
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
    if(req.mode==='navigate')return caches.match((url.pathname.endsWith('/notes.html')||url.pathname.endsWith('/volume1.html'))?'./volume1.html':url.pathname.endsWith('/reader.html')?'./reader.html':'./index.html');
    return new Response('This file is not available offline. Connect to the internet and open it once.',{status:503,statusText:'Offline file unavailable',headers:{'Content-Type':'text/plain; charset=utf-8'}});
  })));
});
