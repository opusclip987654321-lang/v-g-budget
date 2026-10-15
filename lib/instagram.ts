import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { blogCoverJpg, blogPath, sortedArticles, findArticle, type Article } from './blog';
import { findRecipe, portionCost, recipeImage } from './seo';
import { money } from './planner';
import { readSetting, writeSetting } from './server';

// Instagram : chaque article du blog devient un carrousel (images 1080 × 1350 dessinées par
// app/api/instagram/image/[slug]/[n]/route.tsx) et une légende, publiés par l'API officielle d'Instagram.
// Publication automatique : POST /api/instagram/publier, appelé chaque heure par scripts/mise-a-jour-auto.sh ;
// il publie au plus un carrousel par jour, à partir de INSTAGRAM_HEURE (18 h, heure de Paris).
// Connexion et publication à la main : page /instagram (réservée au propriétaire du site).

export type Slide =
  | { kind: 'couverture'; title: string; category: string; image: string }
  | { kind: 'essentiel'; lines: string[] }
  | { kind: 'chiffres'; items: [string, string][] }
  | { kind: 'recette'; title: string; text: string; minutes: number; price: string; image: string }
  | { kind: 'fin'; path: string };

// Texte brut : sans gras ni liens markdown.
export const plain = (s: string) => s.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\[([^\]]+)\]\([^)\s]+\)/g, '$1').trim();
const sentences = (s: string) => plain(s).split(/(?<=[.!?])\s+(?=[A-ZÀ-Ý«])/).filter(Boolean);

// 10 images au plus par carrousel : couverture, l'essentiel, les chiffres, 1 à 6 recettes, la fin.
export function slidesFor(a: Article): Slide[] {
  const blocks = a.body.trim().split(/\n\s*\n/).map(b => b.trim());
  const essentiel = blocks.find(b => b.startsWith('@essentiel'));
  const lines = essentiel ? essentiel.split('\n').slice(1).map(l => plain(l.replace(/^- /, ''))).filter(Boolean) : sentences(a.lead).slice(0, 3);
  const chiffres = blocks.find(b => b.startsWith('@chiffres '));
  const items = chiffres ? chiffres.slice(10).split(';').map(x => x.split('|').map(s => plain(s)) as [string, string]).filter(x => x[0] && x[1]).slice(0, 3) : [];
  const recipes: { id: string; text: string }[] = [];
  for (const b of blocks) {
    if (b.startsWith('@recette ')) { const [id, text = ''] = b.slice(9).split('|').map(s => s.trim()); recipes.push({ id, text: plain(text) }); }
    if (b.startsWith('@recettes ')) for (const id of b.slice(10).split(',').map(s => s.trim())) recipes.push({ id, text: '' });
  }
  const seen = new Set<string>();
  const recipeSlides: Slide[] = recipes.filter(r => !seen.has(r.id) && seen.add(r.id)).flatMap(({ id, text }) => {
    const r = findRecipe(id);
    return r ? [{ kind: 'recette' as const, title: r.title, text: text || r.description, minutes: r.minutes, price: money(portionCost(r)), image: recipeImage(r) }] : [];
  });
  const head: Slide[] = [{ kind: 'couverture', title: a.title, category: a.category, image: blogCoverJpg(a) }];
  if (lines.length) head.push({ kind: 'essentiel', lines: lines.slice(0, 4) });
  if (items.length) head.push({ kind: 'chiffres', items });
  return [...head, ...recipeSlides.slice(0, 9 - head.length), { kind: 'fin', path: blogPath(a) }];
}

const hashtags: Record<string, string[]> = {
  Recettes: ['#recettevégétarienne', '#dînerrapide', '#idéerepas'],
  Budget: ['#économies', '#listedecourses', '#budgetfamille'],
  'Bio et local': ['#bio', '#circuitcourt', '#mangerlocal'],
  Saisons: ['#fruitsetlégumesdesaison', '#cuisinedesaison', '#produitsdesaison'],
  Nutrition: ['#protéinesvégétales', '#alimentationsaine', '#nutrition'],
  'Bien-être animal': ['#bienêtreanimal', '#consommerresponsable', '#moinsdeviande'],
};

export function captionFor(a: Article) {
  const lines = (slidesFor(a).find(s => s.kind === 'essentiel') as Extract<Slide, { kind: 'essentiel' }> | undefined)?.lines ?? [];
  const tags = ['#mangerpascher', '#petitbudget', '#recettepascher', '#sansviande', '#recettefacile', '#menudelasemaine', '#budgetcourses', ...(hashtags[a.category] ?? [])];
  return [
    `${plain(a.title)} 👇`,
    plain(a.lead),
    lines.length ? `L’essentiel :\n${lines.map(l => `• ${l}`).join('\n')}` : '',
    'Glissez pour les recettes et les prix 👉 Enregistrez la publication pour la retrouver ce soir 📌',
    `L’article complet est sur notre site, lien dans la bio (vegebudget.fr${blogPath(a)}).`,
    'VégéBudget prépare vos dîners sans viande de la semaine selon votre budget, avec la liste de courses. Première semaine gratuite, sans compte ni carte bancaire.',
    tags.join(' '),
  ].filter(Boolean).join('\n\n').slice(0, 2200);
}

