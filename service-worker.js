// ============================================================
// iLedgerV2 - Service Worker (PWA)
// Version: 2.0.0
// ============================================================

const CACHE_NAME = 'iledgerv2-v2.0.0';
const STATIC_CACHE = 'iledgerv2-static-v2';
const DYNAMIC_CACHE = 'iledgerv2-dynamic-v2';

// Resources to cache on install
const STATIC_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'
];

// Offline fallback page HTML
const OFFLINE_HTML = `
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>iLedgerV2 – Offline</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Plus Jakarta Sans',sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0D47A1,#1565C0);color:white;padding:20px;text-align:center}
.container{max-width:380px}
.icon{font-size:72px;margin-bottom:20px;animation:pulse 2s ease-in-out infinite}
@keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.05);opacity:.8}}
h1{font-size:26px;font-weight:800;margin-bottom:10px;letter-spacing:-.5px}
p{font-size:14px;opacity:.8;line-height:1.6;margin-bottom:24px}
.btn{padding:12px 28px;background:rgba(255,255,255,.15);color:white;border:1.5px solid rgba(255,255,255,.3);border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s;display:inline-block;text-decoration:none;backdrop-filter:blur(4px)}
.btn:hover{background:rgba(255,255,255,.25)}
.logo{font-size:18px;font-weight:800;opacity:.6;margin-bottom:32px}
.cached-info{margin-top:20px;font-size:12px;opacity:.6;background:rgba(255,255,255,.08);border-radius:8px;padding:10px 16px}
</style>
</head>
<body>
<div class="container">
  <div class="logo">iLedgerV2</div>
  <div class="icon">📡</div>
  <h1>Tidak Ada Koneksi</h1>
  <p>Anda sedang offline. Beberapa fitur mungkin tidak tersedia. Data yang sudah di-cache masih dapat diakses.</p>
  <button class="btn" onclick="window.location.reload()">🔄 Coba Lagi</button>
  <div class="cached-info">💾 Data lokal tersedia untuk referensi</div>
</div>
</body>
</html>`;

// ============================================================
// INSTALL EVENT
// ============================================================
self.addEventListener('install', event => {
  console.log('[SW] Installing iLedgerV2 Service Worker...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS).catch(err => {
          console.warn('[SW] Some assets failed to cache:', err);
        });
      }),
      
      // Cache offline page
      caches.open(CACHE_NAME).then(cache => {
        return cache.put('/offline', new Response(OFFLINE_HTML, {
          headers: { 'Content-Type': 'text/html' }
        }));
      })
    ]).then(() => {
      console.log('[SW] Installation complete');
      return self.skipWaiting();
    })
  );
});

// ============================================================
// ACTIVATE EVENT
// ============================================================
self.addEventListener('activate', event => {
  console.log('[SW] Activating iLedgerV2 Service Worker...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME && name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[SW] Activation complete');
      return self.clients.claim();
    })
  );
});

// ============================================================
// FETCH EVENT
// ============================================================
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip Chrome extensions
  if (url.protocol === 'chrome-extension:') return;
  
  // API calls (POST to Apps Script) – don't cache
  if (request.method === 'POST') return;
  
  // Google Apps Script calls
  if (url.hostname.includes('script.google.com') || url.hostname.includes('script.googleusercontent.com')) {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/offline') || new Response(OFFLINE_HTML, {
          headers: { 'Content-Type': 'text/html' }
        });
      })
    );
    return;
  }
  
  // Static assets (fonts, CDN) – Cache First
  if (
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('cdnjs.cloudflare.com')
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // Google Drive images – Network First
  if (url.hostname.includes('drive.google.com') || url.hostname.includes('lh3.googleusercontent.com')) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // Default – Network First with offline fallback
  event.respondWith(networkFirst(request));
});

// ============================================================
// CACHE STRATEGIES
// ============================================================

// Cache First: serve from cache, fetch if not cached
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    console.warn('[SW] Cache first failed:', err);
    return new Response('Resource not available offline', { status: 503 });
  }
}

// Network First: try network, fall back to cache
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    
    if (response.ok && request.url.includes('page=')) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (err) {
    console.warn('[SW] Network failed, trying cache:', request.url);
    
    const cached = await caches.match(request);
    if (cached) return cached;
    
    // Return offline page for navigation requests
    if (request.headers.get('accept')?.includes('text/html')) {
      const offlinePage = await caches.match('/offline');
      if (offlinePage) return offlinePage;
      return new Response(OFFLINE_HTML, {
        headers: { 'Content-Type': 'text/html' },
        status: 503
      });
    }
    
    return new Response(JSON.stringify({ success: false, error: 'Offline', code: 'OFFLINE' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 503
    });
  }
}

// ============================================================
// BACKGROUND SYNC (for future offline data submission)
// ============================================================
self.addEventListener('sync', event => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-pending-transactions') {
    event.waitUntil(syncPendingTransactions());
  }
});

async function syncPendingTransactions() {
  // Implementation for offline-first data sync
  // Would read from IndexedDB and submit when online
  console.log('[SW] Syncing pending transactions...');
}

// ============================================================
// PUSH NOTIFICATIONS
// ============================================================
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'Ada notifikasi baru dari iLedgerV2',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: 'Buka Aplikasi' },
      { action: 'dismiss', title: 'Tutup' }
    ],
    requireInteraction: data.urgent || false
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'iLedgerV2', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'dismiss') return;
  
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// ============================================================
// MESSAGE HANDLING
// ============================================================
self.addEventListener('message', event => {
  const { action } = event.data || {};
  
  if (action === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (action === 'CLEAR_CACHE') {
    caches.keys().then(names => Promise.all(names.map(name => caches.delete(name))))
      .then(() => event.ports[0]?.postMessage({ success: true }));
  }
  
  if (action === 'CACHE_STATUS') {
    caches.keys().then(names => {
      event.ports[0]?.postMessage({ caches: names });
    });
  }
});

console.log('[SW] iLedgerV2 Service Worker loaded successfully');
