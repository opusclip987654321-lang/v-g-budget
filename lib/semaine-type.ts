import { ingredients, type Recipe } from './catalog';
import { quantity, roundMoney, shopping, totals, type Entry, type ShopItem } from './planner';

// Semaine type du blog (/blog/menu-semaine-pas-cher) : 2 adultes, 7 jours, 3 repas par jour.
// Les dîners sont cuisinés en 4 portions : 2 le soir, 2 le lendemain midi (sauf le dimanche soir, 2 portions).
// Le lundi midi est un plat à part. Les prix et les paquets viennent du catalogue (lib/catalog.ts),
// avec le même calcul que la liste de courses de l'appli (lib/planner.ts) : rien n'est écrit en dur.

type Dish = { id: string; title: string; short: string; recipe?: string; note?: string; qty: [string, number][] };
// Quantités pour la totalité de ce qui est cuisiné (les portions sont indiquées dans DAYS).
export const DISHES: Dish[] = [
  { id: 'petit-dejeuner', title: 'Tartines au beurre de cacahuète, yaourt de soja', short: 'Petit-déjeuner', qty: [['bread', 125], ['peanut', 40], ['yogurt', 300]] },
  { id: 'salade-pates', title: 'Salade de pâtes, haricots rouges et carottes râpées', short: 'Salade de pâtes', qty: [['pasta', 160], ['kidney', 250], ['carrot', 150], ['lemon', 1], ['oil', 15], ['cumin', 2], ['salt', 2]] },
  { id: 'lentilles-carottes', title: 'Lentilles vertes aux carottes', short: 'Lentilles aux carottes', recipe: 'mijote-lentilles', note: 'avec du cumin à la place du paprika', qty: [['green-lentils', 340], ['carrot', 500], ['onion', 200], ['potato', 500], ['tomato', 300], ['oil', 20], ['cumin', 6], ['salt', 4]] },
  { id: 'epinards-pois-chiches', title: 'Poêlée d’épinards et de pois chiches, riz', short: 'Poêlée d’épinards', recipe: 'epinards-pois-chiches', qty: [['chickpeas', 480], ['spinach', 500], ['rice', 280], ['onion', 160], ['oil', 20], ['cumin', 6], ['salt', 4]] },
  { id: 'spaghetti-lentilles', title: 'Spaghetti à la sauce tomate et aux lentilles vertes', short: 'Spaghetti aux lentilles', recipe: 'bolognaise-lentilles', note: 'avec des lentilles vertes', qty: [['pasta', 360], ['green-lentils', 200], ['tomato', 800], ['carrot', 240], ['onion', 200], ['garlic', 12], ['oil', 20], ['salt', 4]] },
  { id: 'riz-haricots', title: 'Riz aux haricots rouges, tomate et cumin', short: 'Riz aux haricots rouges', recipe: 'chili-haricots', note: 'sans maïs ni poivron, avec des carottes', qty: [['kidney', 500], ['rice', 320], ['tomato', 600], ['onion', 200], ['carrot', 200], ['oil', 20], ['cumin', 6], ['salt', 4]] },
  { id: 'semoule-pois-chiches', title: 'Semoule aux carottes et aux pois chiches', short: 'Semoule aux pois chiches', recipe: 'semoule-pois', note: 'sans petits pois, avec plus de pois chiches', qty: [['couscous', 320], ['carrot', 500], ['chickpeas', 480], ['oil', 20], ['cumin', 6], ['salt', 4]] },
  { id: 'curry-pois-chiches', title: 'Curry de pois chiches et d’épinards, riz', short: 'Curry de pois chiches', recipe: 'curry-corail', note: 'avec des pois chiches, sans lait de coco', qty: [['chickpeas', 480], ['spinach', 400], ['tomato', 400], ['onion', 200], ['rice', 280], ['oil', 20], ['curry', 8], ['salt', 4]] },
  { id: 'soupe-carottes', title: 'Soupe de carottes, pommes de terre et lentilles, tartines', short: 'Soupe et tartines', qty: [['carrot', 250], ['potato', 200], ['green-lentils', 80], ['onion', 80], ['oil', 10], ['cumin', 2], ['salt', 2], ['bread', 120]] },
];

