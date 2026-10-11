import { ingredients as baseIngredients, recipes } from './catalog';
import { recipeCost, shopping, totals, type Entry } from './planner';
import { localizeIngredients, type RegionCode } from './region';

// Semaine d'exemple : les 5 soupers du menu à petit prix du blog, pour 2 personnes.
const EXAMPLE = ['curry-corail', 'pates-brocoli', 'riz-saute', 'epinards-pois-chiches', 'soupe-petits-pois'];

const PANTRY = ['oil', 'salt', 'black-pepper', 'curry', 'cumin', 'paprika', 'soy-sauce', 'mustard'];

export function countryExample(code: RegionCode) {
  const ingredients = localizeIngredients(baseIngredients, code);
  const entries: Entry[] = EXAMPLE.map((recipeId, n) => ({ id: recipeId, recipeId, date: `2026-10-${12 + n}`, servings: 2, cooked: false, locked: false }));
  // Huile, sel et épices sont supposés déjà au placard, comme dans la plupart des cuisines.
  const pantry = PANTRY.map(id => ({ id, qty: 100000 }));
  const week = totals(shopping(entries, pantry, {}, recipes, ingredients));
  const portions = recipes.map(r => ({ recipe: r, cost: recipeCost(r, 2, {}, ingredients) / 2 })).sort((a, b) => a.cost - b.cost);
  return { week, portions, estimated: ingredients.filter(i => 'estimated' in i && i.estimated).length };
}

