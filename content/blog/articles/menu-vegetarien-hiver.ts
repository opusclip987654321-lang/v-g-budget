import type { Article } from '@/lib/blog-articles';
import { cost, kiloPrice } from '@/lib/blog-cost';
import { recipes, type Recipe } from '@/lib/catalog';
import { money, packLabel, recipeCost, roundMoney, shopping, totals, type Entry, type ShopItem } from '@/lib/planner';

// Tous les montants viennent du catalogue (lib/catalog.ts) et du calcul de la liste de courses de l'appli (lib/planner.ts).
const jour = '2026-11-26';

// Le menu : 5 dîners d'hiver pour 2, sans viande.
const MENU: [string, string][] = [
  ['Lundi', 'courge-lentilles'],
  ['Mardi', 'poelee-chou'],
  ['Mercredi', 'hachis-lentilles'],
  ['Jeudi', 'minestrone-haricots'],
  ['Vendredi', 'curry-courge-haricots'],
];
const recette = (id: string): Recipe => {
  const r = recipes.find(x => x.id === id);
  if (!r) throw new Error(`Recette ${id} absente : revoir /blog/menu-vegetarien-hiver.`);
  return r;
};
const parPortion = (id: string) => roundMoney(recipeCost(recette(id), 2) / 2);
const entrees: Entry[] = MENU.map(([, id], n) => ({ id: `h-${n}`, recipeId: id, date: jour, servings: 2, cooked: false, locked: false }));
const items = shopping(entrees, []).filter(i => i.packages > 0);
const t = totals(items);
const portion = money(t.used / 10);

// Huile, sel et épices : souvent déjà dans le placard.
const PLACARD = ['oil', 'salt', 'curry', 'paprika', 'soy-sauce'];
const frais = items.filter(i => !PLACARD.includes(i.id));
const placard = items.filter(i => PLACARD.includes(i.id));
const sansPlacard = roundMoney(frais.reduce((s, i) => s + i.purchaseCost, 0));
const prixPlacard = roundMoney(placard.reduce((s, i) => s + i.purchaseCost, 0));
const item = (id: string): ShopItem => {
  const i = items.find(x => x.id === id);
  if (!i) throw new Error(`${id} absent de la liste : revoir /blog/menu-vegetarien-hiver.`);
  return i;
};

// Le texte dit : une courge de 1 kg pour 2 dîners, une seule boîte de lentilles corail et un seul chou.
if (item('squash').packages !== 1 || item('cabbage').packages !== 1 || item('red-lentils').packages !== 1)
  throw new Error('Les quantités de courge, de chou ou de lentilles ont changé : revoir /blog/menu-vegetarien-hiver.');
// Le texte dit « moins de 1,30 € la portion » pour chaque dîner et « autour de 1 € » en moyenne.
for (const [, id] of MENU) if (parPortion(id) >= 1.3) throw new Error(`${id} dépasse 1,30 € la portion : revoir /blog/menu-vegetarien-hiver.`);
if (t.used / 10 >= 1.1) throw new Error('La portion moyenne dépasse 1,10 € : revoir /blog/menu-vegetarien-hiver.');
// Le texte dit que les lentilles vertes aux carottes coûtent moins cher que le minestrone.
if (parPortion('mijote-lentilles') >= parPortion('minestrone-haricots')) throw new Error('Le mijoté de lentilles n’est plus moins cher que le minestrone : revoir /blog/menu-vegetarien-hiver.');
// Le texte dit que les dîners vont de la poêlée de chou (le moins cher) au curry de courge (le plus cher).
for (const [, id] of MENU)
  if (parPortion(id) < parPortion('poelee-chou') || parPortion(id) > parPortion('curry-courge-haricots'))
    throw new Error(`${id} sort de la fourchette poêlée de chou – curry de courge : revoir /blog/menu-vegetarien-hiver.`);
// Le texte dit qu’il reste plus de la moitié du chou.
if (item('cabbage').surplus <= item('cabbage').required)
  throw new Error('Il ne reste plus la moitié du chou : revoir /blog/menu-vegetarien-hiver.');

