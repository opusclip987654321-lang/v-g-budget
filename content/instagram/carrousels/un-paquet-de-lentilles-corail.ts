import type { Info } from '@/lib/instagram-infos';

export default {
  slug: 'un-paquet-de-lentilles-corail',
  title: '1 paquet de lentilles corail, 3 dîners pour 2',
  pill: '1 ingrédient',
  image: '/images/recettes/courge-lentilles.jpg',
  slides: [
    { ticket: 'Ce qu’on achète', items: ['red-lentils'] },
    { recette: 'curry-corail', text: 'Le classique : doux, crémeux, 25 minutes.' },
    { recette: 'bolognaise-lentilles', text: 'Les lentilles corail remplacent la viande hachée.' },
    { recette: 'courge-lentilles', text: 'Un velouté épais de saison, qui tient au corps.' },
    { title: 'Pourquoi les lentilles corail', points: ['Pas de trempage', 'Cuites en 15 minutes', 'Elles épaississent sauces et soupes'] },
  ],
  hook: 'Un seul paquet de lentilles corail, 3 dîners pour 2 : curry, bolognaise et velouté, avec le prix de chaque part. Enregistrez-le 📌',
  hashtags: ['#lentillescorail', '#recettepascher', '#végétarien', '#petitbudget', '#idéesrepas'],
  sources: [['Prix relevés sur carrefour.fr le 7/10/2026', 'https://www.carrefour.fr']],
} satisfies Info;
