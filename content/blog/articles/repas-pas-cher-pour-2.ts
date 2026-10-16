import type { Article } from '@/lib/blog-articles';
import { amountPrice, cost, packPrice } from '@/lib/blog-cost';
import { money, recipeCost } from '@/lib/planner';
import { findRecipe } from '@/lib/seo';

// Coût des ingrédients utilisés pour 2 portions, calculé avec les prix du catalogue (lib/catalog.ts).
const forTwo = (id: string) => {
  const r = findRecipe(id);
  if (!r) throw new Error(`Recette inconnue dans un article du blog : ${id}`);
  return money(recipeCost(r, 2));
};

export default {
  slug: 'repas-pas-cher-pour-2',
  title: 'Repas pas cher pour 2 : 7 dîners sans viande et leur coût réel',
  seoTitle: 'Repas pas cher pour 2 : 7 dîners et leur coût réel',
  description: 'Repas pas cher pour 2 : 7 idées de dîners sans viande, de 20 à 30 min, avec le coût des ingrédients pour deux et 5 astuces pour cuisiner à deux sans gaspiller.',
  lead: `Un repas pas cher pour 2 repose sur le riz, les pâtes, les légumes secs et les surgelés : le riz sauté aux petits pois revient à ${forTwo('riz-saute')} d’ingrédients pour deux, la soupe de petits pois avec ses tartines à ${forTwo('soupe-petits-pois')}. Voici 7 dîners, avec le coût de chacun et les astuces pour ne rien gaspiller à deux.`,
  category: 'Budget',
  keywords: ['repas pas cher pour 2', 'idée repas pas cher pour 2', 'dîner pas cher pour 2', 'repas végétarien pas cher pour 2', 'repas pas cher à deux', 'cuisiner pour deux'],
  date: '2026-10-16',
  coverAlt: 'Illustration d’un repas pas cher pour 2 : deux assiettes, un riz aux petits pois et un curry, posées face à face',
  body: `
@essentiel
- 7 dîners pour deux de ${forTwo('riz-saute')} à ${forTwo('curry-corail')} d’ingrédients, soit ${cost('riz-saute')} à ${cost('curry-corail')} la portion.
- Les moins chers : riz, semoule, pâtes, légumes secs et légumes surgelés.
- À deux, le piège n’est pas le prix d’un plat mais les restes : conserves entamées, légumes oubliés.
- La parade : un même ingrédient pour deux dîners dans la semaine.

@chiffres ${forTwo('riz-saute')} | le riz sauté pour deux ; 20 à 30 min | de préparation ; 2 fois | de légumes secs par semaine, conseil de Manger Bouger

## Quelles idées de repas pas cher pour 2 le soir ?

Sept dîners de notre catalogue, du moins cher au plus cher. Les quantités sont prévues pour deux : rien à diviser.

@recette riz-saute | Riz, petits pois, carottes et oignon dans une seule poêle. Le moins cher de la sélection.

@recette soupe-petits-pois | Une soupe de petits pois surgelés et de pommes de terre, servie avec des tartines pour en faire un vrai repas.

@recette semoule-pois | Semoule, carottes, petits pois et pois chiches au cumin, prêts en 20 min.

@cta-court À deux, le plus dur est de finir ce qu’on a acheté : VégéBudget prépare les dîners de la semaine selon votre budget, avec la liste de courses, en tenant compte de ce qui reste dans vos placards.

@recette epinards-pois-chiches | Épinards surgelés et pois chiches sur du riz, en 20 min.

@recette pates-brocoli | Pâtes, brocoli surgelé, pois chiches et citron. De quoi finir la boîte de pois chiches ouverte pour la semoule.

@recette poelee-chou | Chou, pommes de terre et haricots blancs au paprika, dans une seule casserole.

@recette curry-corail | Lentilles corail, tomates, épinards et lait de coco. Pour d’autres idées aux lentilles, voyez nos [recettes de lentilles pas chères](/blog/recettes-lentilles-pas-cheres).

## Combien coûte un repas fait maison pour 2 ?

Dans notre catalogue, un dîner sans viande fait maison pour deux coûte de ${forTwo('riz-saute')} à ${forTwo('curry-corail')} d’ingrédients. Le tableau donne le coût de ce que vous mettez dans la casserole.

| Dîner | Pour deux | La portion |
|---|---|---|
| [Riz sauté aux petits pois](/recettes/riz-saute) | ${forTwo('riz-saute')} | ${cost('riz-saute')} |
| [Soupe de petits pois](/recettes/soupe-petits-pois) | ${forTwo('soupe-petits-pois')} | ${cost('soupe-petits-pois')} |
| [Semoule aux petits pois](/recettes/semoule-pois) | ${forTwo('semoule-pois')} | ${cost('semoule-pois')} |
| [Épinards et pois chiches](/recettes/epinards-pois-chiches) | ${forTwo('epinards-pois-chiches')} | ${cost('epinards-pois-chiches')} |
| [Pâtes au brocoli](/recettes/pates-brocoli) | ${forTwo('pates-brocoli')} | ${cost('pates-brocoli')} |
| [Poêlée de chou](/recettes/poelee-chou) | ${forTwo('poelee-chou')} | ${cost('poelee-chou')} |
| [Curry de lentilles corail](/recettes/curry-corail) | ${forTwo('curry-corail')} | ${cost('curry-corail')} |

Coût estimé des ingrédients utilisés : prix relevés le 7 octobre 2026 sur carrefour.fr, marques distributeur, hors promotions. En magasin, vous achetez des paquets entiers : le reste sert pour d’autres dîners.

## Comment cuisiner pour deux sans gaspiller ?

![Semoule aux petits pois, aux carottes et aux pois chiches dans une assiette](/images/recettes/semoule-pois.jpg "La semoule aux petits pois : la moitié d’une boîte de pois chiches suffit.")

À deux, on ouvre souvent une boîte ou un sachet pour n’en utiliser qu’une partie. Le reste finit au fond du réfrigérateur, et c’est là que la note grimpe.

- **Une boîte, deux dîners** : la semoule et les pâtes au brocoli prennent chacune 120 g de pois chiches ; une boîte de 265 g égouttés suffit pour les deux.
- **Les surgelés** : petits pois, épinards, brocoli. Vous prenez la quantité du soir, le reste attend au congélateur.
- **Les féculents secs** : riz, pâtes et semoule se gardent longtemps. Un paquet de riz coûte ${packPrice('rice')}.
- **Notez ce qui reste** avant de faire les courses, comme dans nos [conseils contre le gaspillage alimentaire](/blog/gaspillage-alimentaire).
- **Cuisinez en double** les plats qui se gardent (curry, soupe) pour le midi du lendemain.

## Repas végétarien pas cher pour 2 : par quoi remplacer la viande ?

Les légumes secs font la base de la plupart de ces dîners : 70 g de lentilles corail sèches (une portion) coûtent ${amountPrice('red-lentils', 70)}. Manger Bouger conseille d’en manger **au moins 2 fois par semaine**.

| Base du dîner | Exemple de plat |
|---|---|
| Pois chiches | Semoule, pâtes au brocoli |
| Lentilles | Curry, bolognaise, salade tiède |
| Haricots blancs | Poêlée de chou |

Pour comparer les protéines et leur prix, voyez notre [comparatif des protéines végétales](/blog/proteines-vegetales).

## Comment organiser ses repas pas chers à deux pour la semaine ?

Le plus efficace est de choisir les dîners avant d’aller au magasin, en enchaînant ceux qui partagent des ingrédients. Notre [menu de la semaine pas cher](/blog/menu-semaine-pas-cher) montre une semaine complète pour deux, avec la liste de courses.

VégéBudget fait ce travail pour vous : vous indiquez votre budget et ce que vous avez déjà, il prépare les dîners de la semaine, la liste de courses et son montant estimé. La première semaine est gratuite, sans compte ni carte bancaire.

## D’autres idées de dîner pas cher pour 2

@recettes bolognaise-lentilles, salade-lentilles, mijote-lentilles

@cta Préparez vos dîners à deux selon votre budget
`,
  faq: [
    ['Combien coûte un repas fait maison pour 2 personnes ?', `Avec les prix relevés pour notre site, les ingrédients d’un dîner sans viande pour deux coûtent de ${forTwo('riz-saute')} (riz sauté aux petits pois) à ${forTwo('curry-corail')} (curry de lentilles corail). Prix relevés le 7 octobre 2026 sur carrefour.fr, marques distributeur, hors promotions.`],
    ['Quel est le repas le moins cher à faire pour deux ?', `Parmi ces sept dîners, c’est le riz sauté aux petits pois : ${cost('riz-saute')} la portion d’ingrédients, prêt en 25 min avec du riz, des petits pois surgelés, des carottes et un oignon.`],
    ['Comment cuisiner pour deux sans avoir de restes qui se perdent ?', 'Prévoyez deux dîners qui utilisent le même ingrédient (par exemple une boîte de pois chiches pour la semoule aux petits pois et les pâtes au brocoli), préférez les légumes surgelés et cuisinez en double les plats qui se gardent pour le lendemain midi.'],
    ['Un repas sans viande est-il moins cher ?', `Souvent, car les légumes secs, le riz et les pâtes coûtent peu : 70 g de lentilles corail sèches reviennent à ${amountPrice('red-lentils', 70)} avec nos prix relevés. Tout dépend ensuite des autres ingrédients du plat.`],
  ],
  sources: [
    ['Augmenter les légumes secs (Manger Bouger, Santé publique France)', 'https://www.mangerbouger.fr/l-essentiel/les-recommandations-sur-l-alimentation-l-activite-physique-et-la-sedentarite/augmenter/augmenter-les-legumes-secs'],
  ],
} satisfies Article;
