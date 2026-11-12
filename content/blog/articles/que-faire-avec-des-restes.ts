import type { Article } from '@/lib/blog-articles';
import { amountPrice, cost } from '@/lib/blog-cost';
import { findRecipe } from '@/lib/seo';

// Un reste (riz, pâtes, pain, pommes de terre, légumes) → un dîner du catalogue (lib/catalog.ts).
// La colonne « dont le reste » donne le prix de la part de cet ingrédient dans une portion :
// c'est ce que le reste remplace. Quantités lues dans le catalogue, rien en dur.
const recette = (id: string) => {
  const r = findRecipe(id);
  if (!r) throw new Error(`Recette ${id} absente : revoir /blog/que-faire-avec-des-restes.`);
  return r;
};
const part = (id: string, ingredient: string) => {
  const x = recette(id).ingredients.find(y => y.id === ingredient);
  if (!x) throw new Error(`Plus de ${ingredient} dans ${id} : revoir /blog/que-faire-avec-des-restes.`);
  return amountPrice(ingredient, x.qty / 2);
};
const LIGNES: [string, string, string][] = [
  ['Riz cuit', 'riz-saute', 'rice'],
  ['Pâtes cuites', 'minestrone-haricots', 'pasta'],
  ['Pain rassis', 'tartines-haricots', 'bread'],
  ['Pommes de terre cuites', 'salade-lentilles', 'potato'],
  ['Purée ou pommes de terre', 'hachis-lentilles', 'potato'],
  ['Courge entamée', 'courge-lentilles', 'squash'],
];
const tableau = LIGNES.map(([reste, id, ing]) => `| ${reste} | [${recette(id).title}](/recettes/${id}) | ${cost(id)} | ${part(id, ing)} |`).join('\n');
// Le texte dit que le pain sert aussi dans la soupe de petits pois et que le minestrone contient du chou.
part('soupe-petits-pois', 'bread');
part('minestrone-haricots', 'cabbage');

