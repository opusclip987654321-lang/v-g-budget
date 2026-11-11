import type { Article } from '@/lib/blog-articles';
import { cost, kiloPrice, packPrice } from '@/lib/blog-cost';
import { ingredients } from '@/lib/catalog';
import { findRecipe, portionCost } from '@/lib/seo';

// Les 7 recettes du catalogue (lib/catalog.ts) servies avec du riz, pour 2 personnes.
// Coûts, temps et grammes de riz sont lus dans le catalogue : rien n'est écrit en dur.
const RIZ = ['riz-saute', 'epinards-pois-chiches', 'curry-corail', 'bowl-arc-en-ciel', 'curry-courge-haricots', 'chili-haricots', 'tofu-cacahuete'];
const PROTEINE: Record<string, string> = {
  'riz-saute': 'petits pois',
  'epinards-pois-chiches': 'pois chiches',
  'curry-corail': 'lentilles corail',
  'bowl-arc-en-ciel': 'pois chiches',
  'curry-courge-haricots': 'haricots blancs',
  'chili-haricots': 'haricots rouges',
  'tofu-cacahuete': 'tofu',
};
const recette = (id: string) => {
  const r = findRecipe(id);
  if (!r) throw new Error(`Recette ${id} absente : revoir /blog/riz-vegetarien-pas-cher.`);
  return r;
};
const grammes = (id: string) => {
  const x = recette(id).ingredients.find(y => y.id === 'rice');
  if (!x) throw new Error(`Plus de riz dans ${id} : revoir /blog/riz-vegetarien-pas-cher.`);
  return x.qty;
};
const parPortion = (id: string) => portionCost(recette(id));
const tries = [...RIZ].sort((a, b) => parPortion(a) - parPortion(b));
const riz = ingredients.find(i => i.id === 'rice');
if (!riz || riz.unit !== 'g') throw new Error('Riz absent du catalogue : revoir /blog/riz-vegetarien-pas-cher.');
// Le texte dit que le riz sauté est le moins cher, le tofu le plus cher, et qu'on compte 70 à 80 g de riz cru par personne.
if (tries[0] !== 'riz-saute') throw new Error('Le riz sauté n’est plus le moins cher : revoir /blog/riz-vegetarien-pas-cher.');
if (tries[tries.length - 1] !== 'tofu-cacahuete') throw new Error('Le tofu n’est plus le plus cher : revoir /blog/riz-vegetarien-pas-cher.');
const parPersonne = RIZ.map(id => grammes(id) / 2);
if (Math.min(...parPersonne) !== 70 || Math.max(...parPersonne) !== 80) throw new Error('Les grammes de riz par personne ont changé : revoir /blog/riz-vegetarien-pas-cher.');
// Le texte dit qu'un paquet de riz fait au moins 6 dîners pour 2.
const diners = Math.floor(riz.pack / Math.max(...RIZ.map(grammes)));
if (diners < 6) throw new Error('Le paquet de riz fait moins de 6 dîners : revoir /blog/riz-vegetarien-pas-cher.');

const tableau = tries.map(id => `| [${recette(id).title}](/recettes/${id}) | ${PROTEINE[id]} | ${recette(id).minutes} min | ${cost(id)} |`).join('\n');

