import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFile, mkdir, mkdtemp, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import type { Writable } from 'node:stream';
import { dirname, join } from 'node:path';
import { dataDir } from '@/db';
import { infos } from '@/content/instagram/carrousels';
import sitemap from '@/app/sitemap';
import { readSetting, writeSetting } from './server';
import { slideFrame, videoBand } from './instagram-image';
import { findPost, freshConnection, graph, parisNow, publications, ready, type Publication } from './instagram';

// Diffusion sans publicité (demande de louis du 20/10/2026, volet acquisition de la loop) :
// 1. chaque carrousel « infos végé » devient une vidéo verticale (les images du carrousel l'une après l'autre),
//    publiée en Reel Instagram le lendemain du carrousel (les Reels sont montrés aux non-abonnés, les carrousels
//    surtout aux abonnés), puis envoyée à Post for Me pour TikTok, YouTube Shorts, Facebook… (comptes de POSTFORME_COMPTES) ;
// 2. chaque page nouvelle ou modifiée du plan du site est signalée à Bing par IndexNow (Bing sert aussi ChatGPT,
//    Copilot, DuckDuckGo, Qwant et Ecosia).
// Tout part de POST /api/diffusion, appelé chaque heure par scripts/mise-a-jour-auto.sh. Bilan public : GET /api/diffusion.

// ---- Vidéo ----

// 720 × 1280 suffit sur un téléphone et garde ffmpeg sous 150 Mo de mémoire (le conteneur a 512 Mo).
const VIDEO = { w: 720, h: 1280, slideH: 900, fps: 24 };
// Chaque image entre par la droite et ses éléments apparaissent un à un pendant ANIMATION secondes (« motion design »
// dessiné par le site, Walid 21/10/2026 : la vidéo est ce qui a été vu), puis reste affichée jusqu'à sa durée.
const SECONDES = { couverture: 3, image: 4, fin: 4.5 };
const ANIMATION = 1.6;
export const videoPath = (slug: string) => `/api/diffusion/video/${slug}.mp4`;
const videoFile = (slug: string) => join(dataDir(), 'videos', `${slug}.mp4`);
const building = new Map<string, Promise<string>>();

// Lance ffmpeg ; feed écrit les images sur son entrée.
function run(command: string, args: string[], cwd: string, feed?: (input: Writable) => Promise<void>) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: [feed ? 'pipe' : 'ignore', 'ignore', 'pipe'] });
    let err = '';
    child.stderr!.on('data', d => { err = (err + d).slice(-800); });
    const timer = setTimeout(() => child.kill('SIGKILL'), 300000);
    child.on('error', e => { clearTimeout(timer); reject(new Error((e as NodeJS.ErrnoException).code === 'ENOENT' ? 'ffmpeg n’est pas installé sur le serveur.' : e.message)); });
    child.on('close', code => { clearTimeout(timer); if (code === 0) resolve(); else reject(new Error(`ffmpeg a échoué (${code}) : ${err.trim()}`)); });
    if (feed && child.stdin) {
      child.stdin.on('error', () => {}); // ffmpeg arrêté : l'erreur arrive par « close »
      feed(child.stdin).then(() => child.stdin!.end(), e => { child.kill('SIGKILL'); reject(e); });
    }
  });
}

const write = (input: Writable, data: Buffer) => new Promise<void>((resolve, reject) => {
  if (input.write(data)) resolve(); else input.once('drain', resolve).once('error', reject);
});

