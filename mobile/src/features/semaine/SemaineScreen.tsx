import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useShallow } from 'zustand/react/shallow';
import { localDate, money, priceSource, totals } from '@/domain';
import { AppScreen } from '@/features/shell';
import { useItems, usePlan, useStore } from '@/store';
import { Button, Card, colors, Empty, RecipePhoto, s } from '@/ui';
import { t } from '@/i18n';

// Accueil : le prochain dîner, le budget de la semaine et l'accès aux courses.
export default function SemaineScreen() {
  const { ready, profile, allRecipes, signedIn } = useStore(useShallow(st => ({ ready: st.ready, profile: st.state.profile, allRecipes: st.allRecipes, signedIn: st.signedIn })));
  const plan = usePlan(), items = useItems();
  if (!ready) return <AppScreen title={t.common.appName}><ActivityIndicator color={colors.green} style={styles.loader} /></AppScreen>;
  const name = profile.nickname;
  if (!plan) return <AppScreen eyebrow={t.week.emptyEyebrow} title={name ? t.week.hello(name) : t.week.emptyTitle} intro={t.week.emptyIntro}>
    <Empty icon="sparkles-outline" title={t.week.startTitle} text={t.week.startText}>
      <Button label={t.common.compose} icon="arrow-forward" onPress={() => router.push('/bienvenue')} style={styles.stretch} />
    </Empty>
    {!signedIn && <Button variant="ghost" label={t.week.haveAccount} onPress={() => router.push('/login')} />}
  </AppScreen>;

  const today = localDate(new Date());
  const waiting = plan.entries.filter(e => !e.cooked).sort((a, b) => a.date.localeCompare(b.date));
  const next = waiting.find(e => e.date >= today) ?? waiting[0];
  const nextRecipe = next && allRecipes.find(r => r.id === next.recipeId);
  const cooked = plan.entries.length - waiting.length;
  return <AppScreen eyebrow={t.week.eyebrow} title={name ? t.week.hello(name) : t.week.title}>
    {!signedIn && <Pressable onPress={() => router.push('/login')} style={[s.card, s.row, styles.guest]} accessibilityRole="button">
      <Ionicons name="leaf-outline" size={18} color={colors.green} />
      <Text style={[s.small, styles.guestText]}>{t.week.guest}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.green} />
    </Pressable>}
    <View style={[s.row, styles.stats]}>
      <Card style={styles.flex}><Text style={s.small}>{t.week.estimated}</Text><Text style={s.figure}>{money(totals(items).purchase)}</Text><Text style={s.small}>{t.week.budget(money(plan.budget ?? profile.budget))}</Text></Card>
      <Card style={styles.flex}><Text style={s.small}>{t.week.cooked}</Text><Text style={s.figure}>{cooked} / {plan.entries.length}</Text><Text style={s.small}>{t.week.thisWeek}</Text></Card>
    </View>
    {nextRecipe && next ? <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/recette/[id]', params: { id: nextRecipe.id, entry: next.id } })}>
      <Card style={styles.next}>
        <RecipePhoto recipe={nextRecipe} height={170} style={styles.square} />
        <View style={styles.nextBody}>
          <Text style={s.eyebrow}>{new Date(`${next.date}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}</Text>
          <Text style={s.h2}>{nextRecipe.title}</Text>
          <Text style={s.small}>{t.common.minutes(nextRecipe.minutes)} · {t.common.people(next.servings)}</Text>
        </View>
      </Card>
    </Pressable> : <Empty icon="checkmark-done-outline" title={t.week.finishedTitle} text={t.week.finishedText} />}
    <Button label={t.week.toShopping} icon="basket-outline" onPress={() => router.navigate('/courses')} />
    <Button variant="secondary" label={t.week.redo} icon="refresh" onPress={() => router.push('/bienvenue')} />
    <Text style={[s.small, styles.center]}>{t.common.priceSource(priceSource())}</Text>
  </AppScreen>;
}

const styles = StyleSheet.create({
  loader: { marginTop: 40 }, stretch: { alignSelf: 'stretch', marginTop: 8 }, flex: { flex: 1 }, center: { textAlign: 'center' },
  guest: { backgroundColor: colors.mint }, guestText: { flex: 1, color: colors.green }, stats: { alignItems: 'stretch' },
  next: { padding: 0, overflow: 'hidden' }, nextBody: { padding: 16, gap: 4 }, square: { borderRadius: 0 },
});
