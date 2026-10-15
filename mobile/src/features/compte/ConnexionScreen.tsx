import { useEffect, useState } from 'react';
import { ActivityIndicator, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { t } from '@/i18n';
import { useStore } from '@/store';
import { Button, colors, Screen, s } from '@/ui';

// Ouverte par le lien de l'e-mail : vegebudget://connexion?session=… (ou ?erreur=expiree).
export default function ConnexionScreen() {
  const { session, erreur } = useLocalSearchParams<{ session?: string; erreur?: string }>();
  const signIn = useStore(st => st.signIn);
  const [failed, setFailed] = useState(!!erreur || !session);
  useEffect(() => {
    if (!session) return;
    signIn(session).then(() => router.replace('/')).catch(() => setFailed(true));
  }, [session, signIn]);
  if (failed) return <Screen title={t.login.expiredTitle} intro={t.login.expiredText}>
    <Button label={t.login.newLink} onPress={() => router.replace('/login')} />
    <Button variant="ghost" label={t.login.continueGuest} onPress={() => router.replace('/')} />
  </Screen>;
  return <Screen title={t.login.opening}><ActivityIndicator color={colors.green} /><Text style={s.intro}>{t.login.openingText}</Text></Screen>;
}
