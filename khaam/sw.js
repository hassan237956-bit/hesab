/* the blank program, installable and usable offline: the page and its icons are kept; a newer page replaces it when there is internet */
var V = 'khaam-44.6';
var SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];
function abs(p) { return new URL(p, self.registration.scope).href; }
self.addEventListener('install', function (e) { e.waitUntil(caches.open(V).then(function (c) { return Promise.all(SHELL.map(function (p) { return c.add(new Request(abs(p), { cache: 'reload' })).catch(function () { }); })); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k.indexOf('khaam-') === 0 && k !== V; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener('fetch', function (e) {
  var r = e.request; if (r.method !== 'GET') return;
  var u = new URL(r.url); if (u.origin !== location.origin || u.pathname.indexOf(new URL(self.registration.scope).pathname) !== 0) return;
  var key = r.mode === 'navigate' ? abs('index.html') : u.origin + u.pathname;
  e.respondWith(fetch(r.mode === 'navigate' ? abs('index.html') : r, { cache: 'no-cache' }).then(function (res) {
    if (res && res.ok) { var c = res.clone(); caches.open(V).then(function (ca) { ca.put(key, c); }); }
    return res;
  }).catch(function () { return caches.match(key).then(function (m) { return m || caches.match(abs('index.html')); }); }));
});
