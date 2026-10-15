import { useMemo } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';
import { money, packLabel, shoppingText, totals } from '@/domain';
import { AppPageHeader, AppScreen } from '@/features/shell';
import { useChecked, useItems, usePlan, useStore } from '@/store';
import { Button, Card, Empty, s } from '@/ui';
import { ShoppingRow } from './ShoppingRow';
import { t } from '@/i18n';

type Row = { type: 'group'; key: string; title: string } | { type: 'item'; key: string; name: string; pack: string; price: string; done: boolean; first: boolean; last: boolean };

// Liste de courses groupée par rayon. Elle reste lisible et cochable sans réseau.
export default function CoursesScreen() {
  const plan = usePlan(), items = useItems(), checked = useChecked();
  const { packSizes, week, toggleChecked, commit } = useStore(useShallow(st => ({ packSizes: st.state.packSizes, week: st.week, toggleChecked: st.toggleChecked, commit: st.commit })));
  const toBuy = useMemo(() => items.filter(i => i.missing > 0), [items]);
  const rows = useMemo(() => [...new Set(toBuy.map(i => i.ingredient.category))].flatMap((group): Row[] => {
    const inGroup = toBuy.filter(i => i.ingredient.category === group);
    return [{ type: 'group', key: `g-${group}`, title: group }, ...inGroup.map((item, index): Row => ({
      type: 'item', key: item.id, name: item.ingredient.name, price: money(item.purchaseCost), done: checked.includes(item.id), first: index === 0, last: index === inGroup.length - 1,
      pack: packLabel(item.packages, packSizes[item.id] ?? item.ingredient.pack, item.ingredient.unit, item.ingredient.name),
    }))];
  }), [toBuy, checked, packSizes]);
  if (!plan) return <AppScreen eyebrow={t.shopping.eyebrow} title={t.shopping.title}>
    <Empty icon="basket-outline" title={t.shopping.emptyTitle} text={t.shopping.emptyText}>
      <Button label={t.common.compose} onPress={() => router.push('/bienvenue')} style={styles.stretch} />
    </Empty>
  </AppScreen>;
  const left = toBuy.filter(i => !checked.includes(i.id));
  return <SafeAreaView style={s.screen} edges={['top']}>
    <FlashList data={rows} keyExtractor={r => r.key} getItemType={r => r.type} contentContainerStyle={s.list}
      ListHeaderComponent={<View style={styles.header}>
        <AppPageHeader eyebrow={t.shopping.eyebrow} title={t.shopping.title} intro={t.shopping.intro} />
        <Card style={s.row}>
          <View style={styles.flex}><Text style={s.small}>{t.shopping.left}</Text><Text style={s.figure}>{money(totals(left).purchase)}</Text></View>
          <Text style={s.pill}>{t.shopping.count(left.length, toBuy.length)}</Text>
        </Card>
      </View>}
      renderItem={({ item }) => item.type === 'group' ? <Text style={[s.h2, styles.group]}>{item.title}</Text>
        : <ShoppingRow id={item.key} name={item.name} pack={item.pack} price={item.price} done={item.done} first={item.first} last={item.last} onToggle={toggleChecked} />}
      ListFooterComponent={<View style={styles.footer}>
        <Button variant="secondary" icon="share-outline" label={t.shopping.share} onPress={() => void Share.share({ message: shoppingText(items, checked) })} />
        {checked.length > 0 && <Button variant="ghost" label={t.shopping.uncheck} onPress={() => commit(st => ({ ...st, checkedByWeek: { ...st.checkedByWeek, [week]: [] } }))} />}
      </View>} />
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  stretch: { alignSelf: 'stretch', marginTop: 8 }, flex: { flex: 1 }, header: { gap: 14, marginBottom: 6 },
  group: { marginBottom: 8, marginTop: 8 }, footer: { gap: 6, marginTop: 10 },
});
