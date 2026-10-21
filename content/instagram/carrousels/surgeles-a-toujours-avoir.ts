import type { Info } from '@/lib/instagram-infos';

export default {
  slug: 'surgeles-a-toujours-avoir',
  title: 'Les 3 surgelés à toujours avoir au congélateur',
  pill: 'Astuces',
  image: '/images/recettes/pates-brocoli.jpg',
  slides: [
    { ticket: 'Le trio du congélateur', items: ['peas', 'spinach', 'broccoli'] },
    { title: 'Pourquoi surgelé', points: ['Déjà lavés et coupés', 'Aucune perte : on prend ce qu’il faut', 'Ils se gardent des mois'] },
    { title: 'Et les vitamines ?', text: 'Les légumes surgelés nature comptent dans les fruits et légumes recommandés chaque jour : choisissez-les sans sauce ni sel ajouté.' },
    { recette: 'pates-brocoli', text: 'Le brocoli surgelé cuit avec les pâtes, dans la même casserole.' },
    { recette: 'riz-saute', text: 'Les petits pois vont directement dans la poêle, sans décongeler.' },
  ],
  hook: 'Petits pois, épinards, brocoli : les 3 légumes surgelés qui sauvent les fins de semaine, avec leur prix et 2 idées de dîners 👇',
  hashtags: ['#surgelés', '#astucescuisine', '#antigaspi', '#petitbudget', '#végétarien'],
  sources: [['Prix relevés sur carrefour.fr le 7/10/2026', 'https://www.carrefour.fr'], ['Manger Bouger, les repères', 'https://www.mangerbouger.fr']],
} satisfies Info;
