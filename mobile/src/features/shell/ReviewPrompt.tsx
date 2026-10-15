import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';
import { useStore } from '@/store';

// Demande d'avis officielle d'Apple et Google, une seule fois, après une vraie réussite :
// le 3e dîner préparé. Jamais pendant une action, sans récompense ni tri des utilisateurs.
// Le système décide seul s'il affiche la demande.
const ASKED_KEY = 'vegebudget-avis-demande', AFTER_COOKED = 3;

export function ReviewPrompt() {
  const cooked = useStore(st => st.state.plans.reduce((n, plan) => n + plan.entries.filter(e => e.cooked).length, 0));
  useEffect(() => {
    if (cooked < AFTER_COOKED) return;
    const timer = setTimeout(() => void (async () => {
      try {
        if (await AsyncStorage.getItem(ASKED_KEY) || !(await StoreReview.hasAction())) return;
        await AsyncStorage.setItem(ASKED_KEY, new Date().toISOString());
        await StoreReview.requestReview();
      } catch { /* la demande d'avis ne doit jamais gêner l'appli */ }
    })(), 1500);
    return () => clearTimeout(timer);
  }, [cooked]);
  return null;
}
