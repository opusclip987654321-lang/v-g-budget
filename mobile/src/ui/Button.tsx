import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from './theme';

export type IconName = keyof typeof Ionicons.glyphMap;

export function Button({ label, onPress, variant = 'primary', icon, disabled, busy, style }: { label: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'ghost'; icon?: IconName; disabled?: boolean; busy?: boolean; style?: StyleProp<ViewStyle> }) {
  const color = variant === 'primary' ? '#fff' : colors.green;
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!(disabled || busy), busy: !!busy }} disabled={disabled || busy} onPress={onPress}
    style={({ pressed }) => [styles.button, styles[variant], (pressed || disabled) && styles.dim, style]}>
    {busy ? <ActivityIndicator color={color} /> : icon ? <Ionicons name={icon} size={18} color={color} /> : null}
    <Text style={[styles.label, { color }]}>{label}</Text>
  </Pressable>;
}

const styles = StyleSheet.create({
  button: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 18, minHeight: 48 },
  primary: { backgroundColor: colors.green },
  secondary: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  ghost: { backgroundColor: 'transparent', paddingVertical: 10 },
  dim: { opacity: .7 },
  label: { fontSize: 15, fontWeight: '700' },
});
