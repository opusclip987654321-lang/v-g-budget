import { StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { money, portionStep, quantity, recipeCost } from '@/domain';
import { AppScreen } from '@/features/shell';
import { t } from '@/i18n';
import { usePlan, useStore } from '@/store';
import { Button, Card, colors, RecipePhoto, s } from '@/ui';

// Recette : quantités ajustées au nombre de personnes du dîner (ou du foyer), étapes, astuce.
export default function RecetteScreen() {
  const { id, entry: entryId } = useLocalSearchParams<{ id: string; entry?: string }>();
  const plan = usePlan();
  const { allRecipes, ingredients, people, prices, packSizes, toggleCooked } = useStore(useShallow(st => ({ allRecipes: st.allRecipes, ingredients: st.ingredients, people: st.state.profile.people, prices: st.state.prices, packSizes: st.state.packSizes, toggleCooked: st.toggleCooked })));
  const recipe = allRecipes.find(r => r.id === id);
  if (!recipe) return <AppScreen safeTop={false} title={t.recipes.notFound}><Text style={s.intro}>{t.recipes.gone}</Text></AppScreen>;
  const entry = plan?.entries.find(e => e.id === entryId);
  const servings = entry?.servings ?? people;
  return <>
    <Stack.Screen options={{ title: recipe.category }} />
    <AppScreen safeTop={false} title={recipe.title} intro={recipe.description}>
      <RecipePhoto recipe={recipe} height={210} />
      <View style={[s.row, styles.wrap]}>
        <Text style={s.pill}>{t.common.minutes(recipe.minutes)}</Text>
        <Text style={s.pill}>{t.common.people(servings)}</Text>
        <Text style={s.pill}>{money(recipeCost(recipe, servings, prices, ingredients, packSizes))}</Text>
      </View>
      {entry && <Button label={entry.cooked ? t.recipes.uncook : t.recipes.cook} variant={entry.cooked ? 'secondary' : 'primary'} onPress={() => toggleCooked(entry)} />}
      <Text style={s.h2} accessibilityRole="header">{t.recipes.ingredients}</Text>
      <Card style={styles.list}>
        {recipe.ingredients.map((x, i) => {
          const ingredient = ingredients.find(g => g.id === x.id);
          if (!ingredient) return null;
          return <View key={x.id} style={[s.row, styles.line, i > 0 && s.divider]}>
            <Text style={[s.text, styles.flex]}>{ingredient.name}</Text>
            {/* Les quantités du catalogue sont pour 2 personnes. */}
            <Text style={s.strong}>{quantity(x.qty * servings / 2, ingredient.unit)}</Text>
          </View>;
        })}
      </Card>
      <Text style={s.h2} accessibilityRole="header">{t.recipes.steps}</Text>
      {recipe.steps.map((step, i) => <View key={i} style={[s.row, styles.step]}>
        <View style={styles.number}><Text style={styles.numberText}>{i + 1}</Text></View>
        <Text style={[s.text, styles.flex]}>{portionStep(step, servings)}</Text>
      </View>)}
      {recipe.tip ? <Card style={styles.tip}><Text style={[s.small, styles.green]}>{t.recipes.tip(recipe.tip)}</Text></Card> : null}
    </AppScreen>
  </>;
}

const styles = StyleSheet.create({
  wrap: { flexWrap: 'wrap' }, list: { gap: 0, paddingVertical: 4 }, line: { justifyContent: 'space-between', paddingVertical: 10 }, flex: { flex: 1 },
  step: { alignItems: 'flex-start' }, number: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  numberText: { color: colors.green, fontWeight: '700' }, tip: { backgroundColor: colors.mint }, green: { color: colors.green },
});
