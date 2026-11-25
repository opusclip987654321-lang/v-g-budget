import type { Article } from '@/lib/blog-articles';
import { cost, kiloPrice } from '@/lib/blog-cost';
import { ingredients, recipes, type Recipe } from '@/lib/catalog';
import { money, recipeCost, roundMoney, shopping, totals, type Entry } from '@/lib/planner';
import { DAYS, DISHES, weekPlan } from '@/lib/semaine-type';

// Tous les montants viennent du catalogue (lib/catalog.ts) et du calcul de la liste de courses de l'appli (lib/planner.ts).
const jour = '2026-11-25';

// 1. Le mois type : la semaine type du blog (2 adultes, 3 repas par jour, lib/semaine-type.ts) répétée 4 fois.
const w = weekPlan();
const platsSemaine = DISHES.map(d => ({ id: d.id, ingredients: d.qty.map(([id, qty]) => ({ id, qty })) }) as Recipe);
const entreesMois: Entry[] = [];
for (let s = 0; s < 4; s++) DAYS.forEach(([, , diner, , midi], n) => {
  const date = `2026-11-${String(2 + s * 7 + n).padStart(2, '0')}`;
  entreesMois.push({ id: `pd-${s}-${n}`, recipeId: 'petit-dejeuner', date, servings: 2, cooked: false, locked: false });
  if (midi) entreesMois.push({ id: `midi-${s}-${n}`, recipeId: midi, date, servings: 2, cooked: false, locked: false });
  entreesMois.push({ id: `soir-${s}-${n}`, recipeId: diner, date, servings: 2, cooked: false, locked: false });
});
const mois = totals(shopping(entreesMois, [], {}, platsSemaine, ingredients));
// Racheter la semaine entière 4 fois, sans regarder ce qui reste dans les placards.
const sansPlacard = roundMoney(w.purchase * 4);
const ecart = roundMoney(sansPlacard - mois.purchase);
if (mois.purchase >= sansPlacard) throw new Error('Le mois avec les restes ne coûte plus moins cher : revoir /blog/budget-courses-couple-par-mois.');
// Le texte dit « moins de 150 € » pour le mois type.
if (mois.purchase >= 150) throw new Error(`Le mois type coûte ${mois.purchase} € : revoir /blog/budget-courses-couple-par-mois.`);
// Le texte parle de la « semaine type à moins de 50 € pour deux ».
if (w.purchase >= 50) throw new Error(`La semaine type coûte ${w.purchase} € : revoir /blog/budget-courses-couple-par-mois.`);

// 2. Trente dîners tous différents pour 2 : les 30 premières recettes du catalogue (les recettes ajoutées ensuite ne changent rien).
const TRENTE = recipes.slice(0, 30);
if (TRENTE.length < 30) throw new Error('Moins de 30 recettes au catalogue : revoir /blog/budget-courses-couple-par-mois.');
const entrees30: Entry[] = TRENTE.map((r, n) => ({ id: `d-${n}`, recipeId: r.id, date: '2026-11-01', servings: 2, cooked: false, locked: false }));
const diners = totals(shopping(entrees30, [], {}, recipes, ingredients));
const utilise30 = roundMoney(TRENTE.reduce((s, r) => s + recipeCost(r, 2), 0));
const reste30 = roundMoney(diners.purchase - utilise30);
const moyenne = money(utilise30 / 60);

// 3. Les quatre cartes : le texte dit « moins de 0,70 € la portion ».
const CARTES = ['riz-saute', 'soupe-petits-pois', 'semoule-pois', 'epinards-pois-chiches'];
for (const id of CARTES) {
  const r = recipes.find(x => x.id === id);
  if (!r) throw new Error(`Recette ${id} absente : revoir /blog/budget-courses-couple-par-mois.`);
  if (recipeCost(r, 2) / 2 >= 0.7) throw new Error(`${id} dépasse 0,70 € la portion : revoir /blog/budget-courses-couple-par-mois.`);
}

// Le texte dit que le riz sauté est le dîner le moins cher du catalogue.
const parPortion = (r: Recipe) => recipeCost(r, 2) / 2;
if ([...recipes].sort((a, b) => parPortion(a) - parPortion(b))[0].id !== 'riz-saute') throw new Error('Le riz sauté n’est plus le dîner le moins cher : revoir /blog/budget-courses-couple-par-mois.');

