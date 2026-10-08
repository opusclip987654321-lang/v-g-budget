import { db } from '@/lib/server';
import { isBot, parisDay, visitorId } from '@/lib/stats';

// Parcours de chaque visite, sans cookie : les pages vues, le temps passé et les clics sont
// regroupés par visiteur du jour (même empreinte quotidienne que les chiffres de fréquentation).
// On peut donc suivre une visite du début à la fin, mais pas reconnaître quelqu'un le lendemain.
const KEEP_DAYS = 90, MAX_STEPS = 300;
const clean = (value: unknown, max: number) => typeof value === 'string' ? value.replace(/[\u0000-\u001f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max) : '';
const clamp = (value: unknown, max: number) => Math.min(Math.max(Math.round(Number(value)) || 0, 0), max);
const cleanPath = (value: unknown) => { const path = clean(value, 120).split('?')[0]; return path.startsWith('/') ? path : null; };

export async function recordStep(request: Request, input: Record<string, unknown>) {
  if (isBot(request)) return false;
  const path = cleanPath(input.path);
  if (!path) return false;
  const now = Date.now(), day = parisDay(new Date(now)), visitor = visitorId(request, day);
  if (input.event === 'page') {
    const view = typeof input.view === 'string' && /^[a-z0-9]{4,16}$/.test(input.view) ? input.view : null;
    if (!view) return false;
    const known = await db().prepare('SELECT 1 FROM parcours WHERE visitor=? AND view=?').bind(visitor, view).first();
    if (known) {
      await db().prepare('UPDATE parcours SET seconds=MAX(seconds,?),scroll=MAX(scroll,?) WHERE visitor=? AND view=?').bind(clamp(input.seconds, 7200), clamp(input.scroll, 100), visitor, view).run();
      return true;
    }
  }
  const steps = await db().prepare('SELECT COUNT(*) AS n FROM parcours WHERE day=? AND visitor=?').bind(day, visitor).first<{ n: number }>();
  if ((steps?.n ?? 0) >= MAX_STEPS) return false;
  if (input.event === 'page') await db().prepare("INSERT INTO parcours (day,visitor,kind,view,path,seconds,scroll,created_at) VALUES (?,?,'page',?,?,?,?,?)").bind(day, visitor, input.view, path, clamp(input.seconds, 7200), clamp(input.scroll, 100), now).run();
  else await db().prepare("INSERT INTO parcours (day,visitor,kind,path,detail,created_at) VALUES (?,?,'clic',?,?,?)").bind(day, visitor, path, clean(input.detail, 60) || '(sans texte)', now).run();
  return true;
}

const APP_PAGES: Record<string, string> = { '/': 'Accueil (appli)', '/#dashboard': 'Tableau de bord', '/#menus': 'Menus de la semaine', '/#recettes': 'Recettes (appli)', '/#placard': 'Placard', '/#courses': 'Liste de courses', '/#offre': 'Offre Premium', '/#compte': 'Compte', '/#club': 'Club', '/#defis': 'Défis', '/#admin': 'Administration' };
export const pageName = (path: string) => APP_PAGES[path] ?? path;

// Étapes de l'entonnoir, de l'arrivée au clic sur « payer ».
const STEPS = [
  { id: 'arrivee', libelle: 'Arrivée sur le site' },
  { id: 'interaction', libelle: 'A cliqué ou vu une 2e page' },
  { id: 'appli', libelle: 'A ouvert l’appli (page d’accueil)' },
  { id: 'semaine', libelle: 'A composé une semaine' },
  { id: 'offre', libelle: 'A vu l’offre Premium' },
  { id: 'connexion', libelle: 'A demandé un lien de connexion' },
  { id: 'payer', libelle: 'A cliqué sur payer / réserver' },
] as const;
const EVENT_STEP: Record<string, string> = { semaine: 'semaine', offre_vue: 'offre', connexion_demandee: 'connexion', clic_payer: 'payer' };

type Row = { day: string; visitor: string; kind: string; path: string; detail: string | null; seconds: number; scroll: number; created_at: number };
type Event = { day: string; visitor: string; name: string; detail: string | null; created_at: number };
const clock = (ms: number) => new Date(ms).toLocaleTimeString('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit' });
const pct = (part: number, whole: number) => whole ? Math.round(part / whole * 100) : 0;

