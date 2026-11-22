import type { Article } from '@/lib/blog-articles';
import { cost, packPrice } from '@/lib/blog-cost';
import { recipes } from '@/lib/catalog';
import { findRecipe, portionCost } from '@/lib/seo';

// Les 6 dîners de l'article : une poêle et une casserole suffisent (étapes de lib/catalog.ts, pour 2 personnes).
// Coûts et temps sont lus dans le catalogue : rien n'est écrit en dur.
const SANS_FOUR = ['riz-saute', 'semoule-pois', 'epinards-pois-chiches', 'pates-brocoli', 'poelee-chou', 'galettes-lentilles'];
const AVEC: Record<string, string> = {
  'riz-saute': 'riz, petits pois, carotte',
  'semoule-pois': 'semoule, petits pois, pois chiches',
  'epinards-pois-chiches': 'épinards surgelés, pois chiches, riz',
  'pates-brocoli': 'pâtes, brocoli, pois chiches',
  'poelee-chou': 'chou, pommes de terre, haricots',
  'galettes-lentilles': 'lentilles vertes, carotte, flocons',
};
const recette = (id: string) => {
  const r = findRecipe(id);
  if (!r) throw new Error(`Recette ${id} absente : revoir /blog/repas-sans-four.`);
  return r;
};
const avecFour = (steps: string[]) => /\bfour\b/i.test(steps.join(' '));
// Le texte dit : aucune de ces 6 recettes ne passe au four.
for (const id of SANS_FOUR) if (avecFour(recette(id).steps)) throw new Error(`${id} passe au four : revoir /blog/repas-sans-four.`);
// Le texte dit : tout le catalogue sauf 3 plats se fait sans four.
const auFour = recipes.filter(r => avecFour(r.steps)).length;
if (auFour !== 3) throw new Error(`Le catalogue compte ${auFour} recettes au four (3 attendues) : revoir /blog/repas-sans-four.`);
const sansFour = recipes.length - auFour;
// Le texte dit qu’en décochant « Four », l’appli écarte ces recettes : le planificateur filtre la catégorie « Au four » (isEligible).
if (recipes.some(r => avecFour(r.steps) !== (r.category === 'Au four'))) throw new Error('Catégorie « Au four » et étapes au four ne correspondent plus : revoir /blog/repas-sans-four.');
const parPortion = (id: string) => portionCost(recette(id));
const tries = [...SANS_FOUR].sort((a, b) => parPortion(a) - parPortion(b));
// Le texte dit que le riz sauté est le moins cher des 6.
if (tries[0] !== 'riz-saute') throw new Error('Le riz sauté n’est plus le moins cher : revoir /blog/repas-sans-four.');
const moinsCher = cost(tries[0]);
const plusCher = cost(tries[tries.length - 1]);
const rapide = Math.min(...SANS_FOUR.map(id => recette(id).minutes));
const lent = Math.max(...SANS_FOUR.map(id => recette(id).minutes));
const RAPIDES = ['semoule-pois', 'epinards-pois-chiches', 'pates-brocoli'];
if (SANS_FOUR.filter(id => recette(id).minutes === rapide).join() !== RAPIDES.join()) throw new Error('Les recettes les plus rapides ont changé : revoir /blog/repas-sans-four.');
if (recette('galettes-lentilles').minutes !== lent) throw new Error('Les galettes ne sont plus les plus longues : revoir /blog/repas-sans-four.');

const tableau = tries.map(id => `| [${recette(id).title}](/recettes/${id}) | ${AVEC[id]} | ${recette(id).minutes} min | ${cost(id)} |`).join('\n');

