import type { Info } from '@/lib/instagram-infos';

export default {
  slug: 'viande-rouge-et-sante',
  title: 'Viande rouge et charcuterie : les repères santé',
  pill: 'Santé',
  slides: [
    { title: 'Les repères officiels', points: ['Viande hors volaille : 500 g par semaine au plus', 'Charcuterie : 150 g par semaine au plus', 'Légumineuses : au moins 2 fois par semaine'] },
    { title: 'Ce que dit l’OMS', points: ['Charcuterie : cancérogène avérée (groupe 1)', 'Viande rouge : cancérogène probable (groupe 2A)', 'Le risque augmente avec la quantité'] },
    { title: '500 g, c’est quoi ?', text: 'Environ 3 ou 4 steaks par semaine. Le reste des repas peut être à base de volaille, de poisson, d’œufs ou de légumineuses.' },
    { title: 'En pratique', text: 'Remplacer 2 ou 3 repas de viande rouge par semaine par des plats de légumineuses suffit souvent pour rester dans les repères.' },
  ],
  hook: 'Combien de viande rouge et de charcuterie par semaine ? Les repères officiels 👇',
  hashtags: ['#santé', '#nutrition', '#moinsdeviande', '#végétarien', '#mangerbouger'],
  sources: [['Manger Bouger (Santé publique France)', 'https://www.mangerbouger.fr'], ['CIRC/OMS (2015)', 'https://www.iarc.who.int/wp-content/uploads/2018/07/pr240_F.pdf']],
} satisfies Info;
