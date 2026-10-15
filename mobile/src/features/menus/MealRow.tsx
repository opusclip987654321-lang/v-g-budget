import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Entry, Recipe } from '@/domain';
import { Card, colors, RecipePhoto, s } from '@/ui';
import { t } from '@/i18n';

// Une ligne « dîner du jour » : jour, photo, titre, prix, case « préparé ».
export const MealRow = memo(function MealRow({ entry, recipe, cost, onOpen, onToggle }: { entry: Entry; recipe: Recipe; cost: string; onOpen: (entry: Entry) => void; onToggle: (entry: Entry) => void }) {
  const day = new Date(`${entry.date}T12:00:00`);
  return <Card style={[s.row, styles.row, entry.cooked && styles.done]}>
    <Pressable style={[s.row, styles.flex]} onPress={() => onOpen(entry)} accessibilityRole="button" accessibilityLabel={t.menus.openRecipe(recipe.title)}>
      <View style={styles.day}>
        <Text style={s.small}>{day.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '')}</Text>
        <Text style={styles.date}>{day.getDate()}</Text>
      </View>
      <RecipePhoto recipe={recipe} height={64} style={styles.photo} />
      <View style={styles.copy}>
        <Text style={s.strong} numberOfLines={2}>{recipe.title}</Text>
        <Text style={s.small}>{t.common.minutes(recipe.minutes)} · {cost}</Text>
      </View>
    </Pressable>
    <Pressable onPress={() => onToggle(entry)} hitSlop={10} accessibilityRole="checkbox" accessibilityState={{ checked: entry.cooked }} accessibilityLabel={t.menus.cookedLabel(recipe.title)}>
      <Ionicons name={entry.cooked ? 'checkmark-circle' : 'ellipse-outline'} size={28} color={colors.green} />
    </Pressable>
  </Card>;
});

const styles = StyleSheet.create({
  row: { padding: 10, marginBottom: 10 }, done: { opacity: .65 }, flex: { flex: 1 },
  day: { width: 38, alignItems: 'center' }, date: { fontSize: 20, fontWeight: '700', color: colors.ink },
  photo: { width: 64 }, copy: { flex: 1, gap: 2 },
});
