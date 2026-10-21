import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { blogCoverJpg, blogPath, findArticle, type Article } from './blog';
import { findRecipe, portionCost, recipeImage, recipeIngredients } from './seo';
import { money, shopping } from './planner';
import { ingredients } from './catalog';
import { readSetting, writeSetting } from './server';
import { infos } from '@/content/instagram/carrousels';
import { slideLabel, type Info, type InfoSlide } from './instagram-infos';

// Instagram : depuis le 19/10/2026 (demande de louis), le carrousel du jour est un carrousel « infos végé »
// (content/instagram/carrousels, voir lib/instagram-infos.ts) ; avant, c'était l'article du blog du jour.
// Un article du blog peut toujours devenir un carrousel (images 1080 × 1350 dessinées par
// app/api/instagram/image/[slug]/[n]/route.tsx) et une légende, publiés par l'API officielle d'Instagram.
// Publication automatique : POST /api/instagram/publier, appelé chaque heure par scripts/mise-a-jour-auto.sh ;
// il publie au plus un carrousel par jour, à partir de INSTAGRAM_HEURE (18 h, heure de Paris).
// Connexion et publication à la main : page /instagram (réservée au propriétaire du site).

export type Slide =
  | { kind: 'couverture'; title: string; pill: string; image: string | null }
  | { kind: 'info'; title: string; chiffre?: [string, string]; text?: string; points?: string[] }
  | { kind: 'essentiel'; items: [string, string][]; lines: string[] }
  | { kind: 'recette'; title: string; text: string; minutes: number; price: string; image: string; ingredients: [string, string][] }
  | { kind: 'fin'; path: string; sources?: string }
  | { kind: 'ticket'; title: string; lines: [string, string][]; total: string }
  | { kind: 'quiz'; title: string; choix: string[] }
  | { kind: 'grand'; title: string; text?: string }
  | { kind: 'semaine'; title: string; days: { title: string; price: string; image: string }[]; total: string }
  | { kind: 'classement'; title: string; rows: [string, string][]; note?: string };

// Texte brut : sans gras ni liens markdown.
export const plain = (s: string) => s.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\[([^\]]+)\]\([^)\s]+\)/g, '$1').trim();
const sentences = (s: string) => plain(s).split(/(?<=[.!?])\s+(?=[A-ZÀ-Ý«])/).filter(Boolean);

function recipesOf(a: Article) {
  const out: { id: string; text: string }[] = [];
  for (const b of a.body.trim().split(/\n\s*\n/).map(x => x.trim())) {
    if (b.startsWith('@recette ')) { const [id, text = ''] = b.slice(9).split('|').map(x => x.trim()); out.push({ id, text: plain(text) }); }
    if (b.startsWith('@recettes ')) for (const id of b.slice(10).split(',').map(x => x.trim())) out.push({ id, text: '' });
  }
  const seen = new Set<string>();
  return out.filter(r => !seen.has(r.id) && seen.add(r.id)).flatMap(({ id, text }) => { const r = findRecipe(id); return r ? [{ r, text }] : []; });
}

type CatalogRecipe = NonNullable<ReturnType<typeof findRecipe>>;
const recipeSlide = (r: CatalogRecipe, text: string): Slide => ({
  kind: 'recette', title: r.title, text: sentences(text || r.description)[0] ?? '', minutes: r.minutes, price: money(portionCost(r)), image: recipeImage(r),
  ingredients: recipeIngredients(r).filter(i => !/^(sel|poivre|eau)\b/i.test(i.name)).slice(0, 8).map(i => [i.name.split(',')[0], i.amount] as [string, string]),
});

