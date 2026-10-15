import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Recipe } from '@/domain';
import { RecipePhoto, s } from '@/ui';
import { t } from '@/i18n';

export const RecipeCard = memo(function RecipeCard({ recipe, cost, onOpen }: { recipe: Recipe; cost: string; onOpen: (id: string) => void }) {
  return <Pressable style={[s.card, styles.card]} onPress={() => onOpen(recipe.id)} accessibilityRole="button" accessibilityLabel={recipe.title}>
    <RecipePhoto recipe={recipe} height={110} style={styles.photo} />
    <View style={styles.body}>
      <Text style={[s.strong, styles.title]} numberOfLines={2}>{recipe.title}</Text>
      <Text style={s.small}>{t.common.minutes(recipe.minutes)} · {cost}</Text>
    </View>
  </Pressable>;
});

const styles = StyleSheet.create({
  card: { flex: 1, padding: 0, gap: 0, overflow: 'hidden', margin: 6 }, photo: { borderRadius: 0 },
  body: { padding: 10, gap: 3 }, title: { fontSize: 14 },
});
