import { exclus, sites as liste, themes, type Site, type Theme } from '@/content/affiliation/sites';
import { adresseDuSite, extraireEmails } from './prospection';
import { db } from './server';

// Prospects du futur programme d'affiliation (demande de Walid du 22/10/2026) : des sites de cuisine à qui
// proposer un lien perso, une réduction pour leurs lecteurs et une commission. Aucun mail n'est envoyé avant le
// lancement de l'appli mobile (Walid, 22/10/2026).
// Chaque heure, POST /api/diffusion visite au plus AFFILIATION_PAR_HEURE (40) sites de la file : ceux de
// content/affiliation/sites.ts (ajoutés par Claude), puis ceux vers lesquels pointent les sites déjà retenus
// (blogrolls, blogs amis). Un site est retenu s'il répond, est en français et parle de cuisine ; on garde le contact
// qu'il publie. Tout reste en base (table affiliation_sites), visible du seul propriétaire sur /affiliation ; le bilan
// public GET /api/affiliation ne donne que des nombres.
export type Ligne = { site: string; nom: string | null; theme: Theme | null; source: string; trouve_le: string; verifie_le: string | null; ok: number | null; raison: string | null; titre: string | null; email: string | null; contact: string | null };
type Verif = Pick<Ligne, 'verifie_le' | 'ok' | 'raison' | 'titre' | 'email' | 'contact'> & { theme: Theme | null; liens: string[] };

// AFFILIATION_SITES : liste de remplacement (JSON), pour les vérifications locales seulement (scripts/check-api.mjs).
const graines = (): Site[] => process.env.AFFILIATION_SITES ? JSON.parse(process.env.AFFILIATION_SITES) : liste;
const local = () => !!process.env.AFFILIATION_SITES;

