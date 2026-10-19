import type { Info } from '@/lib/instagram-infos';

export default {
  slug: 'bien-etre-animal-lire-les-etiquettes',
  title: 'Bien-être animal : ce que disent vraiment les étiquettes',
  pill: 'Animaux',
  image: '/images/blog/bien-etre-animal-etiquettes.jpg',
  slides: [
    { title: 'Le chiffre sur l’œuf', points: ['0 : bio, avec accès à l’extérieur', '1 : plein air', '2 : au sol, en bâtiment, sans sortir', '3 : en cage'] },
    { title: 'Le poulet', points: ['Standard : abattu vers 35 à 40 jours, en bâtiment', 'Label Rouge fermier : 81 jours au moins, accès au plein air', 'Bio : 81 jours au moins, plein air et alimentation bio'] },
    { title: 'Les mots qui ne garantissent rien', points: ['« Fermier » seul, sans label', '« Nourri aux céréales »', 'Une ferme dessinée sur l’emballage'] },
    { title: 'Le plus efficace', chiffre: ['104', 'portions de viande en moins par an, avec 1 dîner végétarien par semaine à deux'], text: 'Moins de viande, et de la viande mieux choisie quand on en mange.' },
  ],
  hook: '0, 1, 2 ou 3 sur vos œufs : voici ce que ça change pour les poules 👇',
  hashtags: ['#bienêtreanimal', '#codeoeuf', '#labelrouge', '#végétarien', '#consommerautrement'],
  sources: [['Ministère de l’Agriculture', 'https://agriculture.gouv.fr/bien-etre-animal'], ['INAO, Label Rouge', 'https://www.inao.gouv.fr']],
} satisfies Info;
