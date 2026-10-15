import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { region } from '@/domain';
import { t } from '@/i18n';
import { usePremium } from '@/store';
import { Card, colors, s } from '@/ui';

// Offre Premium. L'achat dans l'appli passera par Apple et Google (décision de louis du 15/10/2026) :
// il sera branché ici avant l'envoi aux stores (voir mobile/README.md). Aucun lien vers un paiement externe.
export default function PremiumScreen() {
  const premium = usePremium();
  return <ScrollView style={s.screen} contentContainerStyle={s.content}>
    <Text style={s.title}>{premium ? t.premium.titleOn : t.premium.titleOff}</Text>
    <Text style={s.intro}>{premium ? t.premium.introOn : t.premium.introOff(region().premium.label)}</Text>
    <Card>
      {t.premium.perks.map(perk => <View key={perk} style={s.row}><Ionicons name="checkmark-circle" size={20} color={colors.green} /><Text style={[s.text, styles.flex]}>{perk}</Text></View>)}
    </Card>
    {!premium && <Card style={styles.soon}><Text style={[s.text, styles.green]}>{t.premium.soon}</Text></Card>}
  </ScrollView>;
}

const styles = StyleSheet.create({ flex: { flex: 1 }, soon: { backgroundColor: colors.mint }, green: { color: colors.green } });
