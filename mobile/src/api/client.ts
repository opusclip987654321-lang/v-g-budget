import { Platform } from 'react-native';
import Constants from 'expo-constants';
import type { Ingredient, Recipe, UserState } from '@/domain';
import { session } from './storage';
import { t } from '@/i18n';

// Adresse du site (app.json → extra.apiUrl). En développement : EXPO_PUBLIC_API_URL=http://192.168.x.x:3000
export const API_URL = (process.env.EXPO_PUBLIC_API_URL || (Constants.expoConfig?.extra?.apiUrl as string | undefined) || 'https://vegebudget.fr').replace(/\/$/, '');

export type Bootstrap = {
  state: UserState; revision: number; admin: boolean; user: { id: string; name: string; email: string } | null;
  catalog: { recipes: Recipe[]; ingredients: Ingredient[]; config: { hidden: string[]; overrides: Record<string, Recipe> } };
  billingReady: boolean; subscriptionStatus: string; subscriptionPlan?: string;
};

// Adresse de contact affichée dans l'appli (Compte → Écrire au support).
export const SUPPORT_EMAIL = 'bonjour@vegebudget.fr';

export class ApiError extends Error { constructor(message: string, public status: number, public offline = false) { super(message); } }

export async function api<T>(action: string, values?: Record<string, unknown>): Promise<T> {
  const token = await session.get();
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  let response: Response;
  try {
    response = await fetch(values ? `${API_URL}/api/app` : `${API_URL}/api/app?action=${encodeURIComponent(action)}`, values
      ? { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ action, ...values }) }
      : { headers });
  } catch {
    throw new ApiError(t.errors.offline, 0, true);
  }
  const data = await response.json().catch(() => ({ error: t.errors.unreadable }));
  if (!response.ok) throw new ApiError(typeof data?.error === 'string' ? data.error : t.errors.failed, response.status);
  return data as T;
}

export async function requestLoginLink(email: string) {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/auth/request`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, appli: true }) });
  } catch { throw new ApiError(t.errors.offline, 0, true); }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(typeof data?.error === 'string' ? data.error : t.errors.loginFailed, response.status);
}

// Ouverture de l'appli comptée dans les statistiques du site (source « appli »), comme une visite.
export function trackOpen() {
  fetch(`${API_URL}/api/track`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'visite', utm: `appli-${Platform.OS}` }) }).catch(() => {});
}
