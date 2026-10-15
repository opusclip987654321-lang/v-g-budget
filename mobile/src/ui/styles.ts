import { StyleSheet } from 'react-native';
import { colors, serif } from './theme';

// Styles communs. Les écrans gardent leurs styles propres dans leur fichier (StyleSheet.create en bas du fichier).
export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingBottom: 40, gap: 14 },
  header: { gap: 10 },
  list: { padding: 18, paddingBottom: 40 },
  eyebrow: { color: colors.subtle, fontSize: 12, fontWeight: '600', letterSpacing: 1.6 },
  title: { fontFamily: serif, fontSize: 30, color: colors.ink, letterSpacing: -.6 },
  intro: { color: colors.subtle, fontSize: 15, lineHeight: 22 },
  h2: { fontFamily: serif, fontSize: 22, color: colors.ink, marginTop: 6 },
  text: { color: colors.ink, fontSize: 15, lineHeight: 22 },
  strong: { color: colors.ink, fontSize: 15, lineHeight: 22, fontWeight: '600' },
  small: { color: colors.subtle, fontSize: 13, lineHeight: 18 },
  figure: { fontSize: 24, fontWeight: '700', color: colors.ink },
  card: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pill: { backgroundColor: colors.mint, color: colors.green, fontSize: 12, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, overflow: 'hidden' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, fontSize: 16, color: colors.ink },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
});
