import { timingSafeEqual } from 'node:crypto';
import { json, failure, ApiError, siteOrigin, readSetting } from '@/lib/server';
import { envois, indexNow, reels, videoDuJour, videoPath, type IndexNow } from '@/lib/diffusion';
import { findPost, type Stats } from '@/lib/instagram';
import { bilanMenu, menuDuVendredi } from '@/lib/menu-gratuit';
import { bilanTelegram, envoyerTelegram } from '@/lib/telegram';
import { bilanProspection, chercherEmails, envoyerMails } from '@/lib/prospection';
import { bilanAffiliation, verifierSites } from '@/lib/affiliation';
export const dynamic = 'force-dynamic';

// Diffusion sans publicité (lib/diffusion.ts). POST : appelé chaque heure par scripts/mise-a-jour-auto.sh avec
// « Authorization: Bearer CRON_SECRET » ; signale les pages nouvelles à IndexNow, publie la vidéo du jour, envoie le menu gratuit le vendredi
// et les messages de content/telegram/messages.ts à Walid sur Telegram, cherche l'adresse mail d'un créateur et lui envoie la proposition de duo (prospection), visite les sites du
// futur programme d'affiliation (lib/affiliation.ts, aucun mail envoyé).
// GET : bilan public (rien de personnel), lu par la revue du lundi de la loop (content/loop/CONSIGNES.md).
function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 16) throw new ApiError(503, 'CRON_SECRET n’est pas configuré.');
  const given = Buffer.from(request.headers.get('authorization') ?? '');
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function POST(request: Request) { try {
  if (!authorized(request)) throw new ApiError(401, 'Accès refusé.');
  const origin = siteOrigin(request);
  const indexnow = await indexNow(origin).catch(e => ({ erreur: e instanceof Error ? e.message : String(e) }));
  const videoJour = await videoDuJour(origin).catch(e => ({ erreur: e instanceof Error ? e.message : String(e) }));
  const menu = await menuDuVendredi(origin).catch(e => ({ erreur: e instanceof Error ? e.message : String(e) }));
  const telegram = await envoyerTelegram().catch(e => ({ erreur: e instanceof Error ? e.message : String(e) }));
  const prospection = await chercherEmails(origin).catch(e => ({ erreur: e instanceof Error ? e.message : String(e) }));
  const prospectionMail = await envoyerMails(origin).catch(e => ({ erreur: e instanceof Error ? e.message : String(e) }));
  const affiliation = await verifierSites(origin).catch(e => ({ erreur: e instanceof Error ? e.message : String(e) }));
  return json({ ok: true, indexnow, video: videoJour, menu, telegram, prospection, prospectionMail, affiliation });
} catch (e) { return failure(e); } }

export async function GET() { try {
  const stats = await readSetting<{ at: number; posts: Record<string, Stats> } | null>('instagram_stats', null);
  const r = await reels();
  const p = await envois();
  const slugs = [...new Set([...Object.keys(r), ...Object.keys(p)])];
  const videos = slugs.map(slug => ({
    slug, titre: findPost(slug)?.title ?? slug, video: videoPath(slug),
    reel: r[slug] ? { publie: r[slug].at, lien: r[slug].permalink ?? null, chiffres: stats?.posts[`reel:${slug}`] ?? null } : null,
    postforme: p[slug] ?? null,
  })).sort((a, b) => (b.reel?.publie ?? b.postforme?.at ?? '').localeCompare(a.reel?.publie ?? a.postforme?.at ?? ''));
  return json({
    videos,
    postforme: process.env.POSTFORME_API_KEY && process.env.POSTFORME_COMPTES ? 'configuré' : 'indisponible',
    indexnow: await readSetting<IndexNow | null>('indexnow_dernier', null),
    releveInstagram: stats ? new Date(stats.at).toISOString() : null,
    menuGratuit: await bilanMenu(),
    telegram: await bilanTelegram(),
    prospection: await bilanProspection(),
    affiliation: await bilanAffiliation(),
  });
} catch (e) { return failure(e); } }

