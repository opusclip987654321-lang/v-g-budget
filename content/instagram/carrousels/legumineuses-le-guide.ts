import type { Info } from '@/lib/instagram-infos';

export default {
  slug: 'legumineuses-le-guide',
  title: 'Légumineuses : le guide pour bien commencer',
  pill: 'Les bases',
  slides: [
    { title: 'C’est quoi ?', points: ['Lentilles vertes, corail, blondes', 'Pois chiches, pois cassés', 'Haricots rouges, blancs, noirs', 'Fèves et soja'] },
    { title: 'Pourquoi en manger', points: ['Riches en protéines et en fibres', 'Pas chères et se gardent des mois', 'Conseillées au moins 2 fois par semaine'] },
    { title: 'Trempage et cuisson', points: ['Lentilles : pas de trempage, 15 à 30 min', 'Pois chiches : 12 h de trempage, 1 h 30 de cuisson', 'Haricots secs : 12 h de trempage, 1 h à 1 h 30', 'Pressé ? Les conserves sont déjà cuites'] },
    { title: 'Mieux les digérer', text: 'Commencez par de petites portions, rincez bien les conserves et jetez l’eau de trempage. Le corps s’habitue en quelques semaines.' },
  ],
  hook: 'Lentilles, pois chiches, haricots : le guide pour bien les cuisiner et les digérer 👇',
  hashtags: ['#légumineuses', '#lentilles', '#poischiches', '#végétarien', '#protéinesvégétales'],
  sources: [['Manger Bouger', 'https://www.mangerbouger.fr']],
} satisfies Info;
