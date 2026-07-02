/*
 * Service worker de "Mi Jardín de Hábitos".
 * Estrategia:
 *  - Estáticos (JS/CSS/fuentes/imágenes): cache-first.
 *  - Navegación (HTML): network-first con fallback al caché (lectura offline).
 *  - Peticiones a Supabase: nunca se cachean (la escritura requiere conexión).
 */
const CACHE_NAME = "jardin-habitos-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return;
  // No interceptar llamadas a Supabase ni a otros orígenes de API.
  if (url.hostname.endsWith(".supabase.co")) return;

  // Navegación: red primero, caché como respaldo offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match("/"))
            .then((cached) => cached || Response.error())
        )
    );
    return;
  }

  // Estáticos: caché primero, red como respaldo.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && (url.origin === self.location.origin || url.hostname.includes("gstatic"))) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
