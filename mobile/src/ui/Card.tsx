import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { IconName } from './Button';
import { s } from './styles';
import { colors, serif } from './theme';

export const Card = ({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) => <View style={[s.card, style]}>{children}</View>;

// Carte vide avec une icône, un titre, un texte et une action.
export function Empty({ icon, title, text, children }: { icon: IconName; title: string; text: string; children?: ReactNode }) {
  return <Card style={styles.empty}>
    <View style={styles.mark}><Ionicons name={icon} size={28} color={colors.green} /></View>
    <Text style={styles.title}>{title}</Text>
    <Text style={[s.intro, styles.center]}>{text}</Text>
    {children}
  </Card>;
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', paddingVertical: 28 },
  mark: { width: 60, height: 60, borderRadius: 20, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  title: { fontFamily: serif, fontSize: 21, color: colors.ink, textAlign: 'center' },
  center: { textAlign: 'center' },
});
