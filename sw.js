const CACHE_NAME = 'nexus-pwa-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  // Ícones (você deve adicionar esses arquivos na pasta se existirem)
  // './icon-192.png', 
  // './icon-512.png',
  // Recursos Externos Essenciais (CDNs identificados no HTML)
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest',
  'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;700;900&family=Noto+Serif:ital,wght@0,400;0,700;1,400&family=Cinzel:wght@400;700;900&family=Montserrat:wght@300;400;700;900&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Libre+Baskerville:wght@400;700&family=Lora:ital,wght@0,400;0,700;1,400&family=Raleway:wght@300;400;700;900&family=Open+Sans:wght@300;400;700&family=Merriweather:wght@300;400;700&family=Arvo:wght@400;700&family=Bebas+Neue&family=Oswald:wght@300;400;700&family=Quicksand:wght@300;400;700&family=Cormorant+Garamond:wght@400;600;700&family=Spectral:wght@400;700&family=Roboto:wght@300;400;700&family=Ubuntu:wght@300;400;700&family=Bitter:wght@400;700&family=Crimson+Text:wght@400;600;700&display=swap'
];

// Instalação: Cache dos recursos iniciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching all assets');
        return cache.addAll(ASSETS);
      })
  );
  self.skipWaiting();
});

// Ativação: Limpeza de caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

// Fetch: Estratégia Cache First, falling back to Network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Se estiver no cache, retorna
        if (response) {
          return response;
        }
        // Se não, busca na rede
        return fetch(event.request).then(
          (response) => {
            // Verifica se a resposta é válida
            if(!response || response.status !== 200 || (response.type !== 'basic' && response.type !== 'cors')) {
              return response;
            }

            // Clona a resposta para salvar no cache
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                // Cache dinâmico para novos recursos acessados
                // Verificação extra para evitar erros com POST ou schemes não suportados
                if (event.request.method === 'GET' && event.request.url.startsWith('http')) {
                    cache.put(event.request, responseToCache);
                }
              });

            return response;
          }
        );
      })
  );
});
