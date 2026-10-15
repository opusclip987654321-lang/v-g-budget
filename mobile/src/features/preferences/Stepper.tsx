import { Pressable, StyleSheet, Text } from 'react-native';
import { t } from '@/i18n';
import { Card, colors, s } from '@/ui';

// Choix d'un nombre avec − et +, bornes comprises.
export function Stepper({ label, value, set, min, max, step = 1, format = String }: { label: string; value: number; set: (v: number) => void; min: number; max: number; step?: number; format?: (v: number) => string }) {
  const button = (delta: number, sign: string) => <Pressable accessibilityRole="button" accessibilityLabel={delta > 0 ? t.preferences.more(label) : t.preferences.less(label)}
    disabled={delta > 0 ? value >= max : value <= min} onPress={() => set(Math.min(max, Math.max(min, value + delta)))} style={styles.button} hitSlop={6}>
    <Text style={styles.sign}>{sign}</Text>
  </Pressable>;
  return <Card style={[s.row, styles.card]}>
    <Text style={[s.strong, styles.label]}>{label}</Text>
    {button(-step, '−')}
    <Text style={styles.value} accessibilityLiveRegion="polite">{format(value)}</Text>
    {button(step, '+')}
  </Card>;
}

const styles = StyleSheet.create({
  card: { justifyContent: 'space-between' }, label: { flex: 1 },
  button: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  sign: { fontSize: 22, color: colors.green }, value: { minWidth: 70, textAlign: 'center', fontSize: 18, fontWeight: '700', color: colors.ink },
});
