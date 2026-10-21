import type { Info } from '@/lib/instagram-infos';

export default {
  slug: 'diners-en-15-minutes',
  title: 'Pas le temps ce soir ? 3 dîners prêts en 20 minutes',
  pill: 'Rapide',
  image: '/images/recettes/tartines-haricots.jpg',
  slides: [
    { recette: 'poelee-blanche', text: 'Haricots blancs, tomate, ail : 15 minutes montre en main.' },
    { recette: 'tartines-haricots', text: 'Le dîner tartine, chaud et complet, en 15 minutes.' },
    { recette: 'epinards-pois-chiches', text: 'Épinards surgelés et pois chiches : une poêlée en 20 minutes.' },
    { title: 'Pour aller encore plus vite', points: ['Des conserves déjà cuites', 'Des légumes surgelés déjà coupés', 'Une seule poêle à laver'] },
  ],
  hook: 'Rentré tard et pas le courage ? 3 dîners sans viande prêts en 15 à 20 minutes, avec les ingrédients pour 2. Enregistrez-le pour ce soir 📌',
  hashtags: ['#recetterapide', '#dînerrapide', '#végétarien', '#recettefacile', '#petitbudget'],
  sources: [['Prix relevés sur carrefour.fr le 7/10/2026', 'https://www.carrefour.fr']],
} satisfies Info;