const nom = (i: ShopItem) => i.ingredient.name.replace(/, égouttés$/, '');
const ligne = (i: ShopItem) => `| ${nom(i)} | ${packLabel(i.packages, i.ingredient.pack, i.ingredient.unit, i.ingredient.name)} | ${money(i.purchaseCost)} |`;
const liste = [
  '| Produit | À acheter | Prix |',
  '|---|---|---|',
  ...[...frais].sort((a, b) => b.purchaseCost - a.purchaseCost).map(ligne),
  `| **Sous-total** | | **${money(sansPlacard)}** |`,
  ...placard.map(ligne),
  `| **Total si le placard est vide** | | **${money(t.purchase)}** |`,
].join('\n');

const menu = [
  '| Jour | Dîner pour 2 | Temps | La portion |',
  '|---|---|---|---|',
  ...MENU.map(([j, id]) => `| **${j}** | [${recette(id).title}](/recettes/${id}) | ${recette(id).minutes} min | ${money(parPortion(id))} |`),
].join('\n');

export default {
  slug: 'menu-vegetarien-hiver',
  title: `Menu végétarien d’hiver : 5 dîners pour 2 et la liste de courses à ${money(sansPlacard)}`,
  seoTitle: `Menu végétarien d’hiver : 5 dîners à ${portion} la portion`,
  description: `Menu végétarien d’hiver pas cher pour 2 : 5 dîners de saison sans viande (courge, chou, lentilles), le prix par portion et la liste de courses chiffrée.`,
  lead: `Voici un menu végétarien d’hiver pour la semaine : 5 dîners pour 2, à base de courge, de chou, de pommes de terre et de légumes secs, pour ${portion} la portion en moyenne. Toute la liste de courses coûte ${money(sansPlacard)} si vous avez déjà l’huile, le sel et les épices.`,
  category: 'Recettes',
  keywords: ['menu végétarien hiver', 'menu végétarien semaine hiver', 'menu hiver pas cher', 'repas végétarien hiver', 'idée repas hiver végétarien', 'dîner d’hiver sans viande'],
  date: '2026-11-26',
  coverAlt: 'Menu végétarien d’hiver : une marmite de velouté de courge, une courge, un chou, des carottes et un bol de lentilles sur une table',
  body: `
@essentiel
- **5 dîners d’hiver pour 2** : velouté de courge, poêlée de chou, hachis de lentilles, minestrone et curry de courge.
- **${portion} la portion** en moyenne, ingrédients seuls : de ${cost('poelee-chou')} pour la poêlée de chou à ${cost('curry-courge-haricots')} pour le curry.
- **${money(sansPlacard)} de courses** si vous avez l’huile, le sel et les épices, ${money(t.purchase)} sinon.
- **Une courge et un chou** servent chacun à deux dîners.

@chiffres ${portion} | la portion en moyenne ; ${money(sansPlacard)} | la liste de courses ; 2 fois | légumes secs par semaine, selon Manger Bouger

## Quel menu végétarien d’hiver pour la semaine ?

${menu}

Coût estimé des ingrédients pour 2 : prix relevés le 7 octobre 2026 sur carrefour.fr, marques distributeur, hors promotions.

@recette courge-lentilles | Lundi, la courge et les lentilles corail cuisent ensemble 20 min, puis on mixe. Une soupe épaisse qui fait un dîner à elle seule.

@recette poelee-chou | Mardi, le chou émincé cuit à couvert, puis rejoint les pommes de terre précuites et les haricots blancs, avec un peu de paprika.

@recette hachis-lentilles | Mercredi, des lentilles vertes à la tomate sous une purée, 40 min en tout, dont un passage au four.

@cta-court VégéBudget compose vos dîners d’hiver sans viande selon votre budget, retire ce que vous avez déjà à la maison et chiffre la liste de courses.

@recette minestrone-haricots | Jeudi, une soupe-repas de légumes, de pâtes et de haricots blancs, avec un peu du chou de mardi.

@recette curry-courge-haricots | Vendredi, le reste de la courge mijote au lait de coco, à servir avec du riz.

## Quelle liste de courses pour 5 dîners d’hiver ?

${liste}

Ce sont des paquets entiers, comme en magasin : il vous restera du riz, des pâtes, des lentilles et plus de la moitié du chou pour la semaine suivante.

## Combien coûte un menu végétarien d’hiver pour 2 ?

Les 10 portions reviennent à ${money(t.used)} d’ingrédients, soit ${portion} la portion. En caisse, vous payez ${money(sansPlacard)}, car les paquets sont vendus entiers.

Retrouvez le même calcul sur sept jours, midis compris, dans notre [menu de la semaine pas cher](/blog/menu-semaine-pas-cher).

## Quels légumes d’hiver pour un menu pas cher ?

- **La courge** : ${kiloPrice('squash')}, mais une seule fait deux dîners. D’autres idées dans nos [recettes de courge faciles](/blog/courge-recette-facile).
- **Le chou blanc** : ${kiloPrice('cabbage')}, et il se garde longtemps entier. Voir [que faire avec un chou blanc](/blog/recette-chou-blanc-pas-cher).
- **Les pommes de terre** : ${kiloPrice('potato')}, dans trois dîners sur cinq.
- **Les lentilles et les haricots** : des protéines végétales à petit prix, à manger au moins deux fois par semaine selon Manger Bouger.

Courge, chou et carottes sont de saison en hiver selon l’Ademe. La liste complète est dans nos [fruits et légumes de décembre](/blog/fruits-legumes-decembre).

![Lentilles vertes aux carottes et aux pommes de terre dans un bol blanc](/images/recettes/mijote-lentilles.jpg "Lentilles vertes aux carottes : ${cost('mijote-lentilles')} la portion.")

> **Pour payer encore moins** : remplacez le minestrone par des [lentilles vertes aux carottes](/recettes/mijote-lentilles), à ${cost('mijote-lentilles')} la portion.

## Comment préparer ses repas végétariens d’hiver à l’avance ?

- **Finissez la courge plus tôt** si vous préférez : cuisinez le curry dès le mardi, les jours du menu sont interchangeables.
- **Le hachis se prépare la veille** : il suffit de le réchauffer au four, environ 20 min.
- **Au réfrigérateur, 48 heures au plus** pour un plat fait maison, selon le ministère de l’Agriculture.
- **Plus d’idées** dans notre article sur le [batch cooking pas cher](/blog/batch-cooking-pas-cher).

@recettes soupe-petits-pois, chili-haricots, bolognaise-lentilles

@cta Organisez vos dîners de la semaine
`,
  faq: [
    ['Quel plat végétarien faire en hiver ?', `Les soupes-repas et les plats mijotés : velouté de courge et de lentilles corail, minestrone aux haricots blancs, hachis parmentier de lentilles ou curry de courge. Dans notre menu, ils coûtent de ${cost('poelee-chou')} à ${cost('curry-courge-haricots')} la portion, ingrédients seuls.`],
    ['Quels légumes sont de saison en hiver ?', 'En décembre, l’Ademe cite notamment le chou, le poireau, la carotte, le céleri, l’endive, la courge, le panais et la mâche. La pomme de terre et l’oignon se trouvent presque toute l’année.'],
    ['Comment avoir assez de protéines dans un menu végétarien d’hiver ?', 'Mettez des légumes secs dans la plupart des dîners : lentilles, haricots blancs, pois chiches. Manger Bouger conseille d’en manger au moins deux fois par semaine.'],
    ['Combien coûte un repas végétarien par personne ?', `Dans notre menu d’hiver, il revient à ${portion} la portion en moyenne, ingrédients seuls. En caisse, comptez ${money(sansPlacard)} pour les 5 dîners pour 2, si vous avez déjà l’huile, le sel et les épices.`],
    ['Peut-on congeler une soupe ou un plat mijoté ?', 'Oui, en portions refroidies et datées. Ce qui ne sera pas mangé dans les 48 heures part au congélateur le jour même.'],
  ],
  sources: [
    ['Fruits et légumes de saison, mois par mois (Impact CO₂, Ademe)', 'https://impactco2.fr/outils/fruitsetlegumes'],
    ['Augmenter les légumes secs (Manger Bouger, Santé publique France)', 'https://www.mangerbouger.fr/l-essentiel/les-recommandations-sur-l-alimentation-l-activite-physique-et-la-sedentarite/augmenter/augmenter-les-legumes-secs'],
    ['Les bonnes pratiques de la congélation (ministère de l’Agriculture)', 'https://agriculture.gouv.fr/les-bonnes-pratiques-de-la-congelation'],
  ],
} satisfies Article;
