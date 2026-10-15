import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '@/store';
import { colors } from '@/ui';
import { t } from '@/i18n';

// Bandeau « hors connexion » ou « échec d'enregistrement ». Le toucher relance le chargement.
export function SyncBanner() {
  const { sync, syncMessage, load } = useStore(useShallow(st => ({ sync: st.sync, syncMessage: st.syncMessage, load: st.load })));
  if (!(sync === 'offline' || sync === 'error') || !syncMessage) return null;
  return <Pressable onPress={() => void load()} style={styles.banner} accessibilityRole="button">
    <Ionicons name={sync === 'offline' ? 'cloud-offline-outline' : 'alert-circle-outline'} size={18} color={colors.warningText} />
    <Text style={styles.text}>{syncMessage}{sync === 'error' ? ` ${t.common.retry}` : ''}</Text>
  </Pressable>;
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', backgroundColor: colors.warning, borderColor: '#ebcfbc', borderWidth: 1, borderRadius: 12, padding: 12 },
  text: { flex: 1, color: colors.warningText, fontSize: 13, lineHeight: 18 },
});
