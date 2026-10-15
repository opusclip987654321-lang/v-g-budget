import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';
import { categories, money, recipeCost } from '@/domain';
import { AppPageHeader } from '@/features/shell';
import { useStore } from '@/store';
import { colors, s } from '@/ui';
import { RecipeCard } from './RecipeCard';
import { t } from '@/i18n';

const fold = (t: string) => t.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');

export default function RecettesScreen() {
  const { recipes, people, prices, packSizes, ingredients } = useStore(useShallow(st => ({ recipes: st.recipes, people: st.state.profile.people, prices: st.state.prices, packSizes: st.state.packSizes, ingredients: st.ingredients })));
  const [query, setQuery] = useState(''), [category, setCategory] = useState('Toutes');
  const search = useDeferredValue(query); // la saisie reste fluide pendant le filtrage
  const rows = useMemo(() => recipes
    .filter(r => (category === 'Toutes' || r.category === category) && (!search.trim() || fold(r.title).includes(fold(search.trim()))))
    .map(recipe => ({ recipe, cost: money(recipeCost(recipe, people, prices, ingredients, packSizes)) })), [recipes, category, search, people, prices, ingredients, packSizes]);
  const open = useCallback((id: string) => router.push({ pathname: '/recette/[id]', params: { id } }), []);
  return <SafeAreaView style={s.screen} edges={['top']}>
    <FlashList data={rows} keyExtractor={r => r.recipe.id} numColumns={2} contentContainerStyle={styles.list}
      ListHeaderComponent={<View style={styles.header}>
        <AppPageHeader eyebrow={t.recipes.eyebrow} title={t.recipes.title(recipes.length)} />
        <TextInput value={query} onChangeText={setQuery} placeholder={t.recipes.search} placeholderTextColor={colors.subtle} style={s.input} accessibilityLabel={t.recipes.search} clearButtonMode="while-editing" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {categories.map(c => <Pressable key={c} onPress={() => setCategory(c)} accessibilityRole="button" accessibilityState={{ selected: c === category }} style={[styles.chip, c === category && styles.chipOn]}>
            <Text style={[styles.chipText, c === category && styles.chipTextOn]}>{c}</Text></Pressable>)}
        </ScrollView>
      </View>}
      ListEmptyComponent={<Text style={[s.intro, styles.empty]}>{t.recipes.none}</Text>}
      renderItem={({ item }) => <RecipeCard recipe={item.recipe} cost={item.cost} onOpen={open} />} />
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  list: { padding: 12, paddingBottom: 40 }, header: { gap: 12, padding: 6, marginBottom: 4 }, empty: { padding: 6 },
  chips: { gap: 8 }, chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border },
  chipOn: { backgroundColor: colors.green, borderColor: colors.green }, chipText: { color: colors.green, fontWeight: '600', fontSize: 13 }, chipTextOn: { color: '#fff' },
});
