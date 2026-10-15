// Service de l'appli installable VégéBudget (enregistré par components/app-installable.tsx).
// - Pages : le réseau d'abord ; sans réseau, la dernière version enregistrée (ou la page « Pas de connexion »).
// - Données de l'appli (menus, courses) : le réseau d'abord ; sans réseau, les dernières reçues.
// - Fichiers du site (scripts, polices, images) : gardés sur le téléphone pour démarrer vite.
// Rien n'est gardé après une déconnexion. Changer VERSION efface tout ce qui est enregistré
// (penser alors au nom « donnees-… » utilisé par keepOfflineCopy dans lib/app-context.tsx).
const VERSION = 'v1';
const PAGES = `pages-${VERSION}`, DONNEES = `donnees-${VERSION}`, FICHIERS = `fichiers-${VERSION}`;
const HORS_LIGNE = '/hors-ligne';

self.addEventListener('install', event => {
  event.waitUntil(Promise.all([caches.open(PAGES).then(cache => cache.add(HORS_LIGNE)), caches.open(FICHIERS).then(cache => cache.add('/icons/icone-192.png'))]).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => ![PAGES, DONNEES, FICHIERS].includes(key)).map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});

const oublierTout = () => Promise.all([caches.delete(PAGES), caches.delete(DONNEES)]);

async function limiter(nom, max) {
  const cache = await caches.open(nom), keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - max)).map(key => cache.delete(key)));
}

async function reseauDabord(request, nom, cle) {
  try {
    const response = await fetch(request);
    if (response.ok) { const cache = await caches.open(nom); await cache.put(cle, response.clone()); }
    return response;
  } catch (erreur) {
    const copie = await caches.match(cle, { cacheName: nom });
    if (copie) return copie;
    throw erreur;
  }
}

// Les fichiers de /_next/static ne changent jamais (leur nom change à chaque mise à jour du site) ;
// les images et icônes sont montrées tout de suite puis remises à jour en arrière-plan.
async function fichier(event, immuable) {
  const { request } = event;
  const copie = await caches.match(request, { cacheName: FICHIERS });
  const frais = fetch(request).then(async response => {
    if (response.ok) { const cache = await caches.open(FICHIERS); await cache.put(request, response.clone()); await limiter(FICHIERS, 200); }
    return response;
  });
  if (!copie) return frais;
  if (!immuable) event.waitUntil(frais.catch(() => {}));
  return copie;
}

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Déconnexion : on efface les menus et les pages du compte gardés sur le téléphone.
  if (url.pathname.startsWith('/api/auth/')) { event.waitUntil(oublierTout()); return; }

  if (url.pathname === '/api/app' && url.searchParams.get('action') === 'bootstrap') {
    event.respondWith(reseauDabord(request, DONNEES, '/api/app?action=bootstrap'));
    return;
  }
  if (url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    // Seule l'appli (/app) est gardée ; la clé ignore « ?utm_source=… ».
    const garder = url.pathname === '/app';
    event.respondWith((garder ? reseauDabord(request, PAGES, url.pathname) : fetch(request))
      .catch(async () => (await caches.match(url.pathname, { cacheName: PAGES })) ?? (await caches.match(HORS_LIGNE, { cacheName: PAGES })) ?? Response.error()));
    return;
  }

  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/fonts/')) event.respondWith(fichier(event, true));
  else if (url.pathname.startsWith('/icons/') || url.pathname.startsWith('/images/')) event.respondWith(fichier(event, false));
});
