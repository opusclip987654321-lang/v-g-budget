import type { Article } from '@/lib/blog-articles';
import { cost, packPrice } from '@/lib/blog-cost';
import { ingredients } from '@/lib/catalog';
import { findRecipe, portionCost } from '@/lib/seo';

// Les 6 dîners légers de l'article : soupes-repas, salades complètes et tartines (lib/catalog.ts, pour 2 personnes).
// Coûts et temps sont lus dans le catalogue : rien n'est écrit en dur.
const LEGERS = ['soupe-petits-pois', 'salade-lentilles', 'courge-lentilles', 'tartines-haricots', 'minestrone-haricots', 'coleslaw-pois-chiches'];
const AVEC: Record<string, string> = {
  'soupe-petits-pois': 'petits pois, pommes de terre, pain',
  'salade-lentilles': 'lentilles vertes, pommes de terre, carotte',
  'courge-lentilles': 'courge, lentilles corail',
  'tartines-haricots': 'pain, haricots blancs, tomate',
  'minestrone-haricots': 'légumes, pâtes, haricots blancs',
  'coleslaw-pois-chiches': 'chou, carotte, pois chiches, pain',
};
const recette = (id: string) => {
  const r = findRecipe(id);
  if (!r) throw new Error(`Recette ${id} absente : revoir /blog/diner-leger-pas-cher.`);
  return r;
};
const qte = (id: string, ing: string) => recette(id).ingredients.find(x => x.id === ing)?.qty ?? 0;
const pack = (ing: string) => {
  const i = ingredients.find(x => x.id === ing);
  if (!i) throw new Error(`Ingrédient ${ing} absent : revoir /blog/diner-leger-pas-cher.`);
  return i.pack;
};
const parPortion = (id: string) => portionCost(recette(id));
const tries = [...LEGERS].sort((a, b) => parPortion(a) - parPortion(b));
// Le texte dit que la soupe de petits pois est la moins chère des 6.
if (tries[0] !== 'soupe-petits-pois') throw new Error('La soupe de petits pois n’est plus la moins chère : revoir /blog/diner-leger-pas-cher.');
// Le texte dit que les 6 dîners coûtent moins de 1,50 € la portion.
if (parPortion(tries[tries.length - 1]) >= 1.5) throw new Error('Un dîner léger dépasse 1,50 € la portion : revoir /blog/diner-leger-pas-cher.');
const moinsCher = cost(tries[0]);
const plusCher = cost(tries[tries.length - 1]);
const rapide = Math.min(...LEGERS.map(id => recette(id).minutes));
const lent = Math.max(...LEGERS.map(id => recette(id).minutes));
// Le texte dit : les tartines sont les plus rapides, le minestrone le plus long.
if (recette('tartines-haricots').minutes !== rapide) throw new Error('Les tartines ne sont plus les plus rapides : revoir /blog/diner-leger-pas-cher.');
if (recette('minestrone-haricots').minutes !== lent) throw new Error('Le minestrone n’est plus le plus long : revoir /blog/diner-leger-pas-cher.');
// Le texte dit : une boîte de haricots blancs sert aux tartines et au minestrone ; un chou sert au coleslaw et au minestrone.
if (qte('tartines-haricots', 'white-beans') + qte('minestrone-haricots', 'white-beans') > pack('white-beans')) throw new Error('Une boîte de haricots blancs ne suffit plus pour 2 dîners : revoir /blog/diner-leger-pas-cher.');
if (qte('coleslaw-pois-chiches', 'cabbage') + qte('minestrone-haricots', 'cabbage') >= pack('cabbage')) throw new Error('Un chou ne suffit plus pour 2 dîners : revoir /blog/diner-leger-pas-cher.');
// Le texte dit : chacun des 6 dîners contient des lentilles, des haricots, des pois chiches ou des petits pois.
const LEGUMES_SECS = ['green-lentils', 'red-lentils', 'white-beans', 'chickpeas'];
for (const id of LEGERS) if (!recette(id).ingredients.some(x => LEGUMES_SECS.includes(x.id) || x.id === 'peas')) throw new Error(`${id} n’a plus de légumineuse ni de petits pois : revoir /blog/diner-leger-pas-cher.`);
// Le texte dit : les tartines et la soupe de petits pois ont du pain ; la soupe de petits pois n’a pas de légumes secs (les petits pois comptent comme légumes).
for (const id of ['tartines-haricots', 'soupe-petits-pois']) if (!recette(id).ingredients.some(x => x.id === 'bread')) throw new Error(`${id} n’a plus de pain : revoir /blog/diner-leger-pas-cher.`);
if (recette('soupe-petits-pois').ingredients.some(x => LEGUMES_SECS.includes(x.id))) throw new Error('La soupe de petits pois contient des légumes secs : revoir /blog/diner-leger-pas-cher.');
// Le texte dit : la salade de lentilles et le coleslaw se préparent à l’avance.
for (const id of ['salade-lentilles', 'coleslaw-pois-chiches']) if (!recette(id).tags.includes('À préparer en avance')) throw new Error(`${id} n’est plus « à préparer en avance » : revoir /blog/diner-leger-pas-cher.`);

