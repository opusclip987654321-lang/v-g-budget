import type { Info } from '@/lib/instagram-infos';

export default {
  slug: 'omega-3-vegetaux',
  title: 'Oméga-3 sans poisson : où les trouver ?',
  pill: 'Nutrition',
  slides: [
    { title: 'À quoi ils servent', points: ['Le cœur et les vaisseaux', 'Le cerveau et la vue', 'Le corps ne sait pas les fabriquer seul'] },
    { title: 'Les meilleures sources végétales', points: ['Huile de colza ou de noix', 'Graines de lin moulues', 'Noix', 'Graines de chia'] },
    { title: 'Au quotidien', text: 'Une cuillère à soupe d’huile de colza dans la vinaigrette et une poignée de noix couvrent une bonne partie des besoins de la journée.' },
    { title: 'Bon à savoir', text: 'Les graines de lin entières traversent le corps sans être digérées : moulez-les juste avant de les manger. L’huile de colza ne se chauffe pas trop.' },
  ],
  hook: 'Pas de poisson ? Les oméga-3 se trouvent aussi dans l’huile de colza, les noix et le lin 👇',
  hashtags: ['#oméga3', '#végétarien', '#nutrition', '#vegan', '#santé'],
  sources: [['Anses, acides gras', 'https://www.anses.fr/fr/content/les-lipides'], ['Manger Bouger', 'https://www.mangerbouger.fr']],
} satisfies Info;
