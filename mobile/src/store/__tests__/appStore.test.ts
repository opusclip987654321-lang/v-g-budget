import { addDay, blankState, checkedForWeek, monday, shopping, type UserState } from '@/domain';
import type { Bootstrap } from '@/api';
import { currentPlan, useStore } from '@/store'; // jest.mock ci-dessous est appliqué avant cet import

// Le site est simulé : on vérifie les règles de l'appli, pas le réseau.
const mockServer = { revision: 0, state: blankState() as UserState, offline: false, billingReady: false, subscriptionStatus: 'none', signedIn: false, slowGuestReply: false };
const mockMemory: { session: string | null; cache: Bootstrap | null; guest: UserState | null } = { session: null, cache: null, guest: null };

jest.mock('@/api', () => {
  class ApiError extends Error { offline: boolean; constructor(message: string, offline = false) { super(message); this.offline = offline; } }
  const bootstrap = (): Bootstrap => ({
    state: mockServer.state, revision: mockServer.revision, admin: false, user: mockServer.signedIn && mockMemory.session ? { id: 'u1', name: '', email: 'test@example.invalid' } : null,
    catalog: { recipes: jest.requireActual('@/domain').baseRecipes, ingredients: jest.requireActual('@/domain').baseIngredients, config: { hidden: [], overrides: {} } },
    billingReady: mockServer.billingReady, subscriptionStatus: mockServer.subscriptionStatus,
  });
  return {
    ApiError,
    api: jest.fn(async (action: string, values?: { state: UserState; revision: number }) => {
      if (mockServer.offline) throw new ApiError('Pas de connexion', true);
      if (action === 'bootstrap') {
        const reply = bootstrap(); // la session est lue au départ de la requête, comme sur le vrai réseau
        if (mockServer.slowGuestReply && !reply.user) await new Promise(r => setTimeout(r, 30));
        return reply;
      }
      if (action === 'state' && values) { mockServer.state = values.state; mockServer.revision += 1; return { revision: mockServer.revision }; }
      throw new Error(`action inconnue : ${action}`);
    }),
    session: { get: async () => mockMemory.session, set: async (v: string) => { mockMemory.session = v; }, clear: async () => { mockMemory.session = null; } },
    offline: {
      read: async () => mockMemory.cache, write: async (d: Bootstrap) => { mockMemory.cache = d; }, clear: async () => { mockMemory.cache = null; },
      readGuest: async () => mockMemory.guest, writeGuest: async (s: UserState) => { mockMemory.guest = s; }, clearGuest: async () => { mockMemory.guest = null; },
    },
  };
});

const plan = () => { const st = useStore.getState(); return currentPlan(st.state, st.week); };
const initial = useStore.getState();

beforeEach(() => {
  Object.assign(mockServer, { revision: 0, state: blankState(), offline: false, billingReady: false, subscriptionStatus: 'none', signedIn: false, slowGuestReply: false });
  Object.assign(mockMemory, { session: null, cache: null, guest: null });
  useStore.setState(initial, true);
});

test('sans compte : les menus sont composés et gardés sur le téléphone', async () => {
  await useStore.getState().load();
  expect(useStore.getState().sync).toBe('guest');
  let result!: ReturnType<typeof initial.generate>;
  result = useStore.getState().generate();
  expect(result).toMatchObject({ saved: true, problem: null });
  expect(plan()?.entries).toHaveLength(useStore.getState().state.profile.mealCount);
  expect(mockMemory.guest?.plans).toHaveLength(1);
});

test('la liste de courses se coche et se décoche', async () => {
  await useStore.getState().load();
  useStore.getState().generate();
  const st = useStore.getState();
  const first = shopping(plan()!.entries, st.state.pantry, st.state.prices, st.allRecipes, st.ingredients, st.state.packSizes).find(i => i.missing > 0)!;
  const checked = () => checkedForWeek(useStore.getState().state, useStore.getState().week);
  useStore.getState().toggleChecked(first.id);
  expect(checked()).toEqual([first.id]);
  useStore.getState().toggleChecked(first.id);
  expect(checked()).toEqual([]);
});

test('connexion : les menus faits en invité deviennent ceux du compte', async () => {
  await useStore.getState().load();
  useStore.getState().generate();
  mockServer.signedIn = true;
  await useStore.getState().signIn('jeton');
  await useStore.getState().load(); // attend la fin de l'envoi
  expect(mockServer.state.plans).toHaveLength(1);
  expect(mockMemory.guest).toBeNull();
  expect(useStore.getState().sync).toBe('saved');
});

test('lien de connexion ouvert pendant le démarrage : les menus invité ne sont pas perdus', async () => {
  await useStore.getState().load();
  useStore.getState().generate();
  Object.assign(mockServer, { signedIn: true, slowGuestReply: true });
  const starting = useStore.getState().load(); // démarrage de l'appli : sa requête part sans session…
  await new Promise(r => setTimeout(r, 0));
  await useStore.getState().signIn('jeton'); // …puis le lien de connexion arrive avant sa réponse
  await starting;
  expect(useStore.getState().signedIn).toBe(true);
  expect(plan()?.entries.length).toBeGreaterThan(0);
  expect(mockServer.state.plans).toHaveLength(1);
});

test('offre Découverte : une deuxième semaine affiche Premium', async () => {
  const previous = { ...blankState(), onboardingDone: true };
  Object.assign(mockServer, { signedIn: true, billingReady: true });
  mockMemory.session = 'jeton';
  await useStore.getState().load();
  useStore.getState().generate();
  // La semaine dernière existe déjà : en composer une nouvelle dépasse l'offre gratuite.
  const plan = useStore.getState().state.plans[0];
  useStore.setState({ state: { ...previous, plans: [{ ...plan, id: 'ancienne', weekStart: addDay(monday(), -7) }] } });
  let result!: ReturnType<typeof initial.generate>;
  result = useStore.getState().generate();
  expect(result.saved).toBe(false);
  expect(useStore.getState().paywall).toBe(true);
});

test('hors connexion : le changement est gardé puis envoyé au retour du réseau', async () => {
  Object.assign(mockServer, { signedIn: true });
  mockMemory.session = 'jeton';
  await useStore.getState().load();
  mockServer.offline = true;
  useStore.getState().generate();
  await useStore.getState().load(); // toucher le bandeau hors connexion ne doit rien perdre
  expect(useStore.getState().sync).toBe('offline');
  expect(useStore.getState().state.plans).toHaveLength(1); // les menus restent affichés
  mockServer.offline = false;
  await useStore.getState().load();
  expect(mockServer.state.plans).toHaveLength(1);
  expect(useStore.getState().sync).toBe('saved');
});