export async function journeys(days = 7, now = new Date()) {
  await db().prepare('DELETE FROM parcours WHERE day<?').bind(parisDay(new Date(now.getTime() - KEEP_DAYS * 86400000))).run();
  const first = parisDay(new Date(now.getTime() - (days - 1) * 86400000));
  const rows = (await db().prepare('SELECT day,visitor,kind,path,detail,seconds,scroll,created_at FROM parcours WHERE day>=? ORDER BY created_at,id').bind(first).all<Row>()).results;
  const events = (await db().prepare('SELECT day,visitor,name,detail,created_at FROM events WHERE day>=? ORDER BY created_at').bind(first).all<Event>()).results;
  const groups = new Map<string, Row[]>();
  for (const r of rows) { const key = `${r.day}|${r.visitor}`; if (!groups.has(key)) groups.set(key, []); groups.get(key)!.push(r); }

  const visits = [...groups.entries()].map(([key, steps]) => {
    const [day, visitor] = key.split('|');
    const own = events.filter(e => e.day === day && e.visitor === visitor);
    const pages = steps.filter(s => s.kind === 'page'), clicks = steps.filter(s => s.kind === 'clic');
    const reached = new Set<string>(['arrivee']);
    if (clicks.length || pages.length > 1) reached.add('interaction');
    if (pages.some(p => p.path === '/' || p.path.startsWith('/#'))) reached.add('appli');
    for (const e of own) if (EVENT_STEP[e.name]) reached.add(EVENT_STEP[e.name]);
    const furthest = [...STEPS].reverse().find(s => reached.has(s.id))!;
    const timeline = [
      ...steps.map(s => s.kind === 'page'
        ? { quand: s.created_at, type: 'page', page: pageName(s.path), secondes: s.seconds, lu: s.scroll }
        : { quand: s.created_at, type: 'clic', page: pageName(s.path), texte: s.detail ?? '' }),
      ...own.filter(e => e.name !== 'visite').map(e => ({ quand: e.created_at, type: 'etape', texte: STEPS.find(s => s.id === EVENT_STEP[e.name])?.libelle ?? e.name, detail: e.detail })),
    ].sort((a, b) => a.quand - b.quand).map(({ quand, ...rest }) => ({ heure: clock(quand), ...rest }));
    const seconds = pages.reduce((sum, p) => sum + p.seconds, 0);
    return {
      visiteur: visitor.slice(0, 6), jour: day, heure: clock(steps[0].created_at), debut: steps[0].created_at,
      source: own.find(e => e.name === 'visite')?.detail ?? 'navigation interne',
      entree: pageName(pages[0]?.path ?? steps[0].path), sortie: pageName(pages.at(-1)?.path ?? steps.at(-1)!.path),
      pages: pages.length, clics: clicks.length, secondes: seconds,
      rebond: pages.length <= 1 && !clicks.length && seconds < 15,
      plusLoin: furthest.libelle, reached, parcours: timeline,
    };
  }).sort((a, b) => b.debut - a.debut);

  const funnel = STEPS.map((s, i) => {
    const n = visits.filter(v => v.reached.has(s.id)).length, before = i ? visits.filter(v => v.reached.has(STEPS[i - 1].id)).length : n;
    return { etape: s.id, libelle: s.libelle, visites: n, pertePct: i && before ? 100 - pct(n, before) : 0, perdues: Math.max(before - n, 0) };
  });
  const byPage = new Map<string, { vues: number; entrees: number; sorties: number; secondes: number; lu: number }>();
  for (const r of rows.filter(r => r.kind === 'page')) { const p = byPage.get(r.path) ?? { vues: 0, entrees: 0, sorties: 0, secondes: 0, lu: 0 }; p.vues++; p.secondes += r.seconds; p.lu += r.scroll; byPage.set(r.path, p); }
  for (const steps of groups.values()) { const pages = steps.filter(s => s.kind === 'page'); if (!pages.length) continue; byPage.get(pages[0].path)!.entrees++; byPage.get(pages.at(-1)!.path)!.sorties++; }
  const pageRows = [...byPage.entries()].map(([path, p]) => ({ page: pageName(path), chemin: path, vues: p.vues, entrees: p.entrees, sorties: p.sorties, tauxSortie: pct(p.sorties, p.vues), secondesMoy: Math.round(p.secondes / p.vues), luMoyPct: Math.round(p.lu / p.vues) })).sort((a, b) => b.vues - a.vues);
  const clickCount = new Map<string, number>();
  for (const r of rows.filter(r => r.kind === 'clic')) { const k = `${pageName(r.path)}\u0000${r.detail}`; clickCount.set(k, (clickCount.get(k) ?? 0) + 1); }
  const clics = [...clickCount.entries()].map(([k, n]) => { const [page, texte] = k.split('\u0000'); return { page, texte, n }; }).sort((a, b) => b.n - a.n).slice(0, 20);
  const bounces = visits.filter(v => v.rebond).length;

  // Constats en clair : où les visiteurs s'arrêtent le plus.
  const constats: string[] = [];
  if (!visits.length) constats.push('Aucun parcours enregistré sur la période : les parcours apparaissent dès les prochaines visites.');
  else {
    const drop = funnel.slice(1).filter(f => f.perdues > 0).sort((a, b) => b.perdues - a.perdues)[0];
    if (drop) { const i = funnel.indexOf(drop); constats.push(`Plus gros décrochage : ${drop.perdues} visite(s) sur ${funnel[i - 1].visites} s’arrêtent avant « ${drop.libelle} » (étape précédente : « ${funnel[i - 1].libelle} »).`); }
    if (bounces) constats.push(`${bounces} visite(s) sur ${visits.length} repartent en moins de 15 secondes sans rien cliquer.`);
    const exit = [...pageRows].filter(p => p.sorties >= 2).sort((a, b) => b.sorties - a.sorties)[0];
    if (exit) constats.push(`Page d’où l’on part le plus : ${exit.page} (${exit.sorties} départs sur ${exit.vues} vues, ${exit.secondesMoy} s en moyenne, ${exit.luMoyPct} % de la page lue).`);
    for (const p of pageRows.filter(p => p.vues >= 3 && p.luMoyPct < 40).slice(0, 2)) constats.push(`Sur ${p.page}, on ne lit en moyenne que ${p.luMoyPct} % de la page : ce qui est plus bas est peu vu.`);
  }
  return {
    jours: days, du: first, visites: visits.length, rebonds: bounces,
    entonnoir: funnel, pages: pageRows.slice(0, 25), clics, constats,
    dernieres: visits.slice(0, 40).map(v => ({ ...v, reached: undefined, debut: undefined })),
  };
}
