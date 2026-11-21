import type { Article } from '@/lib/blog-articles';
import { amountPrice, cost, kiloPrice, packPrice } from '@/lib/blog-cost';
import { ingredients } from '@/lib/catalog';
import { findRecipe, portionCost } from '@/lib/seo';

// Les 5 recettes du catalogue (lib/catalog.ts) avec des haricots blancs, pour 2 personnes.
// Coûts, temps et grammes sont lus dans le catalogue : rien n'est écrit en dur.
const HARICOTS = ['poelee-blanche', 'tartines-haricots', 'poelee-chou', 'minestrone-haricots', 'curry-courge-haricots'];
const AVEC: Record<string, string> = {
  'poelee-blanche': 'tomate, ail, pain grillé',
  'tartines-haricots': 'pain, tomate fraîche, citron',
  'poelee-chou': 'chou, pommes de terre',
  'minestrone-haricots': 'pâtes, légumes, chou',
  'curry-courge-haricots': 'courge, lait de coco, riz',
};
const recette = (id: string) => {
  const r = findRecipe(id);
  if (!r) throw new Error(`Recette ${id} absente : revoir /blog/recettes-haricots-blancs.`);
  return r;
};
const grammes = (id: string) => {
  const x = recette(id).ingredients.find(y => y.id === 'white-beans');
  if (!x) throw new Error(`Plus de haricots blancs dans ${id} : revoir /blog/recettes-haricots-blancs.`);
  return x.qty;
};
const parPortion = (id: string) => portionCost(recette(id));
const tries = [...HARICOTS].sort((a, b) => parPortion(a) - parPortion(b));
const boite = ingredients.find(i => i.id === 'white-beans');
if (!boite || boite.unit !== 'g') throw new Error('Haricots blancs absents du catalogue : revoir /blog/recettes-haricots-blancs.');
// Le texte dit : une boîte de 530 g ; 250 g pour 2 dans 4 recettes (une demi-boîte), une boîte presque entière dans la poêlée à la tomate.
if (boite.pack !== 530) throw new Error('La boîte de haricots blancs ne fait plus 530 g : revoir /blog/recettes-haricots-blancs.');
if (!HARICOTS.filter(id => id !== 'poelee-blanche').every(id => grammes(id) === 250)) throw new Error('Les recettes n’utilisent plus 250 g de haricots pour 2 : revoir /blog/recettes-haricots-blancs.');
if (grammes('poelee-blanche') !== 500) throw new Error('La poêlée à la tomate n’utilise plus 500 g : revoir /blog/recettes-haricots-blancs.');
// Le texte dit que la poêlée de chou est la moins chère et que les deux plats en 15 min sont les plus rapides.
if (tries[0] !== 'poelee-chou') throw new Error('La poêlée de chou n’est plus la moins chère : revoir /blog/recettes-haricots-blancs.');
const rapide = Math.min(...HARICOTS.map(id => recette(id).minutes));
if (recette('poelee-blanche').minutes !== rapide || recette('tartines-haricots').minutes !== rapide) throw new Error('Les recettes en 15 min ont changé : revoir /blog/recettes-haricots-blancs.');
const moinsCher = cost(tries[0]);
const plusCher = cost(tries[tries.length - 1]);

const tableau = tries.map(id => `| [${recette(id).title}](/recettes/${id}) | ${AVEC[id]} | ${recette(id).minutes} min | ${cost(id)} |`).join('\n');

