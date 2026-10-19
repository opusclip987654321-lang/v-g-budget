import type { Info } from '@/lib/instagram-infos';

export default {
  slug: 'legumes-de-saison-automne',
  title: 'Fruits et légumes de saison en automne',
  pill: 'Saisons',
  image: '/images/blog/fruits-legumes-de-saison-octobre.jpg',
  slides: [
    { title: 'Légumes', points: ['Courges : potiron, butternut, potimarron', 'Poireau, carotte, betterave, céleri', 'Choux : chou-fleur, brocoli, chou vert', 'Champignons, épinards, panais'] },
    { title: 'Fruits', points: ['Pommes et poires', 'Raisin et coings', 'Châtaignes et noix', 'Kiwis, à partir de novembre'] },
    { title: 'Pourquoi de saison ?', points: ['Moins cher : c’est le pic de récolte', 'Plus de goût : cueilli à maturité', 'Pas de serre chauffée pour le faire pousser'] },
    { title: 'Une idée de dîner', text: 'Une soupe de potiron et lentilles corail : un potiron, une poignée de lentilles, un oignon, et un dîner complet pour quelques euros.' },
  ],
  hook: 'Ce qu’on trouve de bon et pas cher en automne, à enregistrer pour vos courses 👇',
  hashtags: ['#légumesdesaison', '#cuisinedesaison', '#automne', '#végétarien', '#mangerlocal'],
  sources: [['Manger Bouger, calendrier des fruits et légumes', 'https://www.mangerbouger.fr'], ['ADEME, Que de saisons', 'https://agirpourlatransition.ademe.fr/particuliers/conso/alimentation/calendrier-fruits-legumes-saison']],
} satisfies Info;
