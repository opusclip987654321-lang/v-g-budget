import { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';
import { money, recipeCost, type Entry } from '@/domain';
import { AppPageHeader, AppScreen } from '@/features/shell';
import { usePlan, useStore } from '@/store';
import { Button, Empty, s } from '@/ui';
import { MealRow } from './MealRow';
import { t } from '@/i18n';

export default function MenusScreen() {
  const plan = usePlan();
  const { allRecipes, toggleCooked, prices, packSizes, ingredients } = useStore(useShallow(st => ({ allRecipes: st.allRecipes, toggleCooked: st.toggleCooked, prices: st.state.prices, packSizes: st.state.packSizes, ingredients: st.ingredients })));
  const rows = useMemo(() => (plan?.entries ?? []).slice().sort((a, b) => a.date.localeCompare(b.date)).flatMap(entry => {
    const recipe = allRecipes.find(r => r.id === entry.recipeId);
    return recipe ? [{ entry, recipe, cost: money(recipeCost(recipe, entry.servings, prices, ingredients, packSizes)) }] : [];
  }), [plan, allRecipes, prices, ingredients, packSizes]);
  const open = useCallback((entry: Entry) => router.push({ pathname: '/recette/[id]', params: { id: entry.recipeId, entry: entry.id } }), []);
  if (!plan) return <AppScreen eyebrow={t.menus.eyebrow} title={t.menus.emptyTitle}>
    <Empty icon="calendar-outline" title={t.week.startTitle} text={t.menus.emptyText}>
      <Button label={t.common.compose} onPress={() => router.push('/bienvenue')} style={styles.stretch} />
    </Empty>
  </AppScreen>;
  return <SafeAreaView style={s.screen} edges={['top']}>
    <FlashList data={rows} keyExtractor={r => r.entry.id} contentContainerStyle={s.list}
      ListHeaderComponent={<AppPageHeader eyebrow={t.menus.eyebrow} title={plan.name} intro={t.menus.intro} />}
      ListHeaderComponentStyle={styles.header}
      renderItem={({ item }) => <MealRow entry={item.entry} recipe={item.recipe} cost={item.cost} onOpen={open} onToggle={toggleCooked} />} />
  </SafeAreaView>;
}

const styles = StyleSheet.create({ stretch: { alignSelf: 'stretch', marginTop: 8 }, header: { marginBottom: 14 } });
