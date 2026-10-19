/* Shell cache only: the page that opens the program, the manifest and the icons.
   The program itself (app.enc) and version.json are handled by index.html (kept in the phone's own storage). */
var V = 'hesab-shell-1';
var SHELL = ['index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];
function abs(p) { return new URL(p, self.registration.scope).href; }
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(V).then(function (c) { return Promise.all(SHELL.map(function (p) { return c.add(new Request(abs(p), { cache: 'reload' })).catch(function () { }); })); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request; if (r.method !== 'GET') return;
  var u = new URL(r.url); if (u.origin !== location.origin) return;
  var key = r.mode === 'navigate' ? abs('index.html') : u.origin + u.pathname;
  var isShell = r.mode === 'navigate' || SHELL.some(function (p) { return abs(p) === key; });
  if (!isShell) return;
  e.respondWith(
    fetch(r.mode === 'navigate' ? abs('index.html') : r, { cache: 'no-cache' }).then(function (res) {
      if (res && res.ok) { var c = res.clone(); caches.open(V).then(function (ca) { ca.put(key, c); }); }
      return res;
    }).catch(function () { return caches.match(key).then(function (m) { return m || caches.match(abs('index.html')); }); })
  );
});