const CUISINE = /recettes?|cuisine|ingr[ée]dients?|cuisson|v[ée]g[ée]tarien|vegan|repas|menus?|plats?|dessert|l[ée]gumes?|batch.?cooking|casserole/gi;
const FRANCAIS = /\s(les|des|une|est|pour|avec|dans|sur|mais|vous|nous)\s/gi;
const THEMES: [Theme, RegExp][] = [
  ['vegetarien', /v[ée]g[ée]tarien|vegan|v[ée]g[ée]tal|sans viande/gi], ['anti-gaspi', /anti.?gaspi|restes|z[ée]ro d[ée]chet/gi],
  ['budget', /petit budget|pas cher|[ée]conomi|budget/gi], ['etudiant', /[ée]tudiant/gi], ['batch-cooking', /batch.?cooking|meal.?prep/gi],
  ['famille', /enfants?|famille|b[ée]b[ée]/gi],
];
const ENTITES: Record<string, string> = { amp: '&', quot: '"', apos: '\'', nbsp: ' ', '#39': '\'', '#039': '\'', rsquo: '’', eacute: 'é', egrave: 'è', '#8211': '–', '#8217': '’' };
const texte = (s: string) => s.replace(/&([a-z0-9#]+);/gi, (m, e) => ENTITES[e.toLowerCase()] ?? m).replace(/\s+/g, ' ').trim();

// Page d'accueil d'un domaine, sans « www. » : un site = un domaine.
export function racine(url: string) {
  const u = new URL(url);
  return `${u.protocol}//${u.hostname.replace(/^www\./, '')}${u.port ? `:${u.port}` : ''}/`;
}
const domaine = (url: string) => new URL(url).hostname.replace(/^www\./, '');
const cle = (u: URL) => u.host.replace(/^www\./, '');
export const exclu = (url: string) => { const d = domaine(url); return exclus.some(x => d === x || d.endsWith(`.${x}`)); };

// Lecture d'une page : titre, langue, part de vocabulaire de cuisine, thème, adresses mail publiées, lien vers la
// page contact et liens vers d'autres sites.
export function analyserPage(html: string, url: string) {
  const corps = html.replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ');
  const mots = [...corps.matchAll(CUISINE)].map(m => m[0].toLowerCase().slice(0, 5));
  const lang = /<html[^>]*\slang=["']?([a-z]{2})/i.exec(html)?.[1]?.toLowerCase();
  const ici = cle(new URL(url));
  const liens = [...html.matchAll(/<a\s[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  const absolu = (h: string) => { try { const u = new URL(h, url); return u.protocol === 'https:' || u.protocol === 'http:' ? u : null; } catch { return null; } };
  const contact = liens.find(m => /contact/i.test(m[1]) || /^\s*(contact|me contacter|nous contacter)\s*$/i.test(m[2].replace(/<[^>]+>/g, '')));
  const contactUrl = contact ? absolu(contact[1]) : null;
  const scores = THEMES.map(([t, re]) => [t, corps.match(re)?.length ?? 0] as const).sort((a, b) => b[1] - a[1]);
  return {
    titre: texte(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? '').slice(0, 120) || null,
    francais: lang ? lang === 'fr' : (corps.match(FRANCAIS)?.length ?? 0) >= 15,
    cuisine: mots.length >= 8 && new Set(mots).size >= 3,
    theme: (scores[0][1] >= 2 ? scores[0][0] : 'cuisine') as Theme,
    emails: extraireEmails(html),
    contact: contactUrl && cle(contactUrl) === ici ? contactUrl.href : null,
    liens: [...new Set(liens.map(m => absolu(m[1])).filter((u): u is URL => !!u && cle(u) !== ici).map(u => racine(u.href)))],
  };
}

async function lire(url: string) {
  const res = await fetch(url, { signal: AbortSignal.timeout(12000), redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VegeBudget/1.0; +https://vegebudget.fr)', Accept: 'text/html', 'Accept-Language': 'fr' } });
  const type = res.headers.get('content-type') ?? '';
  return { ok: res.ok && type.includes('html'), status: res.status, url: res.url || url, html: res.ok && type.includes('html') ? (await res.text()).slice(0, 2_000_000) : '' };
}

export async function verifierUn(site: string): Promise<Verif> {
  const base: Verif = { verifie_le: new Date().toISOString(), ok: 0, raison: null, titre: null, email: null, contact: null, theme: null, liens: [] };
  const accueil = await lire(site).catch(() => ({ ok: false, status: 0, url: site, html: '' }));
  if (!accueil.ok) return { ...base, raison: accueil.status ? `ne répond pas (code ${accueil.status})` : 'injoignable' };
  if (exclu(accueil.url)) return { ...base, raison: `renvoie vers ${domaine(accueil.url)}` };
  const a = analyserPage(accueil.html, accueil.url);
  const raison = !a.francais ? 'pas en français' : !a.cuisine ? 'ne parle pas de cuisine' : null;
  if (raison) return { ...base, titre: a.titre, raison };
  let email = adresseDuSite(accueil.url, a.emails);
  if (!email && a.contact) email = adresseDuSite(accueil.url, analyserPage((await lire(a.contact).catch(() => ({ html: '' }))).html || '<html></html>', a.contact).emails);
  return { ...base, ok: 1, titre: a.titre, email, contact: a.contact, theme: a.theme, liens: a.liens.filter(l => !exclu(l)).slice(0, 40) };
}

const nouveau = (site: string, nom: string | null, theme: Theme | null, source: string) =>
  db().prepare('INSERT INTO affiliation_sites (site,nom,theme,source,trouve_le) VALUES (?,?,?,?,?) ON CONFLICT(site) DO NOTHING').bind(site, nom, theme, source, new Date().toISOString()).run();

export async function verifierSites(origin: string) {
  if (!origin.startsWith('https://') && !local()) return { rien: 'Site local : pas de visite.' };
  for (const s of graines()) if (!exclu(s.site)) await nouveau(racine(s.site), s.nom, s.theme, 'claude');
  const todo = (await db().prepare('SELECT site, source FROM affiliation_sites WHERE verifie_le IS NULL ORDER BY source = \'claude\' DESC, trouve_le LIMIT ?').bind(Number(process.env.AFFILIATION_PAR_HEURE ?? 40)).all<{ site: string; source: string }>()).results;
  if (!todo.length) return { rien: 'Aucun site à visiter.' };
  let retenus = 0, decouverts = 0;
  for (let i = 0; i < todo.length; i += 8) {
    const lot = await Promise.all(todo.slice(i, i + 8).map(async t => ({ ...t, v: await verifierUn(t.site) })));
    for (const { site, v } of lot) {
      await db().prepare('UPDATE affiliation_sites SET verifie_le=?, ok=?, raison=?, titre=?, email=?, contact=?, theme=COALESCE(theme, ?), nom=COALESCE(nom, ?) WHERE site=?')
        .bind(v.verifie_le, v.ok, v.raison, v.titre, v.email, v.contact, v.theme, v.titre?.split(/\s[|–—-]\s|\s[:·]\s/)[0]?.slice(0, 80) ?? null, site).run();
      if (!v.ok) continue;
      retenus++;
      for (const l of v.liens) decouverts += (await nouveau(l, null, null, site)).meta?.changes ?? 0;
    }
  }
  return { visites: todo.length, retenus, decouverts };
}

export async function prospects(): Promise<Ligne[]> {
  return (await db().prepare('SELECT * FROM affiliation_sites ORDER BY trouve_le').all<Ligne>()).results;
}

// Bilan public : des nombres seulement (ni noms ni adresses).
export async function bilanAffiliation() {
  const all = await prospects();
  const retenus = all.filter(p => p.ok === 1);
  const aujourdhui = new Date().toISOString().slice(0, 10);
  return {
    sites: all.length,
    ajoutesParClaude: all.filter(p => p.source === 'claude').length,
    trouvesParLiens: all.filter(p => p.source !== 'claude').length,
    aVisiter: all.filter(p => !p.verifie_le).length,
    retenus: retenus.length,
    retenusAujourdhui: retenus.filter(p => p.verifie_le?.startsWith(aujourdhui)).length,
    avecMail: retenus.filter(p => p.email).length,
    avecPageContact: retenus.filter(p => !p.email && p.contact).length,
    ecartes: all.filter(p => p.ok === 0).length,
    raisons: Object.fromEntries([...new Set(all.filter(p => p.ok === 0).map(p => p.raison?.replace(/ \(.*/, '') ?? 'autre'))].map(r => [r, all.filter(p => p.ok === 0 && (p.raison?.replace(/ \(.*/, '') ?? 'autre') === r).length])),
    parTheme: Object.fromEntries(themes.map(t => [t, retenus.filter(p => p.theme === t).length])),
  };
}

const cellule = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
export function csv(list: Ligne[]) {
  const cols = ['nom', 'site', 'theme', 'email', 'contact', 'titre', 'source', 'verifie_le'] as const;
  return [cols.join(';'), ...list.map(p => cols.map(c => cellule(p[c])).join(';'))].join('\n') + '\n';
}
