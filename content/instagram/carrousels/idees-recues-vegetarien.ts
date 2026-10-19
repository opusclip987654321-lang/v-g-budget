import type { Info } from '@/lib/instagram-infos';

export default {
  slug: 'idees-recues-vegetarien',
  title: '4 idées reçues sur les végétariens',
  pill: 'Vrai ou faux',
  slides: [
    { title: '« On manque de protéines »', text: 'Faux. Légumineuses, tofu, œufs, fromage, céréales et oléagineux couvrent les besoins, à condition de varier.' },
    { title: '« Le soja détruit l’Amazonie »', chiffre: ['77 %', 'du soja cultivé dans le monde sert à nourrir les animaux d’élevage'], text: 'Le tofu n’en utilise qu’une petite part.' },
    { title: '« C’est plus cher »', text: 'Faux pour l’essentiel : lentilles, pois chiches et haricots secs sont parmi les protéines les moins chères du magasin.' },
    { title: '« On ne mange que de la salade »', text: 'Curry de pois chiches, chili sin carne, bolognaise de lentilles, gratins, galettes : la plupart des plats ont leur version végétarienne.' },
  ],
  hook: 'Protéines, soja, prix : 4 idées reçues sur les végétariens, vraies ou fausses ? 👇',
  hashtags: ['#végétarien', '#idéesreçues', '#vegan', '#protéinesvégétales', '#sansviande'],
  sources: [['Our World in Data, le soja', 'https://ourworldindata.org/soy'], ['Anses, table Ciqual', 'https://ciqual.anses.fr']],
} satisfies Info;