// Le texte dit : trois soupes, deux salades et des tartines.
const parCategorie = (c: string) => LEGERS.filter(id => recette(id).category === c).length;
if (parCategorie('Soupes') !== 3 || parCategorie('Salades') !== 2) throw new Error('Il n’y a plus trois soupes et deux salades : revoir /blog/diner-leger-pas-cher.');

const tableau = tries.map(id => `| [${recette(id).title}](/recettes/${id}) | ${AVEC[id]} | ${recette(id).minutes} min | ${cost(id)} |`).join('\n');

export default {
  slug: 'diner-leger-pas-cher',
  title: 'Repas léger du soir pas cher : 6 dîners sans viande à moins de 1,50 €',
  seoTitle: 'Repas léger du soir pas cher : 6 dîners sans viande',
  description: `Repas léger du soir pas cher : soupes, salades et tartines sans viande, de ${moinsCher} à ${plusCher} la portion, prêtes en ${rapide} à ${lent} min.`,
  lead: `Un repas léger du soir pas cher, c’est une soupe, une salade ou des tartines avec des légumes et des légumes secs : nos 6 dîners sans viande coûtent de ${moinsCher} à ${plusCher} la portion. Ils sont prêts en ${rapide} à ${lent} min.`,
  category: 'Recettes',
  keywords: ['repas léger du soir pas cher', 'dîner léger pas cher', 'idée repas léger soir sans viande', 'dîner léger végétarien', 'repas du soir sans viande', 'dîner léger rapide'],
  date: '2026-11-24',
  coverAlt: 'Repas léger du soir pas cher : un bol de soupe de petits pois, des tartines à la tomate et une petite salade',
  body: `
@essentiel
- **6 dîners légers sans viande**, de ${moinsCher} à ${plusCher} la portion.
- **Soupe, salade ou tartines**, toujours avec des lentilles, des haricots, des pois chiches ou des petits pois.
- **Prêts en ${rapide} à ${lent} min** : trois soupes, deux salades et des tartines.
- **Une boîte de haricots blancs** sert à deux de ces dîners.

@chiffres ${moinsCher} | la portion de soupe de petits pois ; ${rapide} min | pour les tartines aux haricots ; 2 fois | par semaine pour les légumes secs, conseil de Manger Bouger

## Quel repas léger du soir pour moins de 1,50 € ?

@recette soupe-petits-pois | Les pommes de terre et les petits pois surgelés cuisent dans une seule casserole, puis on mixe. Avec du pain grillé, c’est le moins cher des six.

@recette tartines-haricots | Les haricots blancs sont écrasés avec du citron, de l’huile et de l’ail, puis étalés sur du pain grillé avec des dés de tomate. Le plus rapide.

@recette salade-lentilles | Des lentilles vertes, des pommes de terre et une carotte, avec une sauce citron et moutarde. Elle se prépare à l’avance.

@cta-court Une soupe lundi, des tartines mardi : VégéBudget compose vos dîners sans viande de la semaine selon votre budget et vous donne la liste de courses.

@recette courge-lentilles | La courge et les lentilles corail cuisent ensemble environ 20 min avec un peu de curry, puis on mixe. Un velouté épais, dans une seule casserole.

@recette minestrone-haricots | Une soupe-repas de légumes avec des pâtes et des haricots blancs. Elle se réchauffe le lendemain avec un peu d’eau.

@recette coleslaw-pois-chiches | Du chou émincé, des carottes râpées, des pois chiches et une sauce au yaourt. Les croûtons s’ajoutent au dernier moment.

## Combien coûte un dîner léger sans viande ?

| Recette | Avec | Temps | Coût par portion |
|---|---|---|---|
${tableau}

Coût estimé des ingrédients, prix relevés le 7 octobre 2026 sur carrefour.fr, marques distributeur, hors promotions. Ce n’est pas le montant payé en caisse : vous achetez des paquets entiers, qui servent aussi à d’autres repas.

## Une soupe suffit-elle pour le dîner ?

Oui, si elle contient de quoi faire un repas. C’est le cas de nos trois soupes : la soupe de petits pois contient des pommes de terre et se mange avec du pain, le velouté de courge contient des lentilles corail, et le minestrone des pâtes et des haricots. Pour une soupe de légumes seule, ajoutez du pain ou une poignée de légumes secs : la méthode et la conservation sont dans notre guide de la [soupe maison pas chère](/blog/soupe-maison-pas-chere).

Manger Bouger conseille des légumes secs au moins 2 fois par semaine, et Santé publique France au moins un féculent complet par jour. Le dîner léger est un bon moment pour en manger. Plus d’idées dans nos [recettes de lentilles pas chères](/blog/recettes-lentilles-pas-cheres) et nos [recettes de pois chiches](/blog/recettes-pois-chiches).

## Soupe, salade ou tartines : que choisir selon la saison ?

![Minestrone aux haricots blancs, aux pâtes et aux légumes dans une assiette creuse](/images/recettes/minestrone-haricots.jpg "Le minestrone : légumes d’hiver, pâtes et haricots blancs.")

- **En hiver** : le velouté de courge, le minestrone et le coleslaw utilisent la courge, le chou, les carottes et les pommes de terre, de saison en décembre.
- **Toute l’année** : la soupe de petits pois surgelés et la salade tiède de lentilles.
- **En été** : le [taboulé de pois chiches](/recettes/taboule), avec tomate et concombre.

Le calendrier du mois est dans notre article sur les [fruits et légumes de décembre](/blog/fruits-legumes-decembre).

## Comment prévoir ses dîners légers de la semaine sans gaspiller ?

- **Une boîte de haricots blancs** (${packPrice('white-beans')}) suffit pour les tartines et le minestrone.
- **Un chou** (${packPrice('cabbage')}) sert au coleslaw et au minestrone, et il en reste.
- **La salade de lentilles et le coleslaw** se préparent la veille.
- **Le minestrone** se réchauffe le lendemain : ajoutez un peu d’eau, les pâtes boivent le bouillon.

> Pour les fins de mois serrées, voyez aussi [que manger avec peu d’argent](/blog/que-manger-fin-de-mois).

@recettes soupe-petits-pois, salade-lentilles, minestrone-haricots

@cta Préparez vos dîners légers en fonction de votre budget
`,
  faq: [
    ['Quel est le repas du soir le moins cher ?', `Parmi nos dîners légers, la soupe de petits pois avec ses tartines coûte ${moinsCher} la portion : coût estimé des ingrédients, prix relevés le 7 octobre 2026 sur carrefour.fr, marques distributeur, hors promotions.`],
    ['Quelle idée de repas léger le soir sans viande ?', 'Une soupe-repas (velouté de courge aux lentilles corail, minestrone aux haricots blancs), une salade complète (lentilles, pommes de terre, carotte) ou des tartines aux haricots blancs et à la tomate. Chacune contient des légumes secs.'],
    ['Que manger le soir quand on n’a pas très faim ?', `Des tartines aux haricots blancs et à la tomate, prêtes en ${rapide} min, ou une soupe de petits pois. La première contient des haricots blancs, la seconde des petits pois et des pommes de terre, avec du pain.`],
    ['Peut-on manger des féculents le soir ?', 'Oui. Santé publique France conseille de manger au moins un féculent complet par jour : prenez du pain complet pour la soupe ou les tartines, et des pâtes complètes pour le minestrone.'],
    ['Quel dîner léger préparer à l’avance ?', 'La salade tiède de lentilles et le coleslaw de chou et de pois chiches se préparent la veille. Le coleslaw se garde 2 jours au frais, sans les croûtons.'],
  ],
  sources: [
    ['Augmenter les légumes secs (Manger Bouger, Santé publique France)', 'https://www.mangerbouger.fr/l-essentiel/les-recommandations-sur-l-alimentation-l-activite-physique-et-la-sedentarite/augmenter/augmenter-les-legumes-secs'],
    ['Privilégier les féculents complets pour une alimentation saine (Santé publique France, sante.fr)', 'https://www.sante.fr/privilegier-les-feculents-complets-pour-une-alimentation-saine'],
    ['Fruits et légumes de saison, mois par mois (Impact CO₂, Ademe)', 'https://impactco2.fr/outils/fruitsetlegumes'],
  ],
} satisfies Article;
