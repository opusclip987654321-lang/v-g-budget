import type { Info } from '@/lib/instagram-infos';

export default {
  slug: 'quiz-prix-curry',
  title: 'Ce curry coûte combien la part ? Devinez',
  pill: 'Quiz',
  image: '/images/recettes/curry-corail.jpg',
  slides: [
    { quiz: 'Un curry de lentilles corail, combien la part ?', choix: ['{prix:curry-corail}', '2,90 €', '5,50 €'] },
    { grand: 'Réponse A : {prix:curry-corail} la part', text: 'Ingrédients pour 2 et recette juste après.' },
    { recette: 'curry-corail', text: 'Doux, crémeux grâce au lait de coco, prêt en 25 minutes.' },
    { title: 'Le secret du prix', text: 'Les lentilles corail sèches cuisent en 15 minutes sans trempage, et un paquet sert pour plusieurs dîners.' },
  ],
  hook: 'Quiz : combien coûte une part de ce curry de lentilles corail ? A, B ou C ? Répondez en commentaire avant de regarder 👇',
  hashtags: ['#quiz', '#currydelentilles', '#recettepascher', '#végétarien', '#petitbudget'],
  sources: [['Prix relevés sur carrefour.fr le 7/10/2026', 'https://www.carrefour.fr']],
} satisfies Info;
