import type { Article } from '@/lib/blog-articles';
import { cost, kiloPrice } from '@/lib/blog-cost';
import { ingredients, recipes } from '@/lib/catalog';
import { money, packLabel, roundMoney, shopping, totals, type Entry } from '@/lib/planner';

// Liste de courses de base : un stock de placard et de congélateur acheté une fois, puis le frais de la semaine.
// Tous les montants viennent du catalogue (lib/catalog.ts) et du calcul de la liste de courses de l'appli
// (lib/planner.ts, shopping) : rien n'est écrit en dur.
const ing = (id: string) => {
  const i = ingredients.find(x => x.id === id);
  if (!i) throw new Error(`${id} absent du catalogue : revoir /blog/liste-courses-de-base.`);
  return i;
};
// [ingrédient, nombre de paquets, rayon affiché]
const PLACARD: [string, number, string][] = [
  ['rice', 1, 'Féculents'], ['pasta', 2, 'Féculents'], ['couscous', 1, 'Féculents'],
  ['red-lentils', 1, 'Légumes secs'], ['green-lentils', 1, 'Légumes secs'], ['chickpeas', 4, 'Conserves'], ['white-beans', 1, 'Conserves'],
  ['tomato', 4, 'Conserves'], ['oil', 1, 'Épicerie'], ['salt', 1, 'Épicerie'], ['cumin', 1, 'Épicerie'], ['curry', 1, 'Épicerie'], ['paprika', 1, 'Épicerie'],
  ['spinach', 1, 'Congélateur'], ['peas', 1, 'Congélateur'],
];
const totalPlacard = roundMoney(PLACARD.reduce((s, [id, n]) => s + ing(id).price * n, 0));
const tableauPlacard = PLACARD
  .map(([id, n, rayon]) => { const i = ing(id); return `| ${rayon} | ${i.name} | ${packLabel(n, i.pack, i.unit, i.name)} | ${money(i.price * n)} |`; })
  .join('\n');

// La semaine : 5 dîners pour 2 personnes, cuisinés avec ce stock.
const DINERS = ['bolognaise-lentilles', 'epinards-pois-chiches', 'semoule-pois', 'mijote-lentilles', 'penne-pois-chiches'];
DINERS.forEach(id => { if (!recipes.some(r => r.id === id)) throw new Error(`Recette ${id} absente : revoir /blog/liste-courses-de-base.`); });
const jour = (n: number) => `2026-11-${16 + n}`;
const entries: Entry[] = DINERS.map((id, n) => { const date = jour(n); return { id: `base-${n}`, recipeId: id, date, servings: 2, cooked: false, locked: false }; });
const stock = PLACARD.map(([id, n]) => ({ id, qty: n * ing(id).pack }));
const semaine = shopping(entries, stock, {}, recipes, ingredients);
const frais = semaine.filter(i => i.packages > 0);
const totalFrais = totals(frais).purchase;
const utiliseStock = totals(semaine).pantry;
const resteStock = roundMoney(totalPlacard - utiliseStock);
const sansStock = totals(shopping(entries, [], {}, recipes, ingredients).filter(i => i.packages > 0)).purchase;
const tableauFrais = frais
  .map(i => `| ${i.ingredient.name} | ${packLabel(i.packages, i.ingredient.pack, i.ingredient.unit, i.ingredient.name)} | ${money(i.purchaseCost)} |`)
  .join('\n');

// Garde-fous : le texte dit que le stock couvre l'essentiel de la semaine et que le frais reste sous 10 €.
if (frais.some(i => PLACARD.some(([id]) => id === i.id))) throw new Error('Un produit du placard manque pour la semaine : revoir /blog/liste-courses-de-base.');
if (frais.map(i => i.id).sort().join() !== ['basil', 'carrot', 'garlic', 'onion', 'potato'].join()) throw new Error('Le frais de la semaine a changé : revoir le texte de /blog/liste-courses-de-base.');
if (totalFrais > 10) throw new Error(`Frais de la semaine à ${totalFrais} € : revoir /blog/liste-courses-de-base.`);
if (resteStock < totalPlacard / 2) throw new Error('Le placard est presque vide après une semaine : revoir /blog/liste-courses-de-base.');

