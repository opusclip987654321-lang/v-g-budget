import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { shopping } from '@/domain';
import { currentPlan, isPremium, useStore } from './appStore';

// Sélecteurs partagés par les écrans : chacun ne se redessine que si la valeur lue change.
export const usePlan = () => useStore(s => currentPlan(s.state, s.week));
export const usePremium = () => useStore(s => isPremium(s.data));
export function useItems() {
  const plan = usePlan();
  const { pantry, prices, packSizes, allRecipes, ingredients } = useStore(useShallow(s => ({ pantry: s.state.pantry, prices: s.state.prices, packSizes: s.state.packSizes, allRecipes: s.allRecipes, ingredients: s.ingredients })));
  return useMemo(() => plan ? shopping(plan.entries, pantry, prices, allRecipes, ingredients, packSizes) : [], [plan, pantry, prices, packSizes, allRecipes, ingredients]);
}
const NONE: string[] = [];
export const useChecked = () => useStore(s => s.state.checkedByWeek[s.week] ?? NONE);
