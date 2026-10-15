import { useEffect } from 'react';
import { AppState, StyleSheet, Text, View } from 'react-native';
import type { ErrorBoundaryProps } from 'expo-router';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { trackOpen } from '@/api';
import { ReviewPrompt } from '@/features/shell';
import { useStore } from '@/store';
import { Button, colors, s } from '@/ui';
import { t } from '@/i18n';

// Démarrage : données du compte (ou copie hors connexion). Au retour dans l'appli, on renvoie
// ce qui n'a pas pu être enregistré sans réseau. Offre Découverte dépassée : on présente Premium.
function Lifecycle() {
  const paywall = useStore(s => s.paywall);
  useEffect(() => {
    trackOpen(); void useStore.getState().load();
    const sub = AppState.addEventListener('change', state => { if (state === 'active') useStore.getState().retrySave(); });
    return () => sub.remove();
  }, []);
  useEffect(() => { if (paywall) { useStore.getState().closePaywall(); router.push('/premium'); } }, [paywall]);
  return null;
}

export default function RootLayout() {
  return <>
    <StatusBar style="dark" />
    <Lifecycle />
    <ReviewPrompt />
    <Stack screenOptions={{ headerTintColor: colors.green, headerStyle: { backgroundColor: colors.background }, headerShadowVisible: false, headerBackTitle: t.common.back, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="(onglets)" options={{ headerShown: false }} />
      <Stack.Screen name="recette/[id]" options={{ title: '' }} />
      <Stack.Screen name="bienvenue" options={{ title: t.titles.preferences, presentation: 'modal' }} />
      <Stack.Screen name="login" options={{ title: t.titles.login, presentation: 'modal' }} />
      <Stack.Screen name="premium" options={{ title: t.titles.premium, presentation: 'modal' }} />
      <Stack.Screen name="connexion" options={{ headerShown: false }} />
    </Stack>
  </>;
}

// Erreur inattendue dans un écran : un message clair et un bouton pour réessayer, au lieu d'un écran blanc.
// (À relier à un outil de suivi des erreurs, voir README.md.)
export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return <View style={[s.screen, s.content, styles.center]}>
    <Text style={s.title}>{t.errors.crashTitle}</Text>
    <Text style={s.intro}>{t.errors.crashText}</Text>
    <Button label={t.errors.crashRetry} icon="refresh" onPress={() => void retry()} />
  </View>;
}

const styles = StyleSheet.create({ center: { justifyContent: 'center' } });
