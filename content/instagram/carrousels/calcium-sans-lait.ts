import type { Info } from '@/lib/instagram-infos';

export default {
  slug: 'calcium-sans-lait',
  title: 'Du calcium sans produits laitiers, c’est possible',
  pill: 'Nutrition',
  slides: [
    { title: 'Les sources végétales', points: ['Tofu préparé au sulfate de calcium', 'Boissons végétales enrichies en calcium', 'Choux, brocoli, amandes, graines de sésame', 'Certaines eaux minérales'] },
    { title: 'L’eau, la source oubliée', text: 'Certaines eaux minérales contiennent plus de 400 mg de calcium par litre. Regardez la ligne « calcium » sur l’étiquette de la bouteille.' },
    { title: 'Pour bien l’absorber', points: ['La vitamine D aide : un peu de soleil chaque jour', 'Bouger aide aussi à garder des os solides'] },
    { title: 'Végétarien avec laitages ?', text: 'Yaourts et fromages suffisent souvent. Cette liste sert surtout aux végétaliens et à ceux qui ne digèrent pas le lait.' },
  ],
  hook: 'Pas de lait ni de fromage ? Voici où trouver du calcium 👇',
  hashtags: ['#calcium', '#vegan', '#végétalien', '#nutrition', '#sanslactose'],
  sources: [['Anses, table Ciqual', 'https://ciqual.anses.fr']],
} satisfies Info;
