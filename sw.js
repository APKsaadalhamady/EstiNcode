const CACHE_NAME = 'estincode-v2';

self.addEventListener('install', (e) => {
    // إجبار التطبيق على التحديث فوراً عند وجود نسخة جديدة
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    // مسح الذاكرة القديمة بالكامل
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    // استراتيجية: جلب التحديثات من الإنترنت أولاً، وإذا انقطع الإنترنت استخدم الذاكرة
    e.respondWith(
        fetch(e.request)
            .then((response) => {
                // تحديث الذاكرة بالنسخة الجديدة
                const resClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(e.request, resClone);
                });
                return response;
            })
            .catch(() => {
                // في حال عدم وجود إنترنت، استخدم النسخة المحفوظة
                return caches.match(e.request);
            })
    );
});
