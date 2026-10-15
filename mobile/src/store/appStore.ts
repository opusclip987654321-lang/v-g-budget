import { create } from 'zustand';
import { api, ApiError, offline, session, type Bootstrap } from '@/api';
import {
  awardChallenges, baseIngredients, baseRecipes, blankState, checkedForWeek, cookMeal, generatePlan, localizeIngredients, monday,
  setRegion, type Entry, type Plan, type Recipe, type UserState,
} from '@/domain';
import { t } from '@/i18n';

// État de l'appli (Zustand) : mêmes règles que le site (app/vege-app.tsx), mêmes données (/api/app).
// Chaque écran lit seulement ce qu'il affiche (sélecteurs), pour ne pas tout redessiner à chaque case cochée.
type Sync = 'loading' | 'saved' | 'saving' | 'offline' | 'error' | 'guest';
type Catalog = { recipes: Recipe[]; allRecipes: Recipe[]; ingredients: ReturnType<typeof localizeIngredients> };
type Store = Catalog & {
  ready: boolean; signedIn: boolean; email: string; state: UserState; data: Bootstrap | null;
  sync: Sync; syncMessage: string; paywall: boolean; week: string;
  load: () => Promise<void>; retrySave: () => void; closePaywall: () => void;
  commit: (update: (s: UserState) => UserState) => boolean;
  /** Compose les menus de la semaine. saved=false : aucun menu possible (problem) ou offre gratuite dépassée (Premium s'affiche). */
  generate: () => { saved: boolean; problem: string | null; warning: string | null };
  toggleCooked: (entry: Entry) => void; toggleChecked: (id: string) => void;
  signIn: (token: string) => Promise<void>; signOut: () => Promise<void>;
};

// Catalogue du site (recettes masquées ou modifiées par l'admin), prix du pays du membre.
function catalogFor(data: Bootstrap | null, state: UserState): Catalog {
  const region = state.profile.region ?? 'FR';
  setRegion(region);
  const overrides = data?.catalog.config.overrides ?? {};
  return {
    recipes: data?.catalog.recipes ?? baseRecipes,
    allRecipes: [...baseRecipes.map(r => overrides[r.id] ?? r), ...Object.values(overrides).filter(r => !baseRecipes.some(b => b.id === r.id))],
    ingredients: localizeIngredients(data?.catalog.ingredients ?? baseIngredients, region),
  };
}
export const isPremium = (data: Bootstrap | null) => !!data && (data.admin || ['active', 'trialing'].includes(data.subscriptionStatus));

// Enregistrements envoyés un par un, dans l'ordre ; ce qui échoue hors connexion est renvoyé plus tard.
let queue: Promise<void> = Promise.resolve(), loading: Promise<void> = Promise.resolve(), revision = 0, unsaved = false;

