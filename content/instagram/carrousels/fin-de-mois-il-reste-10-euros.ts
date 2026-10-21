import type { Info } from '@/lib/instagram-infos';

export default {
  slug: 'fin-de-mois-il-reste-10-euros',
  title: 'Le 25 du mois, quand le compte est presque vide',
  pill: 'Fin de mois',
  image: '/images/recettes/soupe-petits-pois.jpg',
  slides: [
    { grand: 'Pas de panique.', text: 'Voici 3 dîners pour 2 parmi les moins chers qu’on connaisse.' },
    { recette: 'riz-saute', text: 'Du riz, des petits pois surgelés, un oignon.' },
    { recette: 'soupe-petits-pois', text: 'Une soupe veloutée et des tartines : un vrai repas.' },
    { recette: 'semoule-pois', text: 'Prête en 20 minutes, avec ce qu’il reste au placard.' },
    { title: 'L’astuce de fin de mois', text: 'Avant d’aller au magasin, regardez ce qu’il reste dans le placard : riz, pâtes, conserves. On n’achète que ce qui manque.' },
  ],
  hook: 'Le 25 du mois et plus grand-chose sur le compte ? 3 dîners pour 2 parmi les moins chers. Envoyez-le à qui en a besoin 💬',
  hashtags: ['#findemois', '#petitbudget', '#recettepascher', '#antigaspi', '#végétarien'],
  sources: [['Prix relevés sur carrefour.fr le 7/10/2026', 'https://www.carrefour.fr']],
} satisfies Info;
