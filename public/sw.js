const CACHE_NAME = "clipper-v1"

self.addEventListener("install", () => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener("fetch", (event) => {
  const { request } = event

  if (request.method !== "GET") return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
        return response
      })
      .catch(() =>
        caches.match(request).then((cached) => {
          if (cached) return cached
          return caches
            .match("/")
            .then((fallback) => fallback || new Response("Offline", { status: 503 }))
        })
      )
  )
})