// Format choisi après la veille du 15/10/2026 (voir content/instagram/BILANS.md) : 9 images au plus.
// 1 couverture avec une promesse chiffrée ; 2 accroche (chiffres clés + l'essentiel), car Instagram remontre
// souvent un carrousel à partir de l'image 2 ; puis une recette par image avec ses ingrédients (ce qu'on enregistre) ; la fin.
export function slidesFor(a: Article): Slide[] {
  const blocks = a.body.trim().split(/\n\s*\n/).map(b => b.trim());
  const essentiel = blocks.find(b => b.startsWith('@essentiel'));
  const lines = essentiel ? essentiel.split('\n').slice(1).map(l => plain(l.replace(/^- /, ''))).filter(Boolean) : sentences(a.lead).slice(0, 3);
  const chiffres = blocks.find(b => b.startsWith('@chiffres '));
  const items = chiffres ? chiffres.slice(10).split(';').map(x => x.split('|').map(s => plain(s)) as [string, string]).filter(x => x[0] && x[1]).slice(0, 3) : [];
  const hasIntro = lines.length > 0 || items.length > 0;
  const shown = recipesOf(a).slice(0, hasIntro ? 6 : 7);
  // Accroche chiffrée de la couverture : le prix par part le plus bas parmi les recettes montrées.
  const low = shown.length ? money(Math.min(...shown.map(({ r }) => portionCost(r)))) : null;
  const recipeSlides: Slide[] = shown.map(({ r, text }) => recipeSlide(r, text));
  const head: Slide[] = [{ kind: 'couverture', title: a.title, pill: low ? `Dès ${low} la part` : a.category, image: blogCoverJpg(a) }];
  if (hasIntro) head.push({ kind: 'essentiel', items, lines: lines.slice(0, 3) });
  return [...head, ...recipeSlides, { kind: 'fin', path: blogPath(a) }];
}

// 5 hashtags au plus : Instagram n'en accepte plus davantage. Les mots-clés de la légende comptent plus pour la recherche.
const hashtags: Record<string, string[]> = {
  Recettes: ['#recettevégétarienne', '#idéerepas'],
  Budget: ['#budgetcourses', '#menudelasemaine'],
  'Bio et local': ['#bio', '#circuitcourt'],
  Saisons: ['#cuisinedesaison', '#recettevégétarienne'],
  Nutrition: ['#protéinesvégétales', '#recettevégétarienne'],
  'Bien-être animal': ['#bienêtreanimal', '#moinsdeviande'],
};

export function captionFor(a: Article) {
  const slides = slidesFor(a);
  const s = slides.find(x => x.kind === 'essentiel') as Extract<Slide, { kind: 'essentiel' }> | undefined;
  const pill = (slides[0] as Extract<Slide, { kind: 'couverture' }>).pill;
  const low = pill.startsWith('Dès ') ? pill.slice(4, -8) : null;
  const tags = ['#recettepascher', '#petitbudget', '#mangerpascher', ...(hashtags[a.category] ?? ['#recettevégétarienne', '#sansviande'])];
  return [
    `${plain(a.title)}${low ? `, dès ${low} la part` : ''} 👇`,
    s?.lines.length ? s.lines.map(l => `• ${l}`).join('\n') : plain(a.lead),
    '📌 Enregistrez pour le jour des courses, et envoyez-la à la personne avec qui vous faites les courses.',
    `Toutes les recettes et la liste de courses avec le coût estimé : lien dans la bio (vegebudget.fr${blogPath(a)}).`,
    'VégéBudget prépare vos dîners sans viande selon votre budget. Première semaine gratuite.',
    tags.slice(0, 5).join(' '),
  ].filter(Boolean).join('\n\n').slice(0, 2200);
}

// ---- Carrousels « infos végé » ----

const ingredient = (id: string) => { const x = ingredients.find(g => g.id === id); if (!x) throw new Error(`Ingrédient inconnu : ${id}`); return x; };
const recipe = (id: string) => { const r = findRecipe(id); if (!r) throw new Error(`Recette inconnue : ${id}`); return r; };
const perKilo = (x: ReturnType<typeof ingredient>) => x.unit === 'pièce' ? null : x.price / x.pack * 1000;