export const useStore = create<Store>()((set, get) => {
  // Le catalogue n'est recalculé que si les données du site ou le pays changent (sinon les écrans gardent les mêmes objets).
  const apply = (state: UserState, data = get().data) => {
    const prev = get();
    const same = data === prev.data && (state.profile.region ?? 'FR') === (prev.state.profile.region ?? 'FR');
    set(same ? { state } : { state, data, ...catalogFor(data, state) });
  };

  function persist(snapshot: UserState) {
    if (!get().signedIn) { void offline.writeGuest(snapshot); set({ sync: 'guest' }); return; }
    set({ sync: 'saving', syncMessage: '' });
    queue = queue.then(async () => {
      const result = await api<{ revision: number }>('state', { state: snapshot, revision });
      revision = result.revision; unsaved = false; set({ sync: 'saved' });
      const data = get().data;
      if (data) void offline.write({ ...data, state: snapshot, revision });
    }).catch((e: ApiError) => {
      if (e.offline) { unsaved = true; set({ sync: 'offline', syncMessage: t.errors.notSaved }); return; }
      set({ sync: 'error', syncMessage: e.message });
    });
  }

  function commit(update: (s: UserState) => UserState) {
    const { state, data, allRecipes, ingredients } = get();
    let next = update(state);
    const active = next.plans.find(p => p.id === next.activePlanId);
    if (active) next = awardChallenges(next, active, allRecipes, ingredients);
    // Offre Découverte : une seule semaine enregistrée (même règle que le site).
    if (data?.billingReady && !isPremium(data) && next.plans.length > 1) { set({ paywall: true }); return false; }
    apply(next); persist(next); return true;
  }

  async function loadNow() {
    // Des changements faits hors connexion attendent : on les envoie d'abord, et on ne les écrase jamais.
    if (unsaved && get().signedIn) persist(get().state);
    await queue;
    if (unsaved) { set({ ready: true }); return; }
    const token = await session.get();
    set({ signedIn: !!token, week: monday() });
    try {
      const result = await api<Bootstrap>('bootstrap');
      revision = result.revision;
      if (!result.user) {
        if (token) await session.clear();
        set({ signedIn: false, email: '', sync: 'guest', syncMessage: '' });
        apply((await offline.readGuest()) ?? result.state, result);
      } else {
        await offline.write(result);
        set({ email: result.user.email, sync: 'saved', syncMessage: '' });
        // Menus composés en invité avant la connexion : ils deviennent ceux du compte (comme sur le site).
        const guest = await offline.readGuest();
        if (guest && result.revision === 0) {
          const merged = { ...guest, profile: { ...guest.profile, nickname: guest.profile.nickname || result.state.profile.nickname } };
          apply(merged, result); persist(merged); await offline.clearGuest();
        } else apply(result.state, result);
      }
    } catch (e) {
      const cached = token ? await offline.read() : null;
      if (cached) { revision = cached.revision; set({ email: cached.user?.email ?? '', sync: 'offline', syncMessage: t.errors.lastSaved }); apply(cached.state, cached); }
      else { const guest = await offline.readGuest(); if (guest) apply(guest); set({ sync: token ? 'error' : 'guest', syncMessage: (e as Error).message }); }
    }
    set({ ready: true });
  }

  return {
    ready: false, signedIn: false, email: '', state: blankState(), data: null, sync: 'loading', syncMessage: '', paywall: false, week: monday(),
    ...catalogFor(null, blankState()),

    // Un chargement à la fois : celui du lien de connexion passe après celui du démarrage (sinon l'ancien écraserait le nouveau).
    load() { loading = loading.then(loadNow, loadNow); return loading; },
    retrySave() { if (unsaved) persist(get().state); },
    closePaywall: () => set({ paywall: false }),
    commit,
    generate() {
      const { state, week, recipes, ingredients } = get();
      const plan = currentPlan(state, week);
      const result = generatePlan(state, week, Date.now(), recipes, ingredients, plan ? plan.entries.filter(e => e.locked || e.cooked) : []);
      if (!result.plan) return { saved: false, problem: result.warning ?? t.errors.noMenus, warning: null };
      const made = result.plan;
      const saved = commit(s => ({ ...s, plans: [...s.plans.filter(p => p.weekStart !== week), made].slice(-52), activePlanId: made.id, checkedByWeek: { ...s.checkedByWeek, [week]: [] }, onboardingDone: true }));
      return { saved, problem: null, warning: saved ? result.warning : null };
    },
    // Préparé ou non : le placard est mis à jour dans les deux sens (comme sur le site).
    toggleCooked(entry) {
      const { state, week, allRecipes } = get();
      const plan = currentPlan(state, week);
      if (plan) commit(s => cookMeal(s, plan, entry.id, allRecipes));
    },
    toggleChecked(id) {
      const week = get().week;
      commit(s => { const list = checkedForWeek(s, week); return { ...s, checkedByWeek: { ...s.checkedByWeek, [week]: list.includes(id) ? list.filter(x => x !== id) : [...list, id] } }; });
    },
    async signIn(token) { await session.set(token); await get().load(); },
    async signOut() { await queue; await session.clear(); await offline.clear(); set({ data: null, email: '' }); apply(blankState(), null); await get().load(); },
  };
});

export function currentPlan(state: UserState, week: string): Plan | null {
  return state.plans.find(p => p.id === state.activePlanId && p.weekStart === week) ?? state.plans.filter(p => p.weekStart === week).at(-1) ?? null;
}

