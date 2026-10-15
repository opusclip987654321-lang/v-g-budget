import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { money } from '@/domain';
import { t } from '@/i18n';
import { useStore } from '@/store';
import { Button, Card, colors, s } from '@/ui';
import { Stepper } from './Stepper';

// Les questions du site (foyer, budget, temps), puis les menus de la semaine.
export default function PreferencesScreen() {
  const { p, commit, generate } = useStore(useShallow(st => ({ p: st.state.profile, commit: st.commit, generate: st.generate })));
  const [nickname, setNickname] = useState(p.nickname), [people, setPeople] = useState(p.people), [budget, setBudget] = useState(p.budget);
  const [mealCount, setMealCount] = useState(p.mealCount), [maxMinutes, setMaxMinutes] = useState(p.maxMinutes), [busy, setBusy] = useState(false);
  function save() {
    setBusy(true);
    // days : on laisse le générateur répartir les dîners sur les premiers jours de la semaine.
    if (!commit(st => ({ ...st, profile: { ...st.profile, nickname: nickname.trim().slice(0, 40), people, budget, mealCount, maxMinutes, days: undefined } }))) { setBusy(false); return; }
    // Laisse s'afficher l'indicateur avant le calcul des menus.
    requestAnimationFrame(() => {
      const result = generate(); setBusy(false);
      if (result.problem) { Alert.alert(t.preferences.noMenusTitle, result.problem); return; }
      if (!result.saved) return; // offre gratuite dépassée : Premium s'affiche
      router.back(); router.navigate('/menus');
      if (result.warning) Alert.alert(t.preferences.noteTitle, result.warning);
    });
  }
  return <ScrollView style={s.screen} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
    <Text style={s.intro}>{t.preferences.intro}</Text>
    <Card><Text style={s.strong}>{t.preferences.nickname}</Text>
      <TextInput value={nickname} onChangeText={setNickname} placeholder={t.preferences.nicknameExample} placeholderTextColor={colors.subtle} style={s.input} maxLength={40} accessibilityLabel={t.preferences.nickname} /></Card>
    <Stepper label={t.preferences.people} value={people} set={setPeople} min={1} max={8} />
    <Stepper label={t.preferences.meals} value={mealCount} set={setMealCount} min={3} max={7} />
    <Stepper label={t.preferences.budget} value={budget} set={setBudget} min={10} max={150} step={5} format={v => money(v)} />
    <Stepper label={t.preferences.time} value={maxMinutes} set={setMaxMinutes} min={15} max={60} step={5} format={t.common.minutes} />
    <Button label={t.preferences.submit} icon="sparkles-outline" busy={busy} onPress={save} style={styles.submit} />
  </ScrollView>;
}

const styles = StyleSheet.create({ submit: { marginTop: 6 } });
