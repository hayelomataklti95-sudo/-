// Service worker: የአፑን ፋይሎች በስልክ ያስቀምጣል፤ ኢንተርኔት ባይኖርም ገጹ ይከፈታል።
// ዳታ (Firebase) አይቀመጥም፤ ሁልጊዜ ከኢንተርኔት ይመጣል።
const CACHE = "hibret-v8";
const FILES = ["./", "index.html", "manifest.json", "icon-192.png", "icon-512.png", "icon-maskable-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  const url = new URL(req.url);
  // የእኛን ፋይሎች ብቻ እንይዛለን (Firebase እና Google አይነኩም)
  if (req.method !== "GET" || url.origin !== self.location.origin) return;
  // መጀመሪያ ኢንተርኔት፣ ካልተገኘ ከተቀመጠው
  e.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req).then(r => r || caches.match("index.html")))
  );
});
