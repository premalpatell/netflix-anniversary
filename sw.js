/* Service worker: instant reloads and offline viewing.
   - App shell (HTML, CSS, JS, fonts, icons): network first, cache fallback, so updates always arrive.
   - Photos and posters: cache first, filled as they are viewed.
   - Videos and audio stream from the network (range requests are not cached). */
const VERSION = 'sp-v5';
const SHELL = `${VERSION}-shell`;
const MEDIA = `${VERSION}-media`;
const SHELL_FILES = [
  './', 'index.html', 'css/app.css', 'fonts/fonts.css', 'js/data.js', 'js/media.js', 'js/blur.js', 'js/app.js',
  'manifest.webmanifest', 'icons/icon-192.png', 'icons/favicon-32.png', 'images/avatar-premal.svg', 'images/netflix-n.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => !k.startsWith(VERSION)).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  const path = url.pathname;
  if (/\.(mp4|mp3|m4a)$/i.test(path) || req.headers.has('range')) return;   // stream from network

  if (/\/(images|videos\/p|fonts|icons)\//.test(path)) {
    e.respondWith(caches.open(MEDIA).then(async c => {
      const hit = await c.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok) c.put(req, res.clone());
      return res;
    }));
    return;
  }

  e.respondWith(fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(SHELL).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req).then(r => r || caches.match('index.html'))));
});
