/* Volume I HTML first: network-first while online; offline fallback to pre-cached actual pages. */
const VERSION='ifdsm-static-reading-v13-20261109';
const APP_FILES=["./", "./index.html", "./notes.html", "./volume1.html", "./reader.html", "./sw.js", "./manifest.webmanifest", "./assets/app.js", "./assets/styles.css", "./assets/notebook-cover.webp", "./assets/icon.svg", "./assets/icon-192.png", "./assets/icon-512.png", "./data/questions.js", "./data/keypoints.js", "./book/book.css", "./book/chapter-01.html", "./book/chapter-02.html", "./book/chapter-03.html", "./book/chapter-04.html", "./book/chapter-05.html", "./book/chapter-06.html", "./book/chapter-07.html", "./book/chapter-08.html", "./book/chapter-09.html", "./book/chapter-10.html", "./book/index.html", "./book/reference-mock.html", "./book/reference-numbers.html", "./book/reference-sources.html"];
const FIGURES=["./assets/figures/figure-623.webp", "./assets/figures/figure-624.webp", "./assets/figures/figure-625.webp", "./assets/figures/figure-627.webp", "./assets/figures/figure-629.webp", "./assets/figures/figure-631.webp", "./assets/figures/figure-633.webp", "./assets/figures/figure-634.webp", "./assets/figures/figure-635.webp", "./assets/figures/figure-636.webp", "./assets/figures/figure-638.webp", "./assets/figures/figure-640.webp", "./assets/figures/figure-641.webp", "./assets/figures/figure-643.webp", "./assets/figures/figure-644.webp", "./assets/figures/figure-645.webp", "./assets/figures/figure-646.webp", "./assets/figures/figure-647.webp", "./assets/figures/figure-648.webp", "./assets/figures/figure-650.webp", "./assets/figures/figure-651.webp", "./assets/figures/figure-653.webp", "./assets/figures/figure-654.webp", "./assets/figures/figure-656.webp", "./assets/figures/figure-657.webp", "./assets/figures/figure-658.webp", "./assets/figures/figure-659.webp", "./assets/figures/figure-660.webp", "./assets/figures/figure-662.webp", "./assets/figures/figure-664.webp", "./assets/figures/figure-665.webp", "./assets/figures/figure-667.webp", "./assets/figures/figure-669.webp", "./assets/figures/figure-671.webp", "./assets/figures/figure-673.webp", "./assets/figures/figure-675.webp", "./assets/figures/figure-676.webp", "./assets/figures/figure-677.webp"];
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
  const fresh=req.mode==='navigate' || /\.(html|js|css)$/.test(url.pathname);
  const remember=response=>{
    if(response && response.ok && response.type==='basic' && !req.headers.has('range')){
      const copy=response.clone();caches.open(VERSION).then(cache=>cache.put(req,copy)).catch(()=>{});
    }
    return response;
  };
  const offline=()=>caches.match(req).then(hit=>{
    if(hit)return hit;
    if(req.mode==='navigate')return caches.match('./book/index.html');
    return new Response('This resource was not cached. Open the website online once.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
  });
  event.respondWith(fresh?fetch(req).then(remember).catch(offline):caches.match(req).then(hit=>hit||fetch(req).then(remember).catch(offline)));
});
