// sw.js — GINYARAIDEE Service Worker
// กลยุทธ์:
// - หน้าเว็บ (HTML): network-first — ออนไลน์ได้หน้าใหม่เสมอ กันปัญหา
//   แคชหน้าเก่าที่ชี้ไปไฟล์ JS ของ deploy เก่าที่ถูกลบแล้ว (จอขาว/จอมืด)
// - ไฟล์ static อื่นๆ: cache-first (เร็ว + ใช้ออฟไลน์ได้)
// - /api/ และ version.json: ไม่แตะ ให้วิ่งตรงเสมอ
const CACHE = 'ginyaraidee-v7';
const PRECACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // API และ version.json — สดเสมอ ไม่ผ่านแคช
  if (url.pathname.startsWith('/api/') || url.pathname === '/version.json') {
    return;
  }

  // หน้าเว็บ (navigation) — network-first, ตกออฟไลน์ค่อยใช้แคช
  if (request.mode === 'navigate' || url.pathname === '/' || url.pathname === '/index.html') {
    e.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(request, clone));
          }
          return res;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match('/'))
        )
    );
    return;
  }

  // static อื่นๆ — cache-first
  e.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(request, clone));
        }
        return res;
      });
    })
  );
});
