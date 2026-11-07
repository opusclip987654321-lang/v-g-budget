import type { Article } from '@/lib/blog-articles';
import { cost, kiloPrice } from '@/lib/blog-cost';
import { ingredients } from '@/lib/catalog';
import { findRecipe, portionCost } from '@/lib/seo';

// Soupes du catalogue (lib/catalog.ts, catégorie « Soupes ») : soupe-petits-pois, courge-lentilles, minestrone-haricots.
// Aucun prix de soupe du commerce n'est relevé par le site : on ne chiffre pas la brique, on donne la méthode pour comparer.
const ligne = (nom: string, id: string) => `| ${nom} | ${kiloPrice(id)} |`;
const tableau = [
  '| Base de soupe | Prix au kilo |',
  '|---|---|',
  ligne('Pommes de terre', 'potato'),
  ligne('Oignons', 'onion'),
  ligne('Carottes', 'carrot'),
  ligne('Chou blanc', 'cabbage'),
  ligne('Courge', 'squash'),
  ligne('Petits pois surgelés', 'peas'),
  ligne('Lentilles corail', 'red-lentils'),
].join('\n');
// Le texte compare ces prix en toutes lettres : si un relevé inverse une comparaison, la construction échoue.
const kg = (id: string) => { const i = ingredients.find(x => x.id === id); if (!i) throw new Error(`Ingrédient inconnu : ${id}`); return i.price / i.pack; };
const portion = (id: string) => { const r = findRecipe(id); if (!r) throw new Error(`Recette inconnue : ${id}`); return portionCost(r); };
const bases = ['carrot', 'cabbage', 'squash', 'peas', 'red-lentils'];
if (!(Math.max(kg('potato'), kg('onion')) < Math.min(...bases.map(kg)) && kg('squash') > Math.max(kg('potato'), kg('onion'), kg('carrot'), kg('cabbage'))
  && portion('soupe-petits-pois') <= portion('courge-lentilles') && portion('courge-lentilles') <= portion('minestrone-haricots')))
  throw new Error('Les prix du catalogue ont changé : revoir les comparaisons de /blog/soupe-maison-pas-chere.');

