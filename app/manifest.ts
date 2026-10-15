import type { MetadataRoute } from 'next';

// Fiche de l'appli installable : le téléphone s'en sert pour l'icône, le nom et l'écran de démarrage.
// L'appli ouvre directement les menus ; « utm_source=appli » compte ces ouvertures à part dans les statistiques.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/app',
    name: 'VégéBudget',
    short_name: 'VégéBudget',
    description: 'Vos dîners sans viande de la semaine, avec la liste de courses et le budget.',
    lang: 'fr',
    start_url: '/app?utm_source=appli',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f6f8f6',
    theme_color: '#174c38',
    categories: ['food', 'lifestyle'],
    icons: [
      { src: '/icons/icone-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icone-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icone-masquable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Mes courses', url: '/app?utm_source=appli#courses', icons: [{ src: '/icons/icone-192.png', sizes: '192x192' }] },
      { name: 'Mes menus', url: '/app?utm_source=appli#menus', icons: [{ src: '/icons/icone-192.png', sizes: '192x192' }] },
    ],
  };
}