// [jour, ancre, dîner, portions du dîner, midi cuisiné à part (ou null : reste du dîner de la veille)]
export const DAYS: [string, string, string, number, string | null][] = [
  ['Lundi', 'lundi', 'lentilles-carottes', 4, 'salade-pates'],
  ['Mardi', 'mardi', 'epinards-pois-chiches', 4, null],
  ['Mercredi', 'mercredi', 'spaghetti-lentilles', 4, null],
  ['Jeudi', 'jeudi', 'riz-haricots', 4, null],
  ['Vendredi', 'vendredi', 'semoule-pois-chiches', 4, null],
  ['Samedi', 'samedi', 'curry-pois-chiches', 4, null],
  ['Dimanche', 'dimanche', 'soupe-carottes', 2, null],
];
export const PEOPLE = 2;
// Produits que beaucoup de cuisines ont déjà : on donne aussi le montant sans eux.
export const PANTRY_IDS = ['oil', 'salt', 'cumin', 'curry'];

const dish = (id: string) => { const d = DISHES.find(x => x.id === id); if (!d) throw new Error(`Plat inconnu dans la semaine type : ${id}`); return d; };
const ingredient = (id: string) => { const i = ingredients.find(x => x.id === id); if (!i) throw new Error(`Ingrédient absent du catalogue dans la semaine type : ${id}`); return i; };

// Chaque plat devient une « recette » au format de l'appli : les quantités du catalogue sont prévues pour 2 portions,
// donc on donne les quantités cuisinées telles quelles.
function asEntries(): { recipes: Recipe[]; entries: Entry[] } {
  const recipes = DISHES.map(d => { d.qty.forEach(([id]) => ingredient(id)); return { id: d.id, ingredients: d.qty.map(([id, qty]) => ({ id, qty })) } as Recipe; });
  const entries: Entry[] = [];
  // Les quantités des plats sont déjà celles cuisinées : servings 2 = quantités prises telles quelles.
  DAYS.forEach(([, , dinner, , lunch], n) => {
    const date = `2026-10-${String(12 + n).padStart(2, '0')}`;
    entries.push({ id: `pd-${n}`, recipeId: 'petit-dejeuner', date, servings: 2, cooked: false, locked: false });
    if (lunch) entries.push({ id: `midi-${n}`, recipeId: lunch, date, servings: 2, cooked: false, locked: false });
    entries.push({ id: `soir-${n}`, recipeId: dinner, date, servings: 2, cooked: false, locked: false });
  });
  return { recipes, entries };
}

// Coût d'un plat, pour les quantités cuisinées (prix au prorata, comme le coût par portion du site).
export const dishCost = (id: string) => roundMoney(dish(id).qty.reduce((s, [i, q]) => { const x = ingredient(i); return s + q * x.price / x.pack; }, 0));

export function weekPlan() {
  const { recipes, entries } = asEntries();
  const items: ShopItem[] = shopping(entries, [], {}, recipes, ingredients);
  const t = totals(items);
  const pantry = items.filter(i => PANTRY_IDS.includes(i.id));
  const portions = DAYS.length * 3 * PEOPLE;
  const meals = [
    { id: 'petit-dejeuner', portions: 2, count: DAYS.length },
    ...DAYS.flatMap(([, , dinner, servings, lunch]) => [...(lunch ? [{ id: lunch, portions: 2, count: 1 }] : []), { id: dinner, portions: servings, count: 1 }]),
  ].map(m => ({ ...m, dish: dish(m.id), cost: dishCost(m.id), perPortion: roundMoney(dishCost(m.id) / m.portions) }));
  const mealsTotal = roundMoney(meals.reduce((s, m) => s + m.cost * m.count, 0));
  return {
    items, portions, meals, mealsTotal,
    used: t.used, purchase: t.purchase,
    withoutPantry: roundMoney(t.purchase - pantry.reduce((s, i) => s + i.purchaseCost, 0)),
    leftoverValue: roundMoney(t.purchase - t.used),
    perPortion: t.used / portions, perPersonDay: t.used / (DAYS.length * PEOPLE), perPersonWeek: t.used / PEOPLE,
  };
}

// « 4 × 400 g » ou « 1 citron », et « 2,1 kg » pour la quantité utilisée.
export const buyLabel = (i: ShopItem) => i.ingredient.unit === 'pièce' && i.ingredient.pack === 1 ? `${i.packages} ${i.ingredient.name.toLowerCase()}${i.packages > 1 ? 's' : ''}` : `${i.packages} × ${quantity(i.ingredient.pack, i.ingredient.unit)}`;
export const usedLabel = (i: ShopItem) => quantity(i.required, i.ingredient.unit);
