import { Alert, Linking, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { useShallow } from 'zustand/react/shallow';
import { API_URL, SUPPORT_EMAIL } from '@/api';
import { money, region } from '@/domain';
import { AppScreen } from '@/features/shell';
import { t } from '@/i18n';
import { usePremium, useStore } from '@/store';
import { Button, Card, s } from '@/ui';

export default function CompteScreen() {
  const { signedIn, email, sync, p, signOut } = useStore(useShallow(st => ({ signedIn: st.signedIn, email: st.email, sync: st.sync, p: st.state.profile, signOut: st.signOut })));
  const premium = usePremium();
  const syncText = sync === 'saved' ? t.account.saved : sync === 'saving' ? t.account.saving : sync === 'offline' ? t.account.offline : '';
  const confirmSignOut = () => Alert.alert(t.account.signOutTitle, t.account.signOutText, [{ text: t.common.cancel, style: 'cancel' }, { text: t.account.signOut, style: 'destructive', onPress: () => void signOut() }]);
  return <AppScreen eyebrow={t.account.eyebrow} title={signedIn ? t.account.titleIn : t.account.titleOut}>
    {signedIn ? <Card>
      <Text style={s.small}>{t.account.signedInAs}</Text>
      <Text style={s.strong}>{email}</Text>
      {syncText ? <Text style={s.small}>{syncText}</Text> : null}
    </Card> : <Card>
      <Text style={s.text}>{t.account.guestText}</Text>
      <Button label={t.account.signIn} icon="mail-outline" onPress={() => router.push('/login')} />
    </Card>}
    <Card>
      <Text style={s.h2}>{t.account.plan}</Text>
      <Text style={s.text}>{premium ? t.account.premiumOn : t.account.premiumOff(region().premium.label)}</Text>
      {!premium && <Button variant="secondary" label={t.account.discoverPremium} onPress={() => router.push('/premium')} />}
    </Card>
    <Card>
      <Text style={s.h2}>{t.account.preferences}</Text>
      <Text style={s.text}>{t.account.summary(p.people, p.mealCount, money(p.budget), p.maxMinutes)}</Text>
      <Button variant="secondary" label={t.account.editPreferences} onPress={() => router.push('/bienvenue')} />
    </Card>
    <View style={styles.links}>
      <Button variant="ghost" label={t.account.howItWorks} onPress={() => void Linking.openURL(`${API_URL}/comment-ca-marche`)} />
      <Button variant="ghost" label={t.account.support} onPress={() => void Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(t.account.supportSubject)}`)} />
      {signedIn && <Button variant="ghost" label={t.account.signOut} onPress={confirmSignOut} />}
    </View>
    <Text style={[s.small, styles.center]}>{t.account.footer}</Text>
    <Text style={[s.small, styles.center]}>{t.account.version(Constants.expoConfig?.version ?? '')}</Text>
  </AppScreen>;
}

const styles = StyleSheet.create({ links: { gap: 4 }, center: { textAlign: 'center' } });