// « {prix:curry-corail} » dans un texte : le prix par part de la recette, calculé.
const fill = (text: string) => text.replace(/\{prix:([a-z0-9-]+)\}/g, (_, id: string) => money(portionCost(recipe(id))));

// Une image d'un carrousel « infos végé », avec les prix calculés depuis le catalogue.
function infoSlide(x: InfoSlide): Slide {
  if ('recette' in x) return recipeSlide(recipe(x.recette), x.text ?? '');
  if ('ticket' in x) {
    const list = x.items.map(ingredient);
    return { kind: 'ticket', title: x.ticket, lines: list.map(g => [g.name.split(',')[0], money(g.price)]), total: money(list.reduce((t, g) => t + g.price, 0)) };
  }
  if ('quiz' in x) return { kind: 'quiz', title: fill(x.quiz), choix: x.choix.map(fill) };
  if ('grand' in x) return { kind: 'grand', title: fill(x.grand), text: x.text && fill(x.text) };
  if ('semaine' in x) {
    const list = x.recettes.map(recipe);
    const entries = list.map((r, n) => ({ id: `${n}`, recipeId: r.id, date: '', servings: 2, cooked: false, locked: false }));
    const total = shopping(entries, []).reduce((t, i) => t + i.purchaseCost, 0);
    return { kind: 'semaine', title: x.semaine, days: list.map(r => ({ title: r.title, price: money(portionCost(r)), image: recipeImage(r) })), total: money(total) };
  }
  if ('classement' in x) {
    const rows = x.items.map(ingredient).map(g => ({ g, kilo: perKilo(g) ?? Infinity })).sort((a, b) => a.kilo - b.kilo);
    return { kind: 'classement', title: x.classement, rows: rows.map(({ g, kilo }) => [g.name.split(',')[0], `${money(kilo)} le kilo`]), note: x.note };
  }
  return { kind: 'info', ...x };
}

export function infoSlides(i: Info): Slide[] {
  return [
    { kind: 'couverture', title: i.title, pill: i.pill, image: i.image ?? null },
    ...i.slides.map(infoSlide),
    { kind: 'fin', path: '/', sources: `Sources : ${i.sources.map(([name]) => name).join(' ; ')}` },
  ];
}

// Une ligne par image, sauf les grandes phrases (elles donnent souvent la réponse d'un quiz).
export function infoCaption(i: Info) {
  return [
    i.hook,
    i.slides.filter(x => !('grand' in x)).map(x => `• ${fill(slideLabel(x, id => findRecipe(id)?.title ?? id)).replace(/^\d+\.\s*/, '').replace(/[«»]/g, '').trim()}`).join('\n'),
    '📌 Enregistrez-le pour plus tard, et envoyez-le à quelqu’un que ça peut aider.',
    'Vos dîners végétariens de la semaine, avec la liste de courses et le coût : lien dans la bio. Première semaine gratuite.',
    `Sources : ${i.sources.map(([name]) => name).join(' ; ')}.`,
    i.hashtags.slice(0, 5).join(' '),
  ].join('\n\n').slice(0, 2200);
}

export const findInfo = (slug: string) => infos.find(i => i.slug === slug);

// Un carrousel : un carrousel « infos végé » ou un article du blog.
export function findPost(slug: string) {
  const info = findInfo(slug);
  if (info) return { slug, title: info.title, slides: infoSlides(info), caption: infoCaption(info) };
  const a = findArticle(slug);
  return a ? { slug, title: a.title, slides: slidesFor(a), caption: captionFor(a) } : null;
}

// Prochain carrousel à publier tout seul : le premier carrousel « infos végé » pas encore sur Instagram.
export const nextInfo = (done: Record<string, Publication>) => infos.find(i => !done[i.slug]);

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

