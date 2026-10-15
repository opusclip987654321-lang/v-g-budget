import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { requestLoginLink } from '@/api';
import { t } from '@/i18n';
import { Button, Card, colors, s } from '@/ui';

// Connexion sans mot de passe : le lien reçu par e-mail rouvre l'appli (route /connexion).
// L'adresse saisie est gardée en cas d'erreur.
export default function LoginScreen() {
  const [email, setEmail] = useState(''), [sent, setSent] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function send() {
    setBusy(true); setError('');
    try { await requestLoginLink(email.trim()); setSent(true); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[s.screen, s.content]}>
    {sent ? <Card style={styles.sent}>
      <View style={styles.mark}><Ionicons name="mail-open-outline" size={30} color={colors.green} /></View>
      <Text style={[s.h2, styles.center]}>{t.login.sentTitle}</Text>
      <Text style={[s.intro, styles.center]}>{t.login.sentText(email.trim())}</Text>
      <Button variant="ghost" label={t.login.changeEmail} onPress={() => setSent(false)} />
    </Card> : <>
      <Text style={s.title} accessibilityRole="header">{t.login.title}</Text>
      <Text style={s.intro}>{t.login.intro}</Text>
      <TextInput value={email} onChangeText={setEmail} placeholder={t.login.placeholder} placeholderTextColor={colors.subtle} autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="emailAddress"
        onSubmitEditing={send} returnKeyType="send" style={s.input} accessibilityLabel={t.login.placeholder} />
      {error ? <Text style={styles.error} accessibilityLiveRegion="polite">{error}</Text> : null}
      <Button label={t.login.send} icon="mail-outline" busy={busy} disabled={!email.includes('@')} onPress={send} />
      <Text style={s.small}>{t.login.keepGuest}</Text>
    </>}
  </KeyboardAvoidingView>;
}

const styles = StyleSheet.create({
  sent: { alignItems: 'center', paddingVertical: 28 }, center: { textAlign: 'center' }, error: { color: colors.danger },
  mark: { width: 64, height: 64, borderRadius: 22, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
});
