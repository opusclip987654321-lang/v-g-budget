import type { Info } from '@/lib/instagram-infos';

export default {
  slug: 'placard-de-base-ticket',
  title: 'Le placard de base : voici ce qu’il coûte',
  pill: 'Budget',
  slides: [
    { ticket: 'Le ticket du placard', items: ['rice', 'pasta', 'red-lentils', 'green-lentils', 'chickpeas', 'kidney', 'tomato', 'coconut', 'oil', 'onion', 'garlic', 'curry'] },
    { title: 'Ce que ça permet', points: ['Curry de lentilles corail', 'Chili aux haricots rouges', 'Bolognaise de lentilles', 'Riz sauté, pâtes, semoule'] },
    { title: 'Ce qui dure longtemps', text: 'Riz, pâtes, légumineuses sèches, conserves et épices se gardent des mois : on les achète une fois, on cuisine plusieurs semaines.' },
    { title: 'Ce qu’on rachète chaque semaine', text: 'Seulement quelques légumes frais ou surgelés. C’est là que le ticket de la semaine reste petit.' },
  ],
  hook: 'Le placard de base pour cuisiner sans viande : le ticket complet, produit par produit. Enregistrez-le pour vos prochaines courses 📌',
  hashtags: ['#petitbudget', '#placard', '#courses', '#recettepascher', '#sansviande'],
  sources: [['Prix relevés sur carrefour.fr le 7/10/2026', 'https://www.carrefour.fr']],
} satisfies Info;
