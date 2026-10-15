import { money } from './planner';
import { findRecipe, portionCost } from './seo';

// Coût par portion d'une recette du catalogue, recalculé avec les prix du moment.
// Une recette inconnue fait échouer la construction du site plutôt que d'afficher un faux prix.
export const cost = (id: string) => {
  const r = findRecipe(id);
  if (!r) throw new Error(`Recette inconnue dans un article du blog : ${id}`);
  return money(portionCost(r));
};