export default {
  slug: 'soupe-maison-pas-chere',
  title: 'Soupe maison pas chère : 3 soupes-repas et comment les conserver',
  seoTitle: 'Soupe maison pas chère : 3 recettes, prix et conservation',
  description: 'Soupe maison pas chère : 3 soupes qui font un vrai dîner, leur coût par portion, les légumes les moins chers et combien de temps garder sa soupe.',
  lead: `Une soupe maison pas chère tient en trois choses : des légumes de garde, une casserole et un féculent ou des légumes secs pour en faire un vrai dîner. Nos trois soupes-repas coûtent entre ${cost('soupe-petits-pois')} et ${cost('minestrone-haricots')} par portion, en ingrédients.`,
  category: 'Recettes',
  keywords: ['soupe maison pas chère', 'soupe maison ou soupe en brique', 'soupe de légumes maison facile', 'soupe repas complet', 'combien de temps se conserve une soupe maison', 'congeler une soupe maison'],
  date: '2026-11-07',
  coverAlt: 'Soupe maison pas chère : une marmite, un bol de soupe de légumes, une carotte et une pomme de terre',
  body: `
@essentiel
- **La base la moins chère** : pommes de terre, oignons, carottes et chou, avec de l’eau et du sel.
- **Pour un vrai dîner**, ajoutez des lentilles, des haricots, des pâtes ou des tartines.
- **Au réfrigérateur**, 48 heures au plus pour un plat fait maison, selon le ministère de l’Agriculture.
- **La soupe se congèle** : en petites portions, une fois refroidie.

@chiffres ${cost('soupe-petits-pois')} | la portion de soupe de petits pois ; ${kiloPrice('potato')} | les pommes de terre ; 48 h | au réfrigérateur, au plus

## Quelle soupe maison pas chère pour un repas complet ?

Une soupe de légumes seule nourrit peu. Ces trois recettes y ajoutent des légumes secs, des pâtes ou du pain : elles font le dîner. Le montant affiché est le coût estimé des ingrédients par portion.

@recette soupe-petits-pois | Petits pois surgelés et pommes de terre mixés, avec des tartines grillées à côté : une soupe prête en 25 min, dans une seule casserole.

@recette courge-lentilles | La courge et les lentilles corail cuisent ensemble 20 min dans la même casserole : les lentilles épaississent le velouté et en font un dîner. Plus d’idées dans nos [recettes de courge faciles](/blog/courge-recette-facile).

@recette minestrone-haricots | Carottes, chou, pommes de terre, tomates, pâtes et haricots blancs : une soupe qui se mange comme un plat.

@cta-court Des carottes ou une demi-courge au réfrigérateur ? Indiquez-les dans VégéBudget : il compose les dîners sans viande de la semaine avec ce que vous avez déjà, selon votre budget, et donne la liste de courses avec son montant estimé. Première semaine gratuite, sans compte.

## Soupe maison ou soupe en brique : laquelle coûte le moins cher ?

Pour comparer une soupe maison et une soupe en brique, regardez le **prix au litre** sur l’étiquette de la brique, puis le coût par portion de nos recettes ci-dessus. Notre site ne relève pas les prix des soupes du commerce : nous ne donnons donc pas de chiffre pour la brique.

- **La brique** : pratique, mais vous payez l’eau, l’emballage et la préparation.
- **La soupe maison** : vous choisissez les légumes, le sel et la quantité.
- **Le surgelé** : les petits pois ou les épinards en sachet font une bonne base, sans épluchage (voir [légumes surgelés : moins chers que le frais ?](/blog/legumes-surgeles-prix)).

## Quels légumes choisir pour une soupe pas chère en novembre ?

Les légumes de garde de novembre font les soupes les moins chères. Prix au kilo des bases de nos recettes :

${tableau}

> Prix relevés le 7 octobre 2026 sur carrefour.fr, marques distributeur, hors promotions.

La courge coûte plus cher au kilo, mais elle donne une soupe épaisse avec peu d’autres ingrédients. La liste complète du mois est dans nos [fruits et légumes de novembre](/blog/fruits-legumes-novembre).

## Comment faire une soupe de légumes maison facile, sans recette ?

![Une casserole de soupe de légumes sur le feu, à côté de carottes, d’une demi-courgette et d’une pomme de terre](/images/blog/gaspillage-alimentaire-soupe-restes.jpg "Un fond de légumes devient une soupe.")

- **Un oignon** émincé, revenu dans un peu d’huile.
- **Les légumes du frigo**, coupés en dés, avec une pomme de terre pour épaissir.
- **De l’eau à hauteur**, puis cuisson jusqu’à ce que tout soit tendre.
- **Mixer ou non**, saler à la fin.
- **Pour un dîner** : une poignée de lentilles corail dans la cuisson, ou des tartines à côté.

C’est aussi une façon simple de finir les légumes un peu fatigués : voir nos idées contre le [gaspillage alimentaire](/blog/gaspillage-alimentaire).

## Combien de temps se conserve une soupe maison, et peut-on la congeler ?

- **Au réfrigérateur** : le ministère de l’Agriculture conseille de consommer les restes de plats faits maison le plus vite possible, en 48 heures au plus.
- **Refroidir vite** : ne pas laisser un plat chaud plus de 2 heures à température ambiante. Répartissez la soupe dans de petits récipients.
- **Au congélateur** : le ministère cite les soupes parmi les préparations qui se congèlent bien. Congelez-la le jour même, pas après plusieurs jours au réfrigérateur.
- **Les bonnes températures** : de 0 à 4 °C dans la partie la plus froide du réfrigérateur, −18 °C au congélateur, selon la DGCCRF.

> Congelez en portions d’un dîner, avec la date sur le couvercle. Un produit décongelé ne se recongèle pas.

## D’autres dîners chauds pour l’hiver

@recettes poelee-chou, mijote-lentilles, hachis-lentilles

Pour d’autres idées avec des légumes secs, voyez nos [recettes de lentilles pas chères](/blog/recettes-lentilles-pas-cheres) ou toutes nos [recettes](/recettes).

@cta Organisez vos dîners de la semaine
`,
  faq: [
    ['Une soupe suffit-elle pour un dîner ?', 'Une soupe de légumes seule nourrit peu. Ajoutez des légumes secs (lentilles, haricots), des pâtes ou du pain pour en faire un repas, comme dans notre minestrone aux haricots blancs ou notre velouté de courge aux lentilles corail.'],
    ['Combien de temps peut-on garder une soupe maison au réfrigérateur ?', 'Le ministère de l’Agriculture conseille de consommer les restes de plats faits maison le plus vite possible, en 48 heures au plus, et de ne pas les laisser refroidir plus de 2 heures à température ambiante.'],
    ['Peut-on congeler une soupe maison ?', 'Oui. Le ministère de l’Agriculture cite les soupes parmi les préparations qui se congèlent. Congelez-la une fois refroidie, en petites portions datées, sans attendre plusieurs jours au réfrigérateur, et ne la recongelez pas après décongélation.'],
    ['Soupe maison ou soupe en brique : laquelle est la moins chère ?', 'Notre site ne relève pas les prix des soupes en brique. Pour comparer, regardez le prix au litre sur l’étiquette de la brique et le coût des ingrédients de votre soupe maison, calculé à partir du prix au kilo des légumes.'],
    ['Quels légumes coûtent le moins cher pour une soupe ?', `Dans nos relevés, les pommes de terre (${kiloPrice('potato')}) et les oignons (${kiloPrice('onion')}) sont les moins chers de nos bases de soupe, devant les carottes, le chou et les petits pois surgelés. Prix carrefour.fr du 7 octobre 2026, marques distributeur.`],
  ],
  sources: [
    ['Cuisiner fait maison : comment éviter les intoxications alimentaires (ministère de l’Agriculture)', 'https://agriculture.gouv.fr/cuisiner-fait-maison-comment-eviter-les-intoxications-alimentaires'],
    ['Les bonnes pratiques de la congélation (ministère de l’Agriculture)', 'https://agriculture.gouv.fr/les-bonnes-pratiques-de-la-congelation'],
    ['Le froid, mode d’emploi (DGCCRF)', 'https://www.economie.gouv.fr/files/directions_services/dgccrf/documentation/publications/depliants/froid.pdf'],
  ],
} satisfies Article;
