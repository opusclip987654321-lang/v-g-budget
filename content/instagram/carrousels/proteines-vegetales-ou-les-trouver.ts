import type { Info } from '@/lib/instagram-infos';

export default {
  slug: 'proteines-vegetales-ou-les-trouver',
  title: 'Protéines sans viande : où les trouver ?',
  pill: 'Nutrition',
  image: '/images/blog/proteines-vegetales-riz-lentilles.jpg',
  slides: [
    { title: 'Combien en faut-il ?', chiffre: ['0,83 g', 'de protéines par kilo de poids et par jour, pour un adulte'], text: 'Soit environ 50 g par jour pour une personne de 60 kg.' },
    { title: 'Pour 100 g cuits ou prêts à manger', points: ['Seitan : 20 à 25 g', 'Tofu ferme : 12 à 15 g', 'Lentilles : environ 9 g', 'Pois chiches, haricots rouges : 8 à 9 g'] },
    { title: 'Et aussi, pour 100 g', points: ['Œufs (2 œufs) : environ 12 g', 'Fromage : 20 à 30 g', 'Flocons d’avoine : environ 13 g', 'Cacahuètes, amandes : 20 à 25 g'] },
    { title: 'Le bon duo', text: 'Céréales et légumineuses ensemble (riz et lentilles, semoule et pois chiches) apportent tous les acides aminés essentiels. Pas besoin au même repas : sur la journée, ça suffit.' },
  ],
  hook: 'Sans viande, on manque de protéines ? Non, si on sait où les trouver 👇',
  hashtags: ['#protéinesvégétales', '#végétarien', '#nutrition', '#légumineuses', '#sansviande'],
  sources: [['Anses, table Ciqual', 'https://ciqual.anses.fr'], ['Anses, références nutritionnelles', 'https://www.anses.fr/fr/content/les-références-nutritionnelles-en-vitamines-et-minéraux']],
} satisfies Info;
