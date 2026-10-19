import type { Info } from '@/lib/instagram-infos';

export default {
  slug: 'le-fer-sans-viande',
  title: 'Le fer sans viande : les bons réflexes',
  pill: 'Nutrition',
  image: '/images/blog/recettes-lentilles-pas-cheres-corail-vertes.jpg',
  slides: [
    { title: 'Où trouver du fer', points: ['Lentilles, pois chiches, haricots', 'Tofu et tempeh', 'Graines de courge et de sésame', 'Flocons d’avoine, quinoa'] },
    { title: 'L’astuce qui change tout', text: 'La vitamine C aide le corps à absorber le fer des végétaux. Ajoutez un jus de citron, des poivrons, du persil ou un kiwi en dessert.' },
    { title: 'À éviter pendant le repas', points: ['Le thé et le café : attendez 1 heure après', 'Ils freinent l’absorption du fer'] },
    { title: 'Un doute ?', text: 'Fatigue, essoufflement, pâleur : demandez une prise de sang à votre médecin avant de prendre un complément de fer.' },
  ],
  hook: 'Pas de viande, pas de fer ? Les bons réflexes pour en absorber assez 👇',
  hashtags: ['#fer', '#végétarien', '#nutrition', '#légumineuses', '#santé'],
  sources: [['Anses, table Ciqual', 'https://ciqual.anses.fr'], ['Manger Bouger', 'https://www.mangerbouger.fr']],
} satisfies Info;
