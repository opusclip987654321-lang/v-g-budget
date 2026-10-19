import type { Info } from '@/lib/instagram-infos';

export default {
  slug: 'elevage-terres-agricoles',
  title: 'L’élevage occupe la plupart des terres agricoles',
  pill: 'Planète',
  slides: [
    { title: 'Les terres agricoles du monde', chiffre: ['77 %', 'servent à l’élevage : pâturages et cultures pour nourrir les animaux'] },
    { title: 'Mais il nourrit peu', points: ['18 % des calories consommées dans le monde', '37 % des protéines', 'Le reste vient des cultures pour les humains'] },
    { title: 'Pourquoi ?', text: 'Pour produire 1 kg de viande, il faut d’abord nourrir l’animal pendant des mois avec des céréales, du soja et de l’herbe. Une grande partie se perd en chemin.' },
    { title: 'Ce que ça veut dire', text: 'Manger plus de végétaux, c’est nourrir plus de monde avec moins de terres, et laisser plus de place aux forêts.' },
  ],
  hook: '77 % des terres agricoles du monde servent à l’élevage, pour 18 % de nos calories 👇',
  hashtags: ['#écologie', '#climat', '#alimentationdurable', '#végétarien', '#déforestation'],
  sources: [['Our World in Data, d’après Poore et Nemecek (2018)', 'https://ourworldindata.org/land-use-diets']],
} satisfies Info;
