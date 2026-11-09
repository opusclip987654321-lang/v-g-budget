import { recipes } from './catalog';
import { blankState, generatePlan, money, packLabel, recipeCost, roundMoney, shopping, totals } from './planner';
import { PRICE_SOURCE } from './pricing';

// Pages « menu végétarien de la semaine » par taille de foyer (1, 2 ou 4 personnes), pour Google et les IA.
// Les menus sont choisis par le même planificateur que l'appli (graine fixe : ils ne changent que quand le
// catalogue change, chaque lundi avec les 2 nouvelles recettes) ; les prix viennent du catalogue, rien en dur.
export const FOYERS = [
  { slug: '1-personne', people: 1, label: '1 personne', pour: 'pour 1 personne' },
  { slug: '2-personnes', people: 2, label: '2 personnes', pour: 'pour 2' },
  { slug: '4-personnes', people: 4, label: '4 personnes', pour: 'pour 4 (famille)' },
] as const;
export type Foyer = (typeof FOYERS)[number];
export const MENU_PATH = '/menu-vegetarien-semaine';
export const foyerPath = (f: Foyer) => `${MENU_PATH}/${f.slug}`;
export const findFoyer = (slug: string) => FOYERS.find(f => f.slug === slug);
const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
// Semaine de référence fixe : seules les dates internes du plan en dépendent, rien n'est affiché.
const WEEK = '2026-11-09';

export function menuFoyer(f: Foyer) {
  const state = blankState();
  state.profile = { ...state.profile, people: f.people, budget: 18 * f.people };
  const plan = generatePlan(state, WEEK, 42).plan;
  const entries = plan?.entries ?? [];
  const items = shopping(entries, []).filter(i => i.packages > 0).sort((a, b) => b.purchaseCost - a.purchaseCost);
  const t = totals(items);
  const portions = entries.length * f.people;
  const diners = entries.map((e, n) => {
    const recipe = recipes.find(r => r.id === e.recipeId)!;
    return { jour: JOURS[n] ?? `Soir ${n + 1}`, recipe, cout: recipeCost(recipe, f.people), parPortion: roundMoney(recipeCost(recipe, f.people) / f.people) };
  });
  const courses = items.map(i => ({ id: i.id, nom: i.ingredient.name, quantite: packLabel(i.packages, i.ingredient.pack, i.ingredient.unit, i.ingredient.name), prix: i.purchaseCost }));
  return { foyer: f, diners, courses, achat: t.purchase, utilise: t.used, reste: roundMoney(t.purchase - t.used), parPortion: portions ? roundMoney(t.used / portions) : 0, parPersonne: roundMoney(t.purchase / f.people) };
}
export type MenuFoyer = ReturnType<typeof menuFoyer>;

export function menuTitle(m: MenuFoyer) {
  return `Menu végétarien de la semaine ${m.foyer.pour} : 5 dîners pour ${Math.round(m.achat)} € (liste de courses)`;
}
export function menuDescription(m: MenuFoyer) {
  return `5 dîners sans viande ${m.foyer.pour}, avec la liste de courses chiffrée : ${money(m.achat)} de courses, ${money(m.parPortion)} la portion. Recettes simples, prix réels par plat.`;
}
export function menuFaq(m: MenuFoyer) {
  const f = m.foyer;
  return [
    { q: `Combien coûte une semaine de dîners végétariens ${f.pour} ?`, a: `Pour ces 5 dîners, les courses coûtent environ ${money(m.achat)}, car certains produits s’achètent en paquet entier. Les quantités vraiment utilisées coûtent ${money(m.utilise)}, soit ${money(m.parPortion)} la portion ; le reste (${money(m.reste)}) sert pour d’autres repas. ${PRICE_SOURCE}.` },
    { q: 'Pourquoi le prix des courses est-il plus élevé que le prix des recettes ?', a: 'En magasin, on achète un paquet entier de riz, de lentilles ou de cumin, même si la semaine n’en demande qu’une partie. Ce qui reste est du placard pour la semaine suivante : le vrai coût de vos dîners est celui des quantités utilisées.' },
    { q: 'Ces menus sont-ils 100 % végétaux ?', a: 'Oui : ni viande, ni poisson, ni œufs, ni produits laitiers. Les protéines viennent des lentilles, des pois chiches et des haricots, qui sont parmi les protéines les moins chères au kilo.' },
    { q: 'Puis-je adapter ce menu à mon budget et à mon placard ?', a: 'Oui. Dans VégéBudget, vous indiquez votre budget, le nombre de personnes et ce que vous avez déjà : l’appli choisit les dîners et calcule ce qu’il reste à acheter. La première semaine est gratuite, sans compte ni carte bancaire.' },
  ];
}
