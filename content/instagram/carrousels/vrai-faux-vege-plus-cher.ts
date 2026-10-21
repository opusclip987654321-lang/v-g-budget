import type { Info } from '@/lib/instagram-infos';

export default {
  slug: 'vrai-faux-vege-plus-cher',
  title: 'Manger sans viande, c’est plus cher ? Vrai ou faux',
  pill: 'Vrai ou faux',
  slides: [
    { quiz: 'Manger sans viande coûte plus cher.', choix: ['Vrai', 'Faux'] },
    { grand: 'Faux, pour l’essentiel.', text: 'Haricots, pois chiches et lentilles font partie des protéines les moins chères du magasin.' },
    { classement: 'Le prix au kilo', items: ['green-lentils', 'red-lentils', 'kidney', 'chickpeas'], note: 'Lentilles pesées sèches, haricots et pois chiches pesés cuits, égouttés.' },
    { title: 'Où ça peut coûter plus', text: 'Les produits tout prêts : steaks végétaux, plats cuisinés, laits végétaux de marque. Cuisiner les légumineuses soi-même reste le plus économique.' },
  ],
  hook: 'Vrai ou faux : manger sans viande coûte plus cher ? Votre avis en commentaire, puis glissez pour la réponse avec les prix au kilo 👇',
  hashtags: ['#vraioufaux', '#végétarien', '#petitbudget', '#légumineuses', '#flexitarien'],
  sources: [['Prix relevés sur carrefour.fr le 7/10/2026', 'https://www.carrefour.fr']],
} satisfies Info;
