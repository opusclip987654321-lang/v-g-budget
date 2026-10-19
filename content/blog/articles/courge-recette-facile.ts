import type { Article } from '@/lib/blog-articles';
import { amountPrice, cost, kiloPrice } from '@/lib/blog-cost';

export default {
  slug: 'courge-recette-facile',
  title: `Courge : une recette facile et pas chère, plus 4 dîners où l’ajouter`,
  seoTitle: 'Courge recette facile et pas chère : 5 dîners sans viande',
  description: `Courge ou potimarron : une recette facile et pas chère à ${cost('courge-lentilles')} la portion, 4 dîners où l’ajouter, et comment la choisir, la couper et la garder.`,
  lead: `La recette de courge la plus facile et la moins chère, c’est un velouté de courge et de lentilles corail : 30 min, une casserole, ${cost('courge-lentilles')} la portion. Avec un potimarron, inutile d’éplucher : sa peau s’attendrit à la cuisson.`,
  category: 'Saisons',
  keywords: ['courge recette facile pas chère', 'recette courge facile', 'potimarron recette facile', 'faut-il éplucher le potimarron', 'comment couper une courge', 'comment conserver une courge', 'saison des courges'],
  date: '2026-10-19',
  coverAlt: 'Courge recette facile : un potimarron entier, un bol de velouté de courge, une butternut et des cubes de courge',
  body: `
@essentiel
- **Le plus simple** : un velouté de courge et de lentilles corail, ${cost('courge-lentilles')} la portion.
- **Le potimarron** se cuisine avec sa peau : coupez, épépinez, faites cuire.
- **Une courge entière** se garde plusieurs mois au sec et au frais ; entamée, 4 jours au réfrigérateur.
- **Le reste de la courge** va dans un curry, une plaque au four ou un mijoté de lentilles.

@chiffres ${kiloPrice('squash')} | prix relevé de la courge ; ${cost('courge-lentilles')} | la portion de velouté ; octobre à janvier | la pleine saison, selon Interfel

## Quelle recette de courge facile et pas chère faire ce soir ?

Le velouté ne demande que 6 ingrédients : courge, lentilles corail, oignon, huile, curry et sel. Avec les lentilles, la soupe de courge devient un vrai plat du soir.

@recette courge-lentilles | Courge et lentilles corail cuites 20 min dans l’eau avec un peu de curry, puis mixées. Une seule casserole, sans gluten.

![Velouté de courge et de lentilles corail servi dans un bol](/images/recettes/courge-lentilles.jpg "Le velouté de courge et de lentilles corail : ${cost('courge-lentilles')} la portion.")

Pour 2, le [velouté de courge et lentilles corail](/recettes/courge-lentilles) demande 450 g de courge, soit ${amountPrice('squash', 450)}. Une courge d’environ 1 kg fait donc deux dîners : le velouté, puis un des plats ci-dessous.

@cta-court Une courge entamée au réfrigérateur ? Indiquez-la dans VégéBudget : il prévoit les dîners de la semaine avec ce que vous avez déjà, selon votre budget.

## Dans quels plats ajouter de la courge ?

Ces 4 recettes du site ne contiennent pas de courge à l’origine, mais elles l’accueillent sans peine. Le coût affiché est celui de la recette d’origine, sans la courge.

@recette curry-corail | Ajoutez de petits dés de courge en même temps que les lentilles.

@recette pois-chiches-rotis | Remplacez une partie des pommes de terre par des cubes de courge sur la plaque.

@recette mijote-lentilles | Dans ce mijoté de lentilles vertes, la courge prend la place d’une partie des pommes de terre.

@recette couscous-legumes | Remplacez la courgette par autant de dés de courge.

## Quelle courge choisir en saison : potimarron, butternut ou potiron ?

| Courge | Peau | Idéale pour |
|---|---|---|
| Potimarron | Se mange cuite | Velouté, curry, four |
| Butternut | Fine, souvent épluchée | Velouté, plaque au four |
| Potiron | Épaisse, à éplucher | Soupe, purée |

- **La pleine saison** des courges va d’octobre à janvier, selon Interfel.
- **Choisissez-la lourde et ferme**, à la peau plutôt mate, conseille le ministère de l’Agriculture.
- **Un pédoncule intact** (la tige) aide à mieux la conserver, selon Interfel.

## Faut-il éplucher le potimarron, et comment couper une courge ?

Non : la peau du potimarron s’attendrit à la cuisson, dans l’eau comme au four (Interfel). Pour une purée très lisse, certains préfèrent quand même l’éplucher.

- **Posez la courge sur un torchon humide** pour qu’elle ne glisse pas.
- **Coupez-la en deux** avec un grand couteau, en appuyant sur le dos de la lame.
- **Retirez les graines** à la cuillère, puis coupez des quartiers et enfin des dés.

## Comment conserver une courge entière ou entamée ?

- **Entière** : plusieurs mois dans un endroit sec, frais et aéré, selon le ministère de l’Agriculture.
- **Entamée** : 4 jours au plus dans le bac à légumes du réfrigérateur.
- **Au congélateur** : c’est possible, mais elle rend beaucoup d’eau en décongelant. Gardez-la pour une soupe.

> Entière, une courge se garde comme un produit du placard : pratique pour nos [dîners de fin de mois](/blog/que-manger-fin-de-mois). Pour finir ce qui est entamé, voyez nos [conseils contre le gaspillage alimentaire](/blog/gaspillage-alimentaire).

Pour savoir quels autres légumes acheter en ce moment, consultez notre [calendrier des fruits et légumes de saison](/blog/fruits-legumes-de-saison). Et si les lentilles vous plaisent, nos [recettes de lentilles pas chères](/blog/recettes-lentilles-pas-cheres) donnent d’autres idées de dîners.

Coût estimé des ingrédients : prix relevés le 7 octobre 2026 sur carrefour.fr, marques distributeur, hors promotions.

## D’autres dîners d’automne pas chers

@recettes poelee-chou, chili-haricots, salade-lentilles

@cta Organisez vos dîners de la semaine
`,
  faq: [
    ['Faut-il éplucher le potimarron ?', 'Non. La peau du potimarron s’attendrit à la cuisson, dans l’eau comme au four. Il suffit de le laver, de le couper en deux et de retirer les graines.'],
    ['Combien de temps se conserve une courge entamée ?', 'Quatre jours au plus dans le bac à légumes du réfrigérateur, selon le ministère de l’Agriculture. Entière, elle se garde plusieurs mois dans un endroit sec, frais et aéré.'],
    ['Peut-on congeler de la courge ?', 'Oui, mais elle rend beaucoup d’eau en décongelant. Elle convient alors mieux à une soupe ou à un velouté qu’à un plat au four.'],
    ['Quelle est la saison des courges ?', 'La pleine saison des courges va d’octobre à janvier, selon Interfel. Entières, elles se gardent ensuite plusieurs mois dans un endroit sec, frais et aéré.'],
    ['Quelle est la recette de courge la plus facile et la moins chère ?', `Un velouté : courge en dés, oignon, lentilles corail et eau, 20 min de cuisson, puis on mixe. Notre version revient à ${cost('courge-lentilles')} la portion en ingrédients (prix relevés le 7 octobre 2026 sur carrefour.fr, hors promotions).`],
  ],
  sources: [
    ['Courges et potirons, savoureux légumes d’automne (ministère de l’Agriculture)', 'https://agriculture.gouv.fr/courges-et-potirons-savoureux-legumes-dautomne'],
    ['Courges et potirons (Interfel, Les fruits et légumes frais)', 'https://www.lesfruitsetlegumesfrais.com/fruits-legumes/courges/courges-et-potirons'],
    ['Préparer un potimarron (Interfel, Les fruits et légumes frais)', 'https://www.lesfruitsetlegumesfrais.com/les-gestes-simples/preparer-un-potimarron'],
  ],
} satisfies Article;