export async function graph<T>(path: string, params: Record<string, string>, method: 'GET' | 'POST' = 'GET'): Promise<T> {
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

// Attend qu'Instagram ait préparé un média (une vidéo demande plus d'essais qu'une image).
export async function ready(c: Connection, id: string, tries = 20) {
  for (let i = 0; i < tries; i++) {
    const s = await graph<{ status_code?: string; status?: string }>(id, { fields: 'status_code,status', access_token: c.token });
    if (s.status_code === 'FINISHED' || s.status_code === 'PUBLISHED') return;
    if (s.status_code === 'ERROR' || s.status_code === 'EXPIRED') throw new Error(`Instagram refuse une image (${s.status ?? s.status_code}).`);
    await new Promise(r => setTimeout(r, 3000));
  }
  throw new Error('Instagram n’a pas fini de préparer les images à temps.');
}

export const imageUrl = (origin: string, slug: string, n: number) => `${origin}/api/instagram/image/${slug}/${n}.jpg`;

export async function publish(origin: string, slug: string) {
  const post = findPost(slug);
  if (!post) throw new Error('Carrousel inconnu.');
  const c = await freshConnection();
  if (!c) throw new Error('Instagram n’est pas connecté.');
  const done = await publications();
  if (done[slug]) throw new Error('Ce carrousel est déjà publié sur Instagram.');
  const slides = post.slides;
  const children: string[] = [];
  for (let n = 1; n <= slides.length; n++) {
    const item = await graph<{ id: string }>(`${c.userId}/media`, { image_url: imageUrl(origin, slug, n), is_carousel_item: 'true', access_token: c.token }, 'POST');
    children.push(item.id);
  }
  for (const id of children) await ready(c, id);
  const carousel = await graph<{ id: string }>(`${c.userId}/media`, { media_type: 'CAROUSEL', children: children.join(','), caption: post.caption, access_token: c.token }, 'POST');
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

// ---- Bilan des carrousels (relu tous les 3 jours par une tâche programmée de Claude) ----

export type Stats = Record<string, number>;
const METRICS = ['reach', 'views', 'saved', 'shares', 'likes', 'comments', 'total_interactions', 'follows', 'profile_visits'];
const SAFE_METRICS = ['reach', 'saved', 'shares', 'likes', 'comments'];

async function mediaStats(c: Connection, mediaId: string): Promise<Stats> {
  const read = async (metrics: string[]) => {
    const r = await graph<{ data: { name: string; values?: { value: number }[]; total_value?: { value: number } }[] }>(`${mediaId}/insights`, { metric: metrics.join(','), access_token: c.token });
    return Object.fromEntries(r.data.map(m => [m.name, m.total_value?.value ?? m.values?.[0]?.value ?? 0]));
  };
  // Si Instagram retire un indicateur, on se rabat sur ceux qui existent depuis longtemps.
  return read(METRICS).catch(() => read(SAFE_METRICS));
}

// Relève les chiffres de chaque carrousel publié (au plus toutes les 6 heures), pour /api/instagram/bilan.
export async function refreshStats(force = false) {
  const saved = await readSetting<{ at: number; posts: Record<string, Stats>; followers?: number } | null>('instagram_stats', null);
  if (!force && saved && Date.now() - saved.at < 6 * 3600000) return saved;
  const c = await freshConnection();
  if (!c) return saved;
  const posts: Record<string, Stats> = {};
  for (const [slug, p] of Object.entries(await publications())) posts[slug] = await mediaStats(c, p.mediaId).catch(() => saved?.posts[slug] ?? {});
  // Reels faits à partir des carrousels (lib/diffusion.ts), rangés sous « reel:<slug> ».
  for (const [slug, p] of Object.entries(await readSetting<Record<string, Publication>>('instagram_reels', {}))) posts[`reel:${slug}`] = await mediaStats(c, p.mediaId).catch(() => saved?.posts[`reel:${slug}`] ?? {});
  const account = await graph<{ followers_count?: number }>('me', { fields: 'followers_count', access_token: c.token }).catch(() => ({ followers_count: saved?.followers }));
  const next = { at: Date.now(), posts, followers: account.followers_count };
  await writeSetting('instagram_stats', next);
  return next;
}
