const CACHE_NAME = 'say-kho-cho-v1';

// Danh sách file cần cache khi cài
const FILES_TO_CACHE = [
  './',
  './say-kho-cho.html'
];

// Cài đặt: cache ngay lập tức
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Kích hoạt: xóa cache cũ
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: trả cache trước, không cần mạng
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(e.request).then(cached => {
        if (cached) {
          // Có cache -> trả ngay, update ngầm nếu online
          fetch(e.request)
            .then(resp => {
              if (resp && resp.ok) cache.put(e.request, resp.clone());
            })
            .catch(() => {});
          return cached;
        }

        // Chưa cache -> fetch và lưu lại
        return fetch(e.request)
          .then(resp => {
            if (resp && resp.ok) cache.put(e.request, resp.clone());
            return resp;
          })
          .catch(() => new Response('Offline - Vui lòng mở app khi có mạng lần đầu.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          }));
      })
    )
  );
});