export default {
  slug: 'riz-vegetarien-pas-cher',
  title: 'Recettes de riz végétarien pas chères : 7 dîners et leur coût',
  seoTitle: 'Recette de riz végétarien pas chère : 7 dîners et leur coût',
  description: 'Recette de riz végétarien pas chère : riz sauté, curry, chili et bols sans viande, avec le coût par portion, les quantités et la conservation du riz cuit.',
  lead: `La recette de riz végétarien la moins chère de notre catalogue est le riz sauté aux petits pois : ${cost('riz-saute')} la portion, prêt en ${recette('riz-saute').minutes} min. Avec des lentilles, des pois chiches ou des haricots, le riz devient un dîner complet : nos 7 recettes coûtent de ${cost('riz-saute')} à ${cost('tofu-cacahuete')} la portion.`,
  category: 'Recettes',
  keywords: ['recette riz végétarien pas cher', 'recette riz pas cher', 'que faire avec du riz', 'idée repas riz soir', 'combien de riz par personne', 'combien de temps se garde le riz cuit au frigo'],
  date: '2026-11-11',
  coverAlt: 'Recette de riz végétarien pas chère : un paquet de riz, un bol de riz sauté aux petits pois et un bol de chili',
  body: `
@essentiel
- **Le moins cher** : le riz sauté aux petits pois, ${cost('riz-saute')} la portion.
- **Un dîner complet** : riz + légumineuse (lentilles, pois chiches, haricots) + un légume.
- **70 à 80 g de riz cru** par personne dans nos recettes, avec une légumineuse.
- **Riz cuit** : au réfrigérateur dans les 2 heures, conseille l’Anses.

@chiffres ${kiloPrice('rice')} | le riz au kilo ; ${cost('riz-saute')} | la portion de riz sauté ; 2 heures | pour mettre le riz cuit au frais, selon l’Anses

## Que faire avec du riz ce soir ? Nos idées de repas pas chères

Quatre dîners au riz de notre catalogue, avec le coût par portion sur chaque carte. Chacun associe le riz à une légumineuse et à un légume.

@recette riz-saute | Riz, petits pois, carotte et oignon, sautés à la sauce soja dans une seule poêle. Notre recette au riz la moins chère.

@recette epinards-pois-chiches | Des épinards surgelés et des pois chiches au cumin, servis sur le riz. Prête en ${recette('epinards-pois-chiches').minutes} min.

@recette curry-corail | Lentilles corail, tomates, épinards et lait de coco, sur un lit de riz. Un classique de nos [recettes de lentilles pas chères](/blog/recettes-lentilles-pas-cheres).

@recette chili-haricots | Haricots rouges, maïs, poivron et tomates, avec du riz. Des conserves, une casserole et ${recette('chili-haricots').minutes} min.

@cta-court Du riz dans le placard ? Notez-le dans VégéBudget : il compose vos dîners de la semaine selon votre budget et déduit ce riz de la liste de courses.

## Recette de riz végétarien pas chère : combien coûte un dîner ?

Nos 7 recettes servies avec du riz, de la moins chère à la plus chère :

| Recette pour 2 | Protéine | Temps | La portion |
|---|---|---|---|
${tableau}

Coût estimé des ingrédients : prix relevés le 7 octobre 2026 sur carrefour.fr, marques distributeur, hors promotions. En caisse, vous payez les paquets entiers.

Le riz lui-même coûte peu : ${packPrice('rice')}, et un paquet suffit pour au moins ${diners} de ces dîners pour 2. Pour savoir si le grand paquet vaut le coup face aux sachets cuisson, suivez notre méthode pour [comparer les prix au kilo](/blog/comparer-prix-au-kilo).

## Que mettre avec du riz pour un repas complet sans viande ?

- **Une légumineuse** : lentilles, pois chiches ou haricots, comme dans nos [recettes de pois chiches faciles](/blog/recettes-pois-chiches).
- **Un légume** : petits pois, épinards ou brocoli surgelés, sans rien à éplucher (voir nos [légumes surgelés](/blog/legumes-surgeles-prix)).
- **Une sauce** : sauce soja, tomate, lait de coco ou beurre de cacahuète.

![Riz sauté aux petits pois et aux carottes servi dans une assiette](/images/recettes/riz-saute.jpg "Le riz sauté : du riz, des petits pois, une carotte et de la sauce soja.")

## Combien de riz par personne ?

Nos recettes comptent 70 à 80 g de riz cru par personne quand le riz accompagne une légumineuse. Ajustez selon l’appétit : la légumineuse occupe déjà une bonne part de l’assiette.

> Le riz complet compte parmi les féculents complets : Santé publique France conseille d’en manger au moins un par jour, en commençant par du semi-complet si besoin.

## Combien de temps se garde le riz cuit au frigo ?

Pour le riz cuit, l’Anses insiste d’abord sur le refroidissement : laissez-le refroidir rapidement, puis mettez-le au réfrigérateur dans les 2 heures après la cuisson, dans une boîte fermée.

- **La raison** : la bactérie Bacillus cereus peut se multiplier dans un plat cuit laissé à température ambiante (Anses).
- **Pour le finir** : le riz de la veille sert de base au [riz sauté aux petits pois](/recettes/riz-saute).

Cuire une grande casserole de riz pour deux dîners fait gagner du temps ; notre article sur le [batch cooking pas cher](/blog/batch-cooking-pas-cher) montre comment organiser la séance.

## Trois autres dîners au riz

@recettes bowl-arc-en-ciel, curry-courge-haricots, tofu-cacahuete

@cta Préparez vos menus en fonction de votre budget
`,
  faq: [
    ['Quelle est la recette de riz végétarien la moins chère ?', `Dans nos recettes, c’est le riz sauté aux petits pois et aux carottes : ${cost('riz-saute')} la portion en ingrédients (prix relevés le 7 octobre 2026 sur carrefour.fr, hors promotions).`],
    ['Combien de grammes de riz par personne ?', 'Nos recettes comptent 70 à 80 g de riz cru par personne lorsqu’il est servi avec une légumineuse. C’est un repère, à ajuster selon l’appétit.'],
    ['Combien de temps peut-on garder du riz cuit ?', 'L’Anses conseille de refroidir rapidement les plats cuits et de les mettre au réfrigérateur dans les 2 heures, pour limiter le développement de Bacillus cereus. Gardez le riz dans une boîte fermée.'],
    ['Que faire avec du riz le soir quand on a un petit budget ?', `Un riz sauté aux petits pois, un curry de lentilles corail ou un chili de haricots rouges : dans nos recettes, un dîner au riz sans viande coûte de ${cost('riz-saute')} à ${cost('tofu-cacahuete')} la portion en ingrédients.`],
    ['Que mettre avec du riz pour un repas complet sans viande ?', 'Une légumineuse (lentilles, pois chiches, haricots) ou du tofu, un légume et une sauce : par exemple un curry de lentilles corail ou un chili de haricots rouges.'],
  ],
  sources: [
    ['Qu’est-ce que Bacillus cereus et comment s’en prémunir ? (Anses)', 'https://www.anses.fr/fr/content/qu-est-ce-que-bacillus-cereus-et-comment-s-en-premunir'],
    ['Privilégier les féculents complets pour une alimentation saine (Santé publique France, sante.fr)', 'https://www.sante.fr/privilegier-les-feculents-complets-pour-une-alimentation-saine'],
  ],
} satisfies Article;