const tableau = [
  '| Façon de faire ses courses | Montant sur 4 semaines |',
  '|---|---|',
  `| Tout racheter chaque semaine | ${money(sansPlacard)} |`,
  `| Finir d’abord les paquets entamés | **${money(mois.purchase)}** |`,
  `| Différence | ${money(ecart)} |`,
].join('\n');

export default {
  slug: 'budget-courses-couple-par-mois',
  title: `Budget courses pour un couple par mois : notre mois calculé à ${money(mois.purchase)}`,
  seoTitle: `Budget courses couple par mois : ${money(mois.purchase)} calculés pour 2`,
  description: `Budget courses couple par mois : notre mois sans viande pour 2 calculé à ${money(mois.purchase)}, 3 repas par jour, le repère Insee et la méthode pour fixer le vôtre.`,
  lead: `Le budget courses d’un couple par mois dépend surtout de ce qu’il cuisine : notre mois type sans viande, 3 repas par jour pour 2 adultes, revient à ${money(mois.purchase)} de courses sur 4 semaines. En moyenne, les ménages consacrent 12,5 % de leurs dépenses de consommation à l’alimentation et aux boissons non alcoolisées, selon l’Insee.`,
  category: 'Budget',
  keywords: ['budget courses couple par mois', 'budget courses 2 personnes par mois', 'budget alimentaire couple par mois', 'combien dépense un couple en courses', 'budget nourriture couple', '300 euros de courses par mois pour 2'],
  date: jour,
  coverAlt: 'Budget courses pour un couple par mois : un calendrier, un sac de courses avec des légumes et des piles de pièces',
  body: `
@essentiel
- **Notre mois type pour 2 adultes** : ${money(mois.purchase)} de courses sur 4 semaines, 3 repas par jour, sans viande.
- **Hors de ce montant** : fruits, café, boissons et produits d’hygiène. Prévoyez une marge à part.
- **30 dîners différents pour 2** : ${money(utilise30)} d’ingrédients, soit ${moyenne} la portion en moyenne.
- **Finir les paquets entamés** avant de racheter : ${money(ecart)} de moins sur notre mois type.

@chiffres ${money(mois.purchase)} | le mois type pour 2 ; ${moyenne} | la portion de dîner en moyenne ; 12,5 % | des dépenses des ménages, selon l’Insee

## Quel budget courses pour un couple par mois ?

Pour un couple qui cuisine tous ses repas sans viande, notre calcul donne ${money(mois.purchase)} de courses sur 4 semaines. C’est notre [semaine type à moins de 50 € pour deux](/blog/courses-50-euros-par-semaine), répétée 4 fois en finissant les paquets entamés. Elle couvre le petit-déjeuner, le midi et le soir, et compte des paquets entiers, comme à la caisse.

Coût estimé des ingrédients : prix relevés le 7 octobre 2026 sur carrefour.fr, marques distributeur, hors promotions. À ajouter selon votre foyer :

- **Les fruits, le café et les boissons**, absents de notre mois type.
- **Les repas pris dehors** : restaurant, cantine, plats à emporter.
- **L’hygiène et le ménage**, à suivre séparément de l’alimentaire.

## Combien dépense un couple en courses, en moyenne ?

Selon l’Insee, les ménages consacrent 12,5 % de leurs dépenses de consommation à l’alimentation et aux boissons non alcoolisées (données 2025 provisoires). C’est une moyenne pour l’ensemble des ménages, pas un chiffre propre aux couples ni une règle.

> **Pour vous situer** : additionnez vos dépenses courantes d’un mois (loyer compris) et prenez-en 12,5 %. Ce repère ne remplace pas vos propres tickets de caisse.

## Combien coûtent 30 dîners sans viande pour 2 ?

Pour chiffrer la part des dîners dans un budget courses pour 2 personnes par mois, nous avons pris 30 recettes de notre catalogue, toutes différentes. Les ingrédients utilisés reviennent à ${money(utilise30)}, soit ${moyenne} la portion en moyenne. En paquets entiers, la liste monte à ${money(diners.purchase)} : il reste ${money(reste30)} de produits entamés pour le mois suivant.

Les dîners les moins chers reposent sur le riz, la semoule, les petits pois surgelés et les légumes secs. Quatre exemples à moins de 0,70 € la portion :

@recette riz-saute | Du riz cuit à part, puis sauté à la poêle avec les petits pois, les carottes et la sauce soja. Le dîner le moins cher de notre catalogue.

@recette soupe-petits-pois | Une soupe mixée de petits pois et de pommes de terre, servie avec du pain grillé.

@recette semoule-pois | Semoule, carottes, petits pois et une demi-boîte de pois chiches, prête en 20 min. L’autre moitié de la boîte sert au repas suivant.

@recette epinards-pois-chiches | Des épinards surgelés et des pois chiches sur du riz : un dîner fait avec ce qu’il y a au congélateur et au placard.

@cta-court VégéBudget compose vos dîners de la semaine selon votre budget, avec la liste de courses et son montant estimé, en retirant ce que vous avez déjà dans vos placards.

## Comment calculer son budget alimentaire à deux ?

- **Gardez vos tickets un mois** : supermarché, marché, boulangerie, livraisons.
- **Séparez l’alimentaire** du reste : hygiène, ménage et animaux à part.
- **Isolez les repas pris dehors** : restaurant, cantine, plats à emporter.
- **Comparez avec un repère** : notre mois type sans viande pour 2 revient à ${money(mois.purchase)}.
- **Fixez un montant par semaine**, puis vérifiez-le avec les tickets du mois suivant.

## Comment baisser son budget nourriture en couple ?

Le plus simple est de finir les paquets entamés avant de racheter. Sur notre mois type, la différence est nette :

${tableau}

![Lentilles vertes aux carottes et aux pommes de terre dans un bol blanc](/images/recettes/mijote-lentilles.jpg "Lentilles vertes aux carottes : ${cost('mijote-lentilles')} la portion.")

- **Les légumes secs à la place de la viande** : les lentilles vertes sèches reviennent à ${kiloPrice('green-lentils')}. Voir [comment remplacer la viande pas cher](/blog/remplacer-la-viande-pas-cher).
- **Le prix au kilo** plutôt que le prix du paquet : la méthode dans [comparer le prix au kilo](/blog/comparer-prix-au-kilo).
- **Les marques distributeur** : nos prix sont relevés sur ces marques, voir [marque distributeur ou grande marque](/blog/marque-distributeur-ou-grande-marque).
- **Planifier les dîners** de la semaine avant les courses : la méthode dans [planifier ses menus de la semaine](/blog/planifier-menus-semaine).
- **Des légumes secs au moins 2 fois par semaine**, comme le conseille Manger Bouger.

@recettes bolognaise-lentilles, curry-corail, hachis-lentilles

@cta Préparez vos menus en fonction de votre budget
`,
  faq: [
    ['300 € par mois pour 2, est-ce suffisant pour les courses ?', `Pour des repas cuisinés à la maison, d’après notre calcul, oui. Notre mois type sans viande pour 2 adultes revient à ${money(mois.purchase)} sur 4 semaines, 3 repas par jour : il reste de la marge pour les fruits, le café, les boissons et quelques produits d’hygiène.`],
    ['Quel budget alimentaire prévoir pour un couple par mois ?', `Cela dépend surtout de ce qu’il cuisine. Notre mois type sans viande pour 2 adultes, 3 repas par jour, revient à ${money(mois.purchase)} de courses sur 4 semaines ; ajoutez les fruits, le café, les boissons et les repas pris dehors.`],
    ['Le budget courses comprend-il les produits ménagers ?', 'Pour suivre votre budget alimentaire, mieux vaut les compter à part, avec l’hygiène et les produits pour animaux. Notre mois type ne comprend que la nourriture.'],
    ['Manger sans viande coûte-t-il moins cher à deux ?', `Nous n’avons pas chiffré de mois avec viande. Nos 30 dîners sans viande pour 2 reviennent à ${moyenne} la portion en moyenne, ingrédients seuls, et les lentilles vertes sèches à ${kiloPrice('green-lentils')}.`],
  ],
  sources: [
    ['Consommation effective des ménages par fonction, données 2025 (Insee)', 'https://www.insee.fr/fr/statistiques/2830276'],
    ['Augmenter les légumes secs (Manger Bouger, Santé publique France)', 'https://www.mangerbouger.fr/l-essentiel/les-recommandations-sur-l-alimentation-l-activite-physique-et-la-sedentarite/augmenter/augmenter-les-legumes-secs'],
  ],
} satisfies Article;