async function build(slug: string) {
  const post = findPost(slug);
  if (!post) throw new Error('Carrousel inconnu.');
  const dir = await mkdtemp(join(tmpdir(), 'vegebudget-video-'));
  try {
    const total = post.slides.length;
    const durations = post.slides.map((_, i) => i === 0 ? SECONDES.couverture : i === total - 1 ? SECONDES.fin : SECONDES.image);
    const length = durations.reduce((a, b) => a + b, 0);
    const animated = Math.round(ANIMATION * VIDEO.fps);
    const feed = async (input: Writable) => {
      for (let n = 1; n <= total; n++) {
        const frames = Math.round(durations[n - 1] * VIDEO.fps);
        let jpg: Buffer | null = null;
        for (let f = 0; f < frames; f++) {
          if (f <= animated) jpg = await slideFrame(slug, n, f / animated);
          if (!jpg) throw new Error(`Image ${n} introuvable.`);
          await write(input, jpg);
        }
      }
    };
    // Images centrées sur fond vert VégéBudget, titre en haut, barre de progression citron en bas, piste son muette (certaines
    // plateformes refusent une vidéo sans son).
    const bar = 10, band = (VIDEO.h - VIDEO.slideH) / 2;
    await writeFile(join(dir, 'bandeau.png'), await videoBand(slug, VIDEO.w, band));
    await run('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(VIDEO.fps), '-c:v', 'mjpeg', '-i', '-',
      '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-f', 'lavfi', '-i', `color=c=0xd7f369:s=${VIDEO.w}x${bar}:r=${VIDEO.fps}`, '-i', 'bandeau.png',
      '-filter_complex', `[0:v]scale=${VIDEO.w}:${VIDEO.slideH},pad=${VIDEO.w}:${VIDEO.h}:0:${band}:color=0x174c38,setsar=1[p];[p][3:v]overlay=0:0[v];` +
        `[v][2:v]overlay=x='-W+W*t/${length}':y=H-${bar * 4}:shortest=1,fps=${VIDEO.fps},format=yuv420p[out]`,
      '-map', '[out]', '-map', '1:a', '-shortest', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '21', '-threads', '1',
      '-c:a', 'aac', '-b:a', '64k', '-movflags', '+faststart', 'video.mp4'], dir, feed);
    const file = videoFile(slug);
    await mkdir(dirname(file), { recursive: true });
    // Copie puis renommage : le dossier temporaire et DATA_DIR ne sont pas sur le même disque.
    await copyFile(join(dir, 'video.mp4'), `${file}.part`);
    await rename(`${file}.part`, file);
    return file;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

// La vidéo d'un carrousel (fabriquée une fois, gardée dans DATA_DIR/videos).
export async function video(slug: string) {
  const file = videoFile(slug);
  if (await stat(file).then(() => true, () => false)) return readFile(file);
  let job = building.get(slug);
  if (!job) { job = build(slug).finally(() => building.delete(slug)); building.set(slug, job); }
  return readFile(await job);
}

// ---- Reels Instagram et Post for Me ----

export type Envoi = { at: string; id?: string; erreur?: string };
export const reels = () => readSetting<Record<string, Publication>>('instagram_reels', {});
export const envois = () => readSetting<Record<string, Envoi>>('postforme_envois', {});
const comptes = () => (process.env.POSTFORME_COMPTES ?? '').split(',').map(x => x.trim()).filter(Boolean);
const caption = (slug: string) => findPost(slug)?.caption ?? '';

// Prochain carrousel à passer en vidéo : le premier « infos végé » déjà publié en carrousel et pas encore en vidéo.
export async function nextVideo(done: Record<string, unknown>) {
  const published = await publications();
  return infos.find(i => published[i.slug] && !done[i.slug])?.slug ?? null;
}

export async function publishReel(origin: string, slug: string) {
  const c = await freshConnection();
  if (!c) throw new Error('Instagram n’est pas connecté.');
  await video(slug); // prête avant qu'Instagram vienne la chercher
  const media = await graph<{ id: string }>(`${c.userId}/media`, { media_type: 'REELS', video_url: `${origin}${videoPath(slug)}`, caption: caption(slug), share_to_feed: 'true', access_token: c.token }, 'POST');
  await ready(c, media.id, 60);
  const done = await graph<{ id: string }>(`${c.userId}/media_publish`, { creation_id: media.id, access_token: c.token }, 'POST');
  const link = await graph<{ permalink?: string }>(done.id, { fields: 'permalink', access_token: c.token }).catch(() => ({ permalink: undefined }));
  const publication: Publication = { at: new Date().toISOString(), mediaId: done.id, permalink: link.permalink };
  await writeSetting('instagram_reels', { ...(await reels()), [slug]: publication });
  return publication;
}

// Post for Me (même service que les autres projets de louis) : une seule demande publie la vidéo sur tous les
// comptes de POSTFORME_COMPTES (identifiants « spc_… » des comptes reliés, séparés par des virgules).
export async function sendPostForMe(origin: string, slug: string) {
  const key = process.env.POSTFORME_API_KEY;
  if (!key || !comptes().length) throw new Error('Post for Me n’est pas configuré.');
  await video(slug);
  const base = (process.env.POSTFORME_URL ?? 'https://api.postforme.dev/v1').replace(/\/$/, '');
  const res = await fetch(`${base}/social-posts`, {
    method: 'POST', signal: AbortSignal.timeout(60000),
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ caption: caption(slug), social_accounts: comptes(), media: [{ url: `${origin}${videoPath(slug)}` }] }),
  });
  const data = await res.json().catch(() => ({})) as { id?: string; message?: string; error?: string };
  const envoi: Envoi = res.ok && data.id ? { at: new Date().toISOString(), id: data.id } : { at: new Date().toISOString(), erreur: `${res.status} ${data.message ?? data.error ?? ''}`.trim() };
  await writeSetting('postforme_envois', { ...(await envois()), [slug]: envoi });
  if (envoi.erreur) throw new Error(`Post for Me : ${envoi.erreur}`);
  return envoi;
}

