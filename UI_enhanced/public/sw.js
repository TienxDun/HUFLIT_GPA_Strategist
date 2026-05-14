const CACHE_NAME = "huflit-gpa-cache-v1";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./icon.svg",
  "./ava.jpg",
  "./manifest.webmanifest",
];

// Install event - caching assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service Worker: Caching Assets");
      // Use Promise.allSettled or a simple map to avoid failing everything if one asset is missing
      return Promise.all(
        ASSETS_TO_CACHE.map((url) => {
          return cache.add(url).catch((err) => {
            console.error(`Service Worker: Failed to cache ${url}:`, err);
          });
        })
      );
    })
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Service Worker: Clearing Old Cache");
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If successful response, clone and cache it
        if (response && response.status === 200 && response.type === "basic") {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails, try to get from cache
        return caches.match(event.request).then((response) => {
          if (response) return response;
          
          // If it's a navigation request (page), return index.html
          if (event.request.mode === "navigate") {
            return caches.match("./index.html") || caches.match("./");
          }
        });
      })
  );
});