// Fichier de public/ en data URI, pour les images du carrousel.
export async function publicDataUri(path: string) {
  const file = join(process.cwd(), 'public', path.replace(/^\/+/, ''));
  const type = path.endsWith('.svg') ? 'image/svg+xml' : path.endsWith('.png') ? 'image/png' : 'image/jpeg';
  try { return `data:${type};base64,${(await readFile(file)).toString('base64')}`; } catch { return null; }
}

// ---- API Instagram (« Instagram API avec connexion Instagram », compte professionnel) ----

const GRAPH = 'https://graph.instagram.com';
export type Connection = { token: string; userId: string; username: string; savedAt: number; expiresAt: number };
export type Publication = { at: string; mediaId: string; permalink?: string };

export const connection = () => readSetting<Connection | null>('instagram', null);
export const publications = () => readSetting<Record<string, Publication>>('instagram_publications', {});

async function graph<T>(path: string, params: Record<string, string>, method: 'GET' | 'POST' = 'GET'): Promise<T> {
  const url = new URL(`${GRAPH}/${path}`);
  const init: RequestInit = { method, signal: AbortSignal.timeout(30000) };
  if (method === 'GET') for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  else init.body = new URLSearchParams(params);
  const res = await fetch(url, init);
  const data = await res.json().catch(() => ({})) as T & { error?: { message?: string } };
  if (!res.ok || data.error) throw new Error(`Instagram : ${data.error?.message ?? `erreur ${res.status}`}`);
  return data;
}

// Vérifie un jeton (copié depuis le tableau de bord Meta) et l'enregistre.
export async function connect(token: string) {
  const me = await graph<{ user_id?: string; id: string; username: string }>('me', { fields: 'user_id,username', access_token: token });
  const value: Connection = { token, userId: me.user_id ?? me.id, username: me.username, savedAt: Date.now(), expiresAt: Date.now() + 60 * 86400000 };
  await writeSetting('instagram', value);
  return value;
}

// Le jeton vaut 60 jours ; on le prolonge chaque semaine (Instagram exige qu'il ait plus de 24 h).
export async function freshConnection() {
  const c = await connection();
  if (!c) return null;
  if (Date.now() - c.savedAt < 7 * 86400000) return c;
  const r = await graph<{ access_token: string; expires_in: number }>('refresh_access_token', { grant_type: 'ig_refresh_token', access_token: c.token });
  const next = { ...c, token: r.access_token, savedAt: Date.now(), expiresAt: Date.now() + r.expires_in * 1000 };
  await writeSetting('instagram', next);
  return next;
}

async function ready(c: Connection, id: string) {
  for (let i = 0; i < 20; i++) {
    const s = await graph<{ status_code?: string; status?: string }>(id, { fields: 'status_code,status', access_token: c.token });
    if (s.status_code === 'FINISHED' || s.status_code === 'PUBLISHED') return;
    if (s.status_code === 'ERROR' || s.status_code === 'EXPIRED') throw new Error(`Instagram refuse une image (${s.status ?? s.status_code}).`);
    await new Promise(r => setTimeout(r, 3000));
  }
  throw new Error('Instagram n’a pas fini de préparer les images à temps.');
}

export const imageUrl = (origin: string, slug: string, n: number) => `${origin}/api/instagram/image/${slug}/${n}.jpg`;

export async function publish(origin: string, slug: string) {
  const a = findArticle(slug);
  if (!a) throw new Error('Article inconnu.');
  const c = await freshConnection();
  if (!c) throw new Error('Instagram n’est pas connecté.');
  const done = await publications();
  if (done[slug]) throw new Error('Cet article est déjà publié sur Instagram.');
  const slides = slidesFor(a);
  const children: string[] = [];
  for (let n = 1; n <= slides.length; n++) {
    const item = await graph<{ id: string }>(`${c.userId}/media`, { image_url: imageUrl(origin, slug, n), is_carousel_item: 'true', access_token: c.token }, 'POST');
    children.push(item.id);
  }
  for (const id of children) await ready(c, id);
  const carousel = await graph<{ id: string }>(`${c.userId}/media`, { media_type: 'CAROUSEL', children: children.join(','), caption: captionFor(a), access_token: c.token }, 'POST');
  await ready(c, carousel.id);
  const media = await graph<{ id: string }>(`${c.userId}/media_publish`, { creation_id: carousel.id, access_token: c.token }, 'POST');
  const link = await graph<{ permalink?: string }>(media.id, { fields: 'permalink', access_token: c.token }).catch(() => ({ permalink: undefined }));
  const publication: Publication = { at: new Date().toISOString(), mediaId: media.id, permalink: link.permalink };
  await writeSetting('instagram_publications', { ...(await publications()), [slug]: publication });
  return publication;
}

// Date et heure de Paris.
export function parisNow(now = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' }).formatToParts(now).map(x => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour) };
}

// Prochain article à publier tout seul : le plus récent de la semaine écoulée qui n'est pas encore sur Instagram.
export function nextArticle(done: Record<string, Publication>, today: string) {
  const since = new Date(Date.parse(`${today}T12:00:00Z`) - 6 * 86400000).toISOString().slice(0, 10);
  return sortedArticles().find(a => a.date <= today && a.date >= since && !done[a.slug]);
}
