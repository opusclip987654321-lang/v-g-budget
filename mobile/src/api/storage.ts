import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import type { UserState } from '@/domain';
import type { Bootstrap } from './client';

// Session de connexion : la même que le cookie du site, gardée dans le trousseau du téléphone.
const SESSION_KEY = 'vegebudget-session';
export const session = {
  async get() { return Platform.OS === 'web' ? AsyncStorage.getItem(SESSION_KEY) : SecureStore.getItemAsync(SESSION_KEY); },
  async set(value: string) { if (Platform.OS === 'web') await AsyncStorage.setItem(SESSION_KEY, value); else await SecureStore.setItemAsync(SESSION_KEY, value); },
  async clear() { if (Platform.OS === 'web') await AsyncStorage.removeItem(SESSION_KEY); else await SecureStore.deleteItemAsync(SESSION_KEY); },
};

// Copies gardées sur le téléphone : la dernière réponse du site (pour s'ouvrir sans réseau)
// et, sans compte, les menus composés en invité.
const CACHE_KEY = 'vegebudget-donnees', GUEST_KEY = 'vegebudget-invite';
export const offline = {
  async read(): Promise<Bootstrap | null> { try { const raw = await AsyncStorage.getItem(CACHE_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; } },
  async write(data: Bootstrap) { try { await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch { /* simple confort */ } },
  async clear() { await AsyncStorage.multiRemove([CACHE_KEY]); },
  async readGuest(): Promise<UserState | null> { try { const raw = await AsyncStorage.getItem(GUEST_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; } },
  async writeGuest(state: UserState) { try { await AsyncStorage.setItem(GUEST_KEY, JSON.stringify(state)); } catch { /* simple confort */ } },
  async clearGuest() { await AsyncStorage.removeItem(GUEST_KEY); },
};
