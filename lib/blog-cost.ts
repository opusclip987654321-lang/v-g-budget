import { ingredients } from './catalog';
import { money, quantity } from './planner';
import { findRecipe, portionCost } from './seo';

// Prix tirés des données du site, pour les articles du blog : ils suivent les relevés de prix du catalogue.
// Un identifiant inconnu fait échouer la construction du site plutôt que d'afficher un faux prix.

// Coût par portion d'une recette du catalogue (lib/catalog.ts, r('id', …)).
export const cost = (id: string) => {
  const r = findRecipe(id);
  if (!r) throw new Error(`Recette inconnue dans un article du blog : ${id}`);
  return money(portionCost(r));
};

const ingredient = (id: string) => {
  const i = ingredients.find(x => x.id === id);
  if (!i) throw new Error(`Ingrédient inconnu dans un article du blog : ${id}`);
  return i;
};
// Prix du paquet relevé : « 1,35 € les 500 g ».
export const packPrice = (id: string) => { const i = ingredient(id); return `${money(i.price)} ${i.unit === 'pièce' && i.pack === 1 ? 'pièce' : `les ${quantity(i.pack, i.unit)}`}`; };
// Prix au kilo (ou au litre) : « 2,70 € le kilo ».
export const kiloPrice = (id: string) => { const i = ingredient(id); if (i.unit === 'pièce') throw new Error(`Pas de prix au kilo pour ${id}`); return `${money(i.price / i.pack * 1000)} ${i.unit === 'g' ? 'le kilo' : 'le litre'}`; };
// Prix d'une quantité donnée (en g, ml ou pièces) : amountPrice('green-lentils', 70) → « 0,19 € ».
export const amountPrice = (id: string, amount: number) => { const i = ingredient(id); return money(i.price / i.pack * amount); };