// Les produits les moins chers au kilo parmi ceux du stock (sel exclu).
const auKilo = PLACARD.map(([id]) => ing(id))
  .filter(i => i.unit === 'g' && i.id !== 'salt' && !['cumin', 'curry', 'paprika'].includes(i.id))
  .sort((a, b) => a.price / a.pack - b.price / b.pack)
  .slice(0, 6)
  .map(i => `| ${i.name} | ${kiloPrice(i.id)} |`)
  .join('\n');

export default {
  slug: 'liste-courses-de-base',
  title: `Liste de courses de base pas chère : ${money(totalPlacard)} de placard, puis ${money(totalFrais)} pour 5 dîners`,
  seoTitle: 'Liste de courses de base pas chère : prix par produit',
  description: `Liste de courses de base pas chère, prix par produit : ${money(totalPlacard)} de placard une seule fois, puis ${money(totalFrais)} de frais pour 5 dîners sans viande à 2.`,
  lead: `Une liste de courses de base pas chère tient en deux parties : un stock de placard et de congélateur acheté une fois (${money(totalPlacard)} ici), puis quelques produits frais chaque semaine. Avec ce stock, 5 dîners sans viande pour 2 ne demandent que ${money(totalFrais)} de courses en plus.`,
  category: 'Budget',
  keywords: ['liste de courses de base pas chère', 'liste de courses de base', 'liste de courses type', 'indispensables du placard', 'aliments à toujours avoir chez soi', 'aliments les moins chers'],
  date: '2026-11-28',
  coverAlt: 'Liste de courses de base pas chère : une étagère avec des bocaux de riz, de pâtes et de lentilles, des conserves, des épices et une liste de courses cochée',
  body: `
@essentiel
- **Le stock de base** : féculents, légumes secs, conserves, épices et deux légumes surgelés, pour ${money(totalPlacard)}, une seule fois.
- **Le frais de la semaine** : carottes, oignons, pommes de terre, ail et basilic, soit ${money(totalFrais)} pour 5 dîners à 2.
- **Après 5 dîners**, il reste encore pour ${money(resteStock)} de stock dans le placard.
- **Placard vide au départ** : les mêmes dîners demandent ${money(sansStock)} de courses.

@chiffres ${money(totalPlacard)} | le placard, une seule fois ; ${money(totalFrais)} | de frais pour 5 dîners à 2 ; 2 fois | par semaine, les légumes secs (Manger Bouger)

## Quelle liste de courses de base pas chère pour remplir le placard ?

Les indispensables du placard se gardent des semaines : riz, pâtes, semoule, lentilles, conserves, huile, épices. Manger Bouger y ajoute les légumes surgelés.

| Rayon | Produit | À acheter | Prix |
|---|---|---|---|
${tableauPlacard}
| **Total** | | | **${money(totalPlacard)}** |

Coût estimé : prix relevés le 7 octobre 2026 sur carrefour.fr, marques distributeur, hors promotions.

## Quelle liste de courses type pour la semaine ?

Une fois le placard rempli, la liste de la semaine tient en ${frais.length} lignes. Pour les 5 dîners ci-dessous, à 2 personnes :

| Produit frais | À acheter | Prix |
|---|---|---|
${tableauFrais}
| **Total** | | **${money(totalFrais)}** |

@recette bolognaise-lentilles | Pâtes, lentilles corail et tomates concassées : trois produits du placard. Le frais se limite à une carotte, un oignon et de l’ail.

@recette mijote-lentilles | Lentilles vertes, carottes et pommes de terre mijotées dans la tomate, au paprika.

@recette epinards-pois-chiches | Épinards surgelés et pois chiches au cumin, servis avec du riz. Les haricots blancs du placard remplacent très bien les pois chiches.

@recette semoule-pois | Semoule, petits pois surgelés, carottes et pois chiches au cumin. Elle ne prend qu’une demi-conserve de pois chiches : l’autre moitié sert au dîner suivant.

@recette penne-pois-chiches | Pâtes, pois chiches et sauce tomate, avec le basilic ajouté au moment de servir.

@cta-court Indiquez ce qui est déjà dans vos placards : VégéBudget choisit vos dîners de la semaine et ne met sur la liste que ce qui manque, avec le montant.

## Combien coûte une liste de courses de base pour la semaine ?

Le premier passage en caisse coûte plus cher, car on achète des paquets entiers. Mais ces 5 dîners n’utilisent que ${money(utiliseStock)} du stock : il en reste pour ${money(resteStock)}, qui servira les semaines suivantes.

| Pour 5 dîners à 2 | Courses à faire |
|---|---|
| Placard déjà rempli | ${money(totalFrais)} de frais |
| Placard vide | ${money(sansStock)} |

![Pâtes à la bolognaise de lentilles dans une assiette](/images/recettes/bolognaise-lentilles.jpg "La bolognaise de lentilles : presque tout vient du placard.")

Pour 7 jours, voyez le [menu de la semaine pas cher pour 2](/blog/menu-semaine-pas-cher) ; avec un budget fixe, [les courses à 50 € par semaine pour 2](/blog/courses-50-euros-par-semaine) ; en studio, la [liste de courses étudiant pas chère](/blog/liste-courses-etudiant).

## Quels sont les aliments les moins chers au kilo ?

Dans ce placard, les produits les moins chers au kilo (poids égoutté pour les conserves) :

| Produit | Prix au kilo |
|---|---|
${auKilo}

- **Comparez le prix au kilo**, pas le prix du paquet : voir [comment comparer les prix au kilo](/blog/comparer-prix-au-kilo).
- **Prenez la marque distributeur** pour les produits simples : voir [marque distributeur ou grande marque](/blog/marque-distributeur-ou-grande-marque).
- **Misez sur les surgelés**, souvent moins chers que le frais selon Manger Bouger : voir [légumes surgelés ou frais](/blog/legumes-surgeles-prix).
- **Faites cuire les légumes secs vous-même** : voir [trempage et cuisson des légumes secs](/blog/cuisson-legumes-secs).

## Quelles autres recettes faire avec les produits du placard ?

@recettes riz-saute, curry-corail, soupe-petits-pois

@cta Tenez compte de ce que vous avez déjà
`,
  faq: [
    ['Quels aliments acheter quand on a peu d’argent ?', `Des féculents (riz, pâtes, semoule), des légumes secs (lentilles, pois chiches, haricots), des tomates en conserve et des légumes surgelés. Dans notre exemple, ce stock coûte ${money(totalPlacard)} et sert plusieurs semaines.`],
    ['Quels aliments faut-il toujours avoir chez soi ?', 'Les indispensables du placard : un ou deux féculents, des lentilles, des pois chiches ou des haricots en conserve, des tomates concassées, de l’huile, du sel et deux ou trois épices. Manger Bouger conseille aussi de garder des légumes surgelés.'],
    ['Combien coûte une liste de courses type pour une semaine ?', `Avec un placard déjà rempli, 5 dîners sans viande pour 2 demandent ${money(totalFrais)} de produits frais dans notre exemple. Sans aucun stock, les mêmes dîners coûtent ${money(sansStock)}, car on achète tous les paquets.`],
    ['Les conserves et les surgelés sont-ils aussi bons que le frais ?', 'Selon Manger Bouger (Santé publique France), les fruits et légumes comptent, qu’ils soient frais, surgelés ou en conserve, et les surgelés gardent leurs qualités nutritionnelles. Ils sont souvent moins chers que le frais.'],
    ['Que cuisiner avec les produits de base ?', `Une bolognaise de lentilles (${cost('bolognaise-lentilles')} la portion en ingrédients), une poêlée d’épinards aux pois chiches (${cost('epinards-pois-chiches')}) ou une semoule aux petits pois (${cost('semoule-pois')}).`],
  ],
  sources: [
    ['Les indispensables à avoir chez soi pour varier ses repas (Manger Bouger)', 'https://www.mangerbouger.fr/manger-mieux/se-faire-plaisir-en-mangeant-equilibre/manger-equilibre-ca-veut-dire-quoi-et-comment-y-arriver/les-indispensables-a-avoir-chez-soi-pour-varier-ses-repas'],
    ['Les aliments économiques (Manger Bouger, Santé publique France)', 'https://www.mangerbouger.fr/manger-mieux/bien-manger-sans-se-ruiner/bien-manger-en-preservant-la-planete-sans-se-ruiner-c-est-possible/les-aliments-economiques'],
    ['Augmenter les légumes secs (Manger Bouger, Santé publique France)', 'https://www.mangerbouger.fr/l-essentiel/les-recommandations-sur-l-alimentation-l-activite-physique-et-la-sedentarite/augmenter/augmenter-les-legumes-secs'],
    ['Augmenter les fruits et légumes (Manger Bouger)', 'https://www.mangerbouger.fr/l-essentiel/les-recommandations-sur-l-alimentation-l-activite-physique-et-la-sedentarite/augmenter/augmenter-les-fruits-et-legumes'],
  ],
} satisfies Article;