export default {
  slug: 'repas-sans-four',
  title: 'Repas sans four : 6 dîners pas chers avec une poêle et une casserole',
  seoTitle: 'Repas sans four : 6 dîners pas chers à la poêle',
  description: `Repas sans four : 6 dîners sans viande à la poêle et à la casserole, de ${moinsCher} à ${plusCher} la portion, prêts en ${rapide} à ${lent} min. Idées et matériel.`,
  lead: `Un repas sans four se prépare très bien avec une poêle et une casserole : nos 6 dîners sans viande coûtent de ${moinsCher} à ${plusCher} la portion et sont prêts en ${rapide} à ${lent} min. Riz sauté, pâtes, poêlées et galettes : rien ne passe au four.`,
  category: 'Recettes',
  keywords: ['repas sans four', 'idée repas sans four', 'repas sans four pas cher', 'recette à la poêle facile', 'repas sans four étudiant', 'cuisiner sans four', 'dîner sans four végétarien'],
  date: '2026-11-22',
  coverAlt: 'Repas sans four : une poêle de riz sauté aux petits pois et une casserole sur des plaques de cuisson',
  body: `
@essentiel
- **6 dîners sans four**, de ${moinsCher} à ${plusCher} la portion.
- **Une poêle et une casserole** suffisent pour chacun.
- **Prêts en ${rapide} à ${lent} min**, avec des produits du placard et du rayon surgelés.
- **${sansFour} de nos ${recipes.length} recettes** se font sans four.

@chiffres ${moinsCher} | la portion de riz sauté ; ${rapide} min | pour les plus rapides ; 2 ustensiles | une poêle, une casserole

## Quelles idées de repas sans four pas chers ?

@recette riz-saute | Une recette facile à la poêle : le riz cuit dans la casserole pendant que l’oignon et la carotte reviennent dans la poêle, puis les petits pois cuisent à couvert. On ajoute le riz et la sauce soja, puis on fait sauter 3 min en mélangeant. Le moins cher des six.

@recette semoule-pois | Carottes et petits pois cuits à l’eau, semoule préparée selon le paquet, puis pois chiches, huile et cumin. Pas besoin de poêle.

@recette epinards-pois-chiches | L’oignon revient dans la poêle, puis les épinards surgelés cuisent à couvert avec le cumin. On ajoute les pois chiches et on sert sur du riz.

@cta-court Pas de four chez vous ? Dans VégéBudget, décochez « Four » dans le matériel de cuisine : les dîners de la semaine se font sur les plaques, dans votre budget, liste de courses comprise.

@recette pates-brocoli | Le brocoli cuit avec les pâtes, 5 min avant la fin. Dans la poêle, de l’ail et des pois chiches ; un filet de citron pour finir.

@recette poelee-chou | Les pommes de terre précuisent dans l’eau, puis rejoignent le chou et les haricots blancs dans la poêle, avec du paprika.

@recette galettes-lentilles | Les lentilles vertes cuisent dans la casserole, puis on les écrase avec la carotte râpée et des flocons d’avoine. Les galettes cuisent à la poêle, 4 min de chaque côté.

## Combien coûte un repas sans four ?

| Recette | Avec | Temps | Coût par portion |
|---|---|---|---|
${tableau}

Coût estimé des ingrédients, prix relevés le 7 octobre 2026 sur carrefour.fr, marques distributeur, hors promotions. Ce n’est pas le montant payé en caisse : vous achetez des paquets entiers, dont une partie sert à d’autres repas.

Le riz (${packPrice('rice')}), les pâtes (${packPrice('pasta')}) et la semoule (${packPrice('couscous')}) servent à plusieurs de ces dîners : un seul paquet tient plusieurs soirs. Plus d’idées dans nos [recettes de riz végétarien](/blog/riz-vegetarien-pas-cher) et nos [recettes de pâtes pas chères](/blog/recettes-pates-pas-cheres).

## Peut-on cuisiner sans four ? Le matériel qu’il faut

Oui : ${sansFour} de nos ${recipes.length} recettes se font sur le feu, sans jamais allumer le four.

![Riz sauté aux petits pois et aux carottes dans une assiette](/images/recettes/riz-saute.jpg "Le riz sauté : une casserole pour le riz, une poêle pour les légumes.")

- **Une grande poêle avec couvercle** : pour faire revenir les légumes et cuire à couvert les petits pois ou les épinards.
- **Une casserole moyenne** : pour le riz, les pâtes, les lentilles ou les pommes de terre.
- **Une passoire** : pour égoutter les pâtes et rincer les conserves.
- **Une fourchette ou un presse-purée** : pour écraser les lentilles des galettes.

Deux feux suffisent : la casserole et la poêle peuvent chauffer en même temps.

## Repas sans four pour étudiants : par où commencer ?

Commencez par les dîners qui partent du placard : riz, semoule, pâtes, conserves de pois chiches et légumes surgelés se gardent longtemps. Le riz sauté et la semoule aux petits pois sont un bon début : 4 étapes chacun, sans rien à former ni à retourner.

> Pour la liste de courses complète, voyez notre [liste de courses étudiant pas chère](/blog/liste-courses-etudiant), et pour les jours serrés, [que manger en fin de mois](/blog/que-manger-fin-de-mois).

## Peut-on remplacer la viande dans un repas sans four ?

Oui : ici, ce sont les pois chiches, les haricots et les lentilles qui la remplacent. Manger Bouger conseille des légumes secs au moins 2 fois par semaine. Les pois chiches et les haricots en conserve sont déjà cuits : il suffit de les réchauffer dans la poêle. Plus d’idées dans nos [recettes de pois chiches](/blog/recettes-pois-chiches) et nos [recettes de lentilles pas chères](/blog/recettes-lentilles-pas-cheres).

@recettes riz-saute, pates-brocoli, poelee-chou

@cta Organisez vos dîners de la semaine, même sans four
`,
  faq: [
    ['Peut-on cuisiner tous ses dîners sans four ?', `Oui. Dans notre catalogue, ${sansFour} recettes sur ${recipes.length} se font sur les plaques de cuisson : riz sauté, pâtes, poêlées, soupes, currys et galettes.`],
    ['Combien coûte un repas sans four ?', `Nos 6 dîners sans four coûtent de ${moinsCher} à ${plusCher} la portion : coût estimé des ingrédients, prix relevés le 7 octobre 2026 sur carrefour.fr, marques distributeur, hors promotions.`],
    ['Quel est le repas sans four le plus rapide ?', `La semoule aux petits pois, la poêlée d’épinards et de pois chiches et les pâtes au brocoli sont prêtes en ${rapide} min.`],
    ['Quelle recette facile à la poêle pour remplacer le four ?', 'Le riz sauté, ou les galettes de lentilles, cuites 4 min de chaque côté dans une poêle huilée. Avec un couvercle, la poêle cuit aussi les petits pois, les épinards ou le chou à l’étouffée.'],
    ['Quel matériel faut-il pour cuisiner sans four ?', 'Une grande poêle avec couvercle, une casserole et une passoire suffisent pour nos 6 dîners sans four. Dans VégéBudget, décochez « Four » dans votre matériel de cuisine pour ne recevoir que des dîners sur les plaques.'],
  ],
  sources: [
    ['Augmenter les légumes secs (Manger Bouger, Santé publique France)', 'https://www.mangerbouger.fr/l-essentiel/les-recommandations-sur-l-alimentation-l-activite-physique-et-la-sedentarite/augmenter/augmenter-les-legumes-secs'],
  ],
} satisfies Article;
