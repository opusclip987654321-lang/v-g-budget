import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, s } from '@/ui';

// Un produit de la liste de courses, à cocher dans le magasin.
export const ShoppingRow = memo(function ShoppingRow({ id, name, pack, price, done, first, last, onToggle }: { id: string; name: string; pack: string; price: string; done: boolean; first: boolean; last: boolean; onToggle: (id: string) => void }) {
  return <Pressable onPress={() => onToggle(id)} accessibilityRole="checkbox" accessibilityState={{ checked: done }} accessibilityLabel={`${name}, ${pack}`}
    style={[s.row, styles.row, first && styles.first, last && styles.last, !first && s.divider]}>
    <Ionicons name={done ? 'checkbox' : 'square-outline'} size={24} color={colors.green} />
    <View style={styles.copy}>
      <Text style={[s.text, done && styles.done]}>{name}</Text>
      <Text style={s.small}>{pack}</Text>
    </View>
    <Text style={s.strong}>{price}</Text>
  </Pressable>;
});

const styles = StyleSheet.create({
  row: { padding: 14, backgroundColor: colors.card, borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.border },
  first: { borderTopWidth: 1, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  last: { borderBottomWidth: 1, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, marginBottom: 8 },
  copy: { flex: 1 }, done: { textDecorationLine: 'line-through', color: colors.subtle },
});
