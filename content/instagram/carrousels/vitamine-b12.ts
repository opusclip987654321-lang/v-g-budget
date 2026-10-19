import type { Info } from '@/lib/instagram-infos';

export default {
  slug: 'vitamine-b12',
  title: 'Vitamine B12 : le seul vrai point de vigilance',
  pill: 'Nutrition',
  slides: [
    { title: 'À quoi elle sert', points: ['Fabriquer les globules rouges', 'Protéger le système nerveux', 'Le corps en stocke, mais pas pour toujours'] },
    { title: 'Où la trouver', points: ['Œufs, lait, fromage, yaourts', 'Aliments enrichis : certaines boissons végétales', 'Pas dans les végétaux : les algues ne sont pas une source fiable'] },
    { title: 'Végétarien', text: 'Avec des œufs et des laitages chaque jour, les apports sont souvent suffisants. Un bilan sanguin de temps en temps permet de vérifier.' },
    { title: 'Végétalien ou vegan', text: 'Un complément de vitamine B12 est indispensable, toute l’année. Demandez la dose à votre médecin ou à votre pharmacien.' },
  ],
  hook: 'Le seul vrai point de vigilance quand on mange végétal : la vitamine B12 👇',
  hashtags: ['#vitamineb12', '#végétarien', '#vegan', '#nutrition', '#végétalien'],
  sources: [['Anses', 'https://www.anses.fr'], ['Association végétarienne de France', 'https://www.vegetarisme.fr']],
} satisfies Info;
