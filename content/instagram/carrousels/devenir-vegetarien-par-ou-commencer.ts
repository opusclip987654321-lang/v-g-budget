import type { Info } from '@/lib/instagram-infos';

export default {
  slug: 'devenir-vegetarien-par-ou-commencer',
  title: 'Manger moins de viande : par où commencer ?',
  pill: 'Les bases',
  slides: [
    { title: '1. Un soir par semaine', text: 'Choisissez un jour sans viande, toujours le même. C’est plus facile de tenir une habitude qu’une règle.' },
    { title: '2. Gardez vos plats préférés', points: ['Bolognaise : avec des lentilles', 'Chili : avec des haricots rouges', 'Curry : avec des pois chiches'] },
    { title: '3. Faites le plein de placard', points: ['Lentilles, pois chiches, haricots', 'Riz, pâtes, semoule', 'Tomates en boîte, épices, lait de coco'] },
    { title: '4. Ajoutez un soir de plus', text: 'Quand le premier soir devient naturel, passez à deux. Sans culpabiliser les jours où vous mangez de la viande.' },
  ],
  hook: 'Envie de manger moins de viande sans tout changer ? Commencez par là 👇',
  hashtags: ['#végétarien', '#flexitarien', '#moinsdeviande', '#recettevégétarienne', '#sansviande'],
  sources: [['Manger Bouger', 'https://www.mangerbouger.fr']],
} satisfies Info;
