import type { Info } from '@/lib/instagram-infos';

export default {
  slug: 'proteines-moins-cheres-au-kilo',
  title: 'Les protéines végétales les moins chères au kilo',
  pill: 'Classement',
  slides: [
    { classement: 'Le classement au kilo', items: ['green-lentils', 'red-lentils', 'kidney', 'chickpeas', 'white-beans', 'tofu'], note: 'Les lentilles sont pesées sèches : leur poids double environ à la cuisson. Les haricots et pois chiches sont pesés cuits, égouttés.' },
    { title: 'Ce qu’il faut retenir', points: ['Haricots et pois chiches en conserve : bon marché et déjà cuits', 'Les lentilles sèches doublent au moins de poids en cuisant', 'Le tofu coûte plus cher, mais se cuisine comme une viande'] },
    { title: 'Pourquoi les légumineuses ?', text: 'Lentilles, pois chiches et haricots apportent des protéines et des fibres. Les repères officiels conseillent d’en manger au moins deux fois par semaine.' },
  ],
  hook: 'Lentilles, pois chiches, haricots, tofu : le classement des protéines végétales les moins chères au kilo. Enregistrez-le pour vos courses 📌',
  hashtags: ['#protéinesvégétales', '#légumineuses', '#petitbudget', '#végétarien', '#prixaukilo'],
  sources: [['Prix relevés sur carrefour.fr le 7/10/2026', 'https://www.carrefour.fr'], ['Manger Bouger, les repères', 'https://www.mangerbouger.fr']],
} satisfies Info;