export default {
  slug: 'que-faire-avec-des-restes',
  title: 'Que faire avec des restes ? 6 dîners végétariens et leur coût',
  seoTitle: 'Que faire avec des restes ? 6 idées de dîners pas chers',
  description: 'Que faire avec des restes de riz, de pâtes, de pain ou de légumes ? 6 dîners végétariens avec leur coût par portion, et combien de temps garder les restes.',
  lead: `Que faire avec des restes ? Un riz cuit devient un riz sauté, du pain rassis des tartines, des pommes de terre une salade tiède ou un hachis, et les légumes fatigués une soupe. Mangez-les dans les 48 heures : c’est le délai conseillé par le ministère de l’Agriculture pour les restes de plats faits maison.`,
  category: 'Budget',
  keywords: ['que faire avec des restes', 'recette avec des restes', 'que faire avec un reste de riz', 'que faire avec des pâtes cuites', 'que faire avec du pain dur', 'que faire avec des restes de légumes', 'combien de temps garder des restes au frigo'],
  date: '2026-11-12',
  coverAlt: 'Que faire avec des restes : une boîte de riz aux petits pois, un pain rassis et un bol de soupe de légumes',
  body: `
@essentiel
- **Riz cuit** : un riz sauté aux petits pois, ${cost('riz-saute')} la portion.
- **Pain rassis** : des tartines grillées aux haricots blancs et à la tomate.
- **Pommes de terre et légumes** : une salade tiède, un hachis ou une soupe.
- **48 heures au plus** au réfrigérateur, après moins de 2 heures à température ambiante.

@chiffres ${cost('riz-saute')} | la portion de riz sauté ; 48 h | pour finir un reste, au plus ; 30 kg | jetés par personne et par an, selon l’Ademe

## Que faire avec des restes ? Une idée par aliment

Chaque ligne associe un reste à un dîner sans viande de notre catalogue. La dernière colonne donne ce que pèse cet ingrédient dans le prix d’une portion : c’est la part que votre reste remplace.

| Votre reste | Le dîner | La portion | Dont le reste |
|---|---|---|---|
${tableau}

Coût estimé des ingrédients : prix relevés le 7 octobre 2026 sur carrefour.fr, marques distributeur, hors promotions.

## Que faire avec un reste de riz ou de pâtes ?

@recette riz-saute | Le riz de la veille, des petits pois, une carotte et de la sauce soja, sautés à la poêle. Le grand classique des restes de riz.

@recette minestrone-haricots | Une soupe-repas de haricots blancs, de chou et de carottes : versez-y vos pâtes cuites en fin de cuisson, juste pour les réchauffer.

Pour savoir combien de temps se garde le riz cuit et pourquoi il faut le refroidir vite, lisez notre article sur les [recettes de riz végétarien pas chères](/blog/riz-vegetarien-pas-cher).

@cta-court Des pommes de terre, un chou entamé ou du pain à finir ? Indiquez-les dans VégéBudget : il les retire de votre liste de courses et choisit en priorité les dîners qui demandent le moins d’achats en plus.

## Que faire avec du pain dur ?

@recette tartines-haricots | Des haricots blancs écrasés au citron et à l’ail, des dés de tomate, sur du pain grillé. Un pain de la veille convient.

- **Avec une soupe** : grillé, il accompagne la [soupe de petits pois](/recettes/soupe-petits-pois) ou une [soupe maison pas chère](/blog/soupe-maison-pas-chere).
- **En croûtons** : coupé en dés et doré à la poêle avec un peu d’huile, il garnit une salade.

![Tartines de pain grillé aux haricots blancs écrasés et aux dés de tomate](/images/recettes/tartines-haricots.jpg "Les tartines aux haricots blancs, pour finir le pain.")

## Que faire avec des restes de légumes ou de pommes de terre ?

@recette hachis-lentilles | Des lentilles vertes à la tomate sous une purée de pommes de terre, pour finir un reste de purée.

@recette salade-lentilles | Lentilles, pommes de terre et carotte au citron et à la moutarde : des pommes de terre déjà cuites raccourcissent la cuisson.

@recette courge-lentilles | Un morceau de courge entamée et des lentilles corail, mixés en velouté. Une carotte un peu molle peut remplacer une partie de la courge.

## Combien de temps garder les restes au frigo ?

Le ministère de l’Agriculture donne deux repères pour les restes de plats faits maison :

- **Moins de 2 heures** à température ambiante : ne laissez pas un plat chaud refroidir plus longtemps avant de le mettre au frais.
- **48 heures au plus** au réfrigérateur : mangez-les le plus vite possible.
- **Au-delà** : congelez le reste le jour même, en portions datées, comme dans notre [batch cooking pas cher](/blog/batch-cooking-pas-cher).

> D’après l’Ademe, chacun jette environ 30 kg de nourriture par an à la maison, dont 7 kg encore emballés. Nos 10 habitudes pour [réduire le gaspillage alimentaire](/blog/gaspillage-alimentaire) complètent ces idées.

Pour avoir moins de restes la prochaine fois :

- **Cuisiner la bonne quantité** : nos recettes indiquent les grammes pour 2, à ajuster selon le nombre de personnes.
- **Prévoir les dîners de la semaine** : un menu évite d’acheter en double ce qui attend déjà au réfrigérateur.
- **Finir le placard en fin de mois** : voir nos [dîners de placard pas chers](/blog/que-manger-fin-de-mois).

## Quelles autres recettes avec des restes ?

@recettes poelee-chou, pates-brocoli, soupe-petits-pois

@cta Tenez compte de ce que vous avez déjà
`,
  faq: [
    ['Combien de temps se gardent les restes au réfrigérateur ?', 'Le ministère de l’Agriculture conseille de consommer les restes de plats faits maison le plus vite possible, en 48 heures au plus. Au-delà, congelez-les le jour même.'],
    ['Peut-on mettre un plat encore chaud au réfrigérateur ?', 'Ne laissez pas un plat chaud plus de 2 heures à température ambiante, conseille le ministère de l’Agriculture. Pour qu’il refroidisse plus vite, répartissez-le dans de petites boîtes.'],
    ['Que faire avec un reste de riz cuit ?', `Un riz sauté aux petits pois et aux carottes, vite fait à la poêle : dans nos recettes, il coûte ${cost('riz-saute')} la portion en ingrédients, et votre reste remplace le riz du paquet.`],
    ['Que faire avec du pain dur le soir ?', 'Des tartines grillées aux haricots blancs et à la tomate, du pain grillé pour accompagner une soupe, ou des croûtons dorés à la poêle pour une salade.'],
    ['Que faire avec des pâtes cuites en trop ?', 'Ajoutez-les en fin de cuisson dans une soupe-repas comme le minestrone aux haricots blancs, ou réchauffez-les à la poêle avec des légumes et des pois chiches.'],
  ],
  sources: [
    ['Cuisiner fait maison : comment éviter les intoxications alimentaires (ministère de l’Agriculture)', 'https://agriculture.gouv.fr/cuisiner-fait-maison-comment-eviter-les-intoxications-alimentaires'],
    ['Les bonnes pratiques de la congélation (ministère de l’Agriculture)', 'https://agriculture.gouv.fr/les-bonnes-pratiques-de-la-congelation'],
    ['Comment traquer le gaspillage alimentaire ? (Ademe)', 'https://librairie.ademe.fr/dechets-economie-circulaire/5795-comment-traquer-le-gaspillage-alimentaire-.html'],
  ],
} satisfies Article;