export default {
  slug: 'recettes-haricots-blancs',
  title: 'Recettes de haricots blancs en conserve : 5 dîners pas chers avec une boîte',
  seoTitle: 'Recette haricots blancs en conserve : 5 dîners pas chers',
  description: 'Recettes de haricots blancs en conserve : à la tomate, en tartines, en poêlée, en minestrone ou en curry. Coût par portion et idées pour finir la boîte.',
  lead: `Nos 5 recettes de haricots blancs en conserve coûtent de ${moinsCher} à ${plusCher} la portion. Une boîte de 530 g (${packPrice('white-beans')}) fait 2 dîners pour 2 : les haricots sont déjà cuits, il suffit de les égoutter, puis de les réchauffer ou de les écraser.`,
  category: 'Recettes',
  keywords: ['recette haricots blancs en conserve', 'recettes haricots blancs', 'haricots blancs en conserve froids', 'que faire avec des haricots blancs en boîte', 'haricots blancs à la tomate', 'faut-il rincer les haricots blancs en conserve', 'recette haricots blancs pas cher', 'haricots blancs secs ou en conserve'],
  date: '2026-11-21',
  coverAlt: 'Recette de haricots blancs en conserve pas chère : une poêle de haricots blancs à la tomate, une boîte de conserve et des tartines',
  body: `
@essentiel
- **5 dîners aux haricots blancs**, de ${moinsCher} à ${plusCher} la portion.
- **Une boîte de 530 g** fait 2 dîners pour 2 dans 4 de nos recettes.
- **En conserve, ils sont déjà cuits** : égouttez, puis réchauffez ou écrasez.
- **Les plus rapides** se font en ${rapide} min.

@chiffres ${packPrice('white-beans')} | la boîte de haricots blancs ; ${moinsCher} | la portion la moins chère ; ${rapide} min | pour les recettes les plus rapides

## Que faire avec des haricots blancs en boîte ?

@recette poelee-blanche | La sauce tomate à l’ail mijote 5 min, puis les haricots y chauffent 5 min. À servir avec du pain grillé et du persil. Il faut presque toute la boîte.

@recette tartines-haricots | Les haricots écrasés avec du citron, de l’huile et un peu d’ail, sous des dés de tomate. Rien à cuire, à part le pain.

@recette poelee-chou | Du chou, des pommes de terre et une demi-boîte de haricots, relevés au paprika. La moins chère des cinq.

@cta-court Une demi-boîte de haricots attend au frigo ? Notez-la dans VégéBudget : il en tient compte pour choisir vos dîners de la semaine et ne met sur la liste de courses que ce qui manque.

@recette minestrone-haricots | Une soupe-repas avec des pâtes, des carottes, du chou et des pommes de terre. Le lendemain, ajoutez un peu d’eau en la réchauffant : les pâtes boivent le bouillon.

@recette curry-courge-haricots | La courge cuit dans le lait de coco et le curry, puis on ajoute les haricots à la fin. À servir sur du riz.

## Combien coûte une recette de haricots blancs en conserve ?

| Recette | Avec | Temps | Coût par portion |
|---|---|---|---|
${tableau}

Coût estimé des ingrédients, prix relevés le 7 octobre 2026 sur carrefour.fr, marques distributeur, hors promotions. Ce n’est pas le montant payé en caisse : vous achetez des paquets entiers, dont une partie sert à d’autres repas.

Les haricots eux-mêmes coûtent ${kiloPrice('white-beans')} égouttés, soit ${amountPrice('white-beans', 125)} pour les 125 g d’une portion. Pour comparer les boîtes entre elles, regardez le [prix au kilo](/blog/comparer-prix-au-kilo) du poids égoutté.

## Comment finir une boîte de haricots blancs entamée ?

![Haricots blancs à la tomate sur du pain grillé](/images/recettes/poelee-blanche.jpg "Haricots blancs à la tomate : une boîte presque entière pour 2.")

Quatre de nos recettes prennent 250 g pour 2, soit environ la moitié d’une boîte. Prévoyez le deuxième dîner dans la semaine :

- **Lundi, la poêlée de chou** ; plus tard, les tartines avec le reste.
- **Une soupe le week-end** : le minestrone utilise aussi le chou entamé.
- **Gardez le reste au frais**, dans une boîte fermée, et respectez la durée indiquée sur l’étiquette après ouverture.

Il reste du chou ? Voyez nos [recettes de chou blanc](/blog/recette-chou-blanc-pas-cher).

## Faut-il rincer les haricots blancs en conserve ?

Dans nos recettes, on les égoutte toujours, et on les rince aussi pour le minestrone et le curry : versez-les dans une passoire, passez-les sous l’eau froide, puis égouttez. Ils sont déjà cuits : quelques minutes dans la sauce suffisent pour les réchauffer.

**Et froids ?** Puisqu’ils sont cuits, ils se mangent aussi froids : c’est le cas dans nos [tartines aux haricots blancs](/recettes/tartines-haricots), écrasés au citron.

> Vous préférez les haricots secs ? Comptez une nuit de trempage et 1 h à 2 h de cuisson selon l’Ademe. Tous les temps sont dans notre article sur la [cuisson des légumes secs](/blog/cuisson-legumes-secs).

## Les haricots blancs peuvent-ils remplacer la viande ?

Les haricots blancs sont des légumes secs, comme les lentilles et les pois chiches. Manger Bouger conseille d’en manger au moins 2 fois par semaine. Ils prennent la place de la viande dans une sauce tomate ou une soupe ; d’autres idées dans notre article pour [remplacer la viande sans dépenser plus](/blog/remplacer-la-viande-pas-cher), et nos [recettes de pois chiches](/blog/recettes-pois-chiches).

@recettes poelee-blanche, poelee-chou, curry-courge-haricots

@cta Organisez les dîners de la semaine selon votre budget
`,
  faq: [
    ['Faut-il rincer les haricots blancs en conserve ?', 'Dans nos recettes, on les égoutte toujours, et on les rince aussi pour le minestrone et le curry : passez-les sous l’eau froide dans une passoire, puis égouttez. Ils sont déjà cuits : quelques minutes dans la sauce suffisent pour les réchauffer.'],
    ['Combien de haricots blancs par personne ?', 'Dans nos recettes, 125 g de haricots égouttés par personne, soit 250 g pour 2 : environ la moitié d’une boîte de 530 g.'],
    ['Quelle est la recette de haricots blancs la moins chère ?', `Dans notre catalogue, la poêlée de chou, de pommes de terre et de haricots : ${cost('poelee-chou')} la portion, coût estimé des ingrédients avec les prix relevés le 7 octobre 2026 sur carrefour.fr.`],
    ['Les haricots blancs en conserve se mangent-ils froids ?', 'Oui, ils sont déjà cuits : après les avoir rincés et égouttés, vous pouvez les écraser en tartinade ou les ajouter à une salade.'],
    ['Haricots blancs secs ou en conserve ?', 'Les secs demandent une nuit de trempage et 1 h à 2 h de cuisson, selon l’Ademe. En conserve, ils sont déjà cuits : c’est le plus simple pour un dîner de semaine.'],
  ],
  sources: [
    ['Augmenter les légumes secs (Manger Bouger, Santé publique France)', 'https://www.mangerbouger.fr/l-essentiel/les-recommandations-sur-l-alimentation-l-activite-physique-et-la-sedentarite/augmenter/augmenter-les-legumes-secs'],
    ['Les légumes secs aux petits oignons, infographie (Ademe)', 'https://librairie.ademe.fr/cadic/7383/infographie-legumes-secs-202209.pdf'],
  ],
} satisfies Article;
