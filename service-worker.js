var CACHE_NAME = 'bazno-v1';
var urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    './icon.svg'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(urlsToCache);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(names) {
            return Promise.all(
                names.filter(function(n) { return n !== CACHE_NAME; })
                     .map(function(n) { return caches.delete(n); })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            if (response) return response;
            return fetch(event.request).then(function(res) {
                return caches.open(CACHE_NAME).then(function(cache) {
                    if (event.request.method === 'GET' && res.status === 200) {
                        cache.put(event.request, res.clone());
                    }
                    return res;
                });
            });
        }).catch(function() {
            return caches.match('./index.html');
        })
    );
});