import type { Info } from '@/lib/instagram-infos';

export default {
  slug: 'climat-ce-que-pese-1-kg',
  title: 'Climat : ce que pèse 1 kg de nourriture',
  pill: 'Planète',
  slides: [
    { title: 'Gaz à effet de serre pour 1 kg', points: ['Bœuf : environ 100 kg d’équivalent CO2', 'Fromage : environ 24 kg', 'Porc : environ 12 kg, volaille : environ 10 kg', 'Tofu : environ 3 kg, pois : environ 1 kg'] },
    { title: 'L’élevage dans le monde', chiffre: ['14,5 %', 'des émissions de gaz à effet de serre dues aux activités humaines'], text: 'Estimation de la FAO, l’organisation des Nations unies pour l’alimentation.' },
    { title: 'Et le transport ?', text: 'Pour la plupart des aliments, le transport pèse moins de 10 % des émissions. Ce qu’on mange compte bien plus que d’où ça vient.' },
    { title: 'Ce qui change le plus', points: ['Remplacer le bœuf par des légumineuses quelques fois par semaine', 'Garder le fromage pour le goût, en petite quantité', 'Acheter de saison et jeter moins'] },
  ],
  hook: '1 kg de bœuf émet environ 100 fois plus de gaz à effet de serre que 1 kg de pois 👇',
  hashtags: ['#climat', '#écologie', '#alimentationdurable', '#végétarien', '#moinsdeviande'],
  sources: [['Our World in Data, d’après Poore et Nemecek (2018)', 'https://ourworldindata.org/environmental-impacts-of-food'], ['FAO (2013)', 'https://www.fao.org/4/i3437f/i3437f.pdf']],
} satisfies Info;