const today = (list: Record<string, { at: string }>) => Object.values(list).some(p => parisNow(new Date(p.at)).date === parisNow().date);

// Une vidéo par jour, à partir de VIDEO_HEURE (12 h, heure de Paris), au plus un essai par heure.
export async function videoDuJour(origin: string) {
  if (parisNow().hour < Number(process.env.VIDEO_HEURE ?? 12)) return { rien: 'Pas encore l’heure.' };
  const out: Record<string, unknown> = {};
  const attempt = await readSetting<{ at: number } | null>('diffusion_essai', null);
  if (attempt && Date.now() - attempt.at < 50 * 60000) return { rien: 'Essai déjà fait cette heure-ci.' };
  const reelsDone = await reels();
  const reelSlug = today(reelsDone) ? null : await nextVideo(reelsDone);
  const envoisDone = await envois();
  const pfmSlug = !process.env.POSTFORME_API_KEY || !comptes().length || today(envoisDone) ? null : await nextVideo(envoisDone);
  if (!reelSlug && !pfmSlug) return { rien: 'Rien à publier en vidéo.' };
  await writeSetting('diffusion_essai', { at: Date.now() });
  if (reelSlug && await freshConnection()) {
    try { out.reel = { slug: reelSlug, ...(await publishReel(origin, reelSlug)) }; } catch (e) { out.reel = { slug: reelSlug, erreur: e instanceof Error ? e.message : String(e) }; }
  }
  if (pfmSlug) {
    try { out.postforme = { slug: pfmSlug, ...(await sendPostForMe(origin, pfmSlug)) }; } catch (e) { out.postforme = { slug: pfmSlug, erreur: e instanceof Error ? e.message : String(e) }; }
  }
  return out;
}

// ---- IndexNow ----

// Clé tirée de CRON_SECRET : stable, sans réglage de plus, publiée à /indexnow-cle.txt.
export function indexNowKey() {
  const secret = process.env.CRON_SECRET;
  return secret && secret.length >= 16 ? createHash('sha256').update(`indexnow:${secret}`).digest('hex').slice(0, 32) : null;
}

export type IndexNow = { at: string; envoyees: number; statut: string };

// Signale à IndexNow les pages du plan du site nouvelles ou modifiées depuis le dernier envoi (au plus une fois par heure).
export async function indexNow(origin: string): Promise<IndexNow | { rien: string }> {
  const key = indexNowKey();
  if (!key) return { rien: 'CRON_SECRET n’est pas configuré.' };
  if (!origin.startsWith('https://')) return { rien: 'Site local : rien à signaler.' };
  const sent = await readSetting<Record<string, string>>('indexnow_pages', {});
  const pages = (await sitemap()).map(p => ({ url: p.url, mod: p.lastModified ? new Date(p.lastModified).toISOString() : '' }));
  const todo = pages.filter(p => sent[p.url] !== p.mod);
  if (!todo.length) return { rien: 'Aucune page nouvelle.' };
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST', signal: AbortSignal.timeout(30000), headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: new URL(origin).host, key, keyLocation: `${origin}/indexnow-cle.txt`, urlList: todo.slice(0, 10000).map(p => p.url) }),
  });
  const result: IndexNow = { at: new Date().toISOString(), envoyees: todo.length, statut: `${res.status}` };
  // 200 et 202 : reçu. Sinon on réessaiera à l'heure suivante.
  if (res.status === 200 || res.status === 202) await writeSetting('indexnow_pages', { ...sent, ...Object.fromEntries(todo.map(p => [p.url, p.mod])) });
  await writeSetting('indexnow_dernier', result);
  return result;
}
