import type { Info } from '@/lib/instagram-infos';

export default {
  slug: 'semaine-5-diners-pour-2',
  title: 'Ma semaine de dîners pour 2, du lundi au vendredi',
  pill: 'Budget',
  image: '/images/recettes/bolognaise-lentilles.jpg',
  slides: [
    { semaine: 'Le menu et le total', recettes: ['riz-saute', 'bolognaise-lentilles', 'pates-brocoli', 'poelee-chou', 'semoule-pois'] },
    { recette: 'riz-saute', text: 'Le plus économique de la semaine, prêt en 25 minutes.' },
    { recette: 'bolognaise-lentilles', text: 'Une vraie bolognaise, avec des lentilles corail à la place de la viande.' },
    { recette: 'pates-brocoli', text: 'Du brocoli surgelé, du citron, et c’est prêt en 20 minutes.' },
    { title: 'Pourquoi ça coûte si peu', points: ['Les mêmes ingrédients servent plusieurs soirs', 'Des légumes surgelés, sans perte', 'Des légumineuses à la place de la viande'] },
  ],
  hook: 'Menu de la semaine pour 2 : 5 dîners sans viande, la liste et le total des courses. Enregistrez-le 📌',
  hashtags: ['#menudelasemaine', '#recettepascher', '#petitbudget', '#végétarien', '#batchcooking'],
  sources: [['Prix relevés sur carrefour.fr le 7/10/2026', 'https://www.carrefour.fr']],
} satisfies Info;
