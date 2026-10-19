import { timingSafeEqual } from 'node:crypto';
import { json, failure, ApiError, siteOrigin, readSetting, writeSetting } from '@/lib/server';
import { connection, nextInfo, parisNow, publications, publish, refreshStats } from '@/lib/instagram';
export const dynamic = 'force-dynamic';

// Publication automatique du carrousel Instagram du jour, appelée chaque heure par scripts/mise-a-jour-auto.sh :
// POST /api/instagram/publier avec l'en-tête « Authorization: Bearer CRON_SECRET ».
// Publie au plus un carrousel par jour, à partir de INSTAGRAM_HEURE (18 par défaut, heure de Paris),
// le prochain carrousel « infos végé » qui n'est pas encore sur Instagram (content/instagram/carrousels).
function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 16) throw new ApiError(503, 'CRON_SECRET n’est pas configuré.');
  const given = Buffer.from(request.headers.get('authorization') ?? '');
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function POST(request: Request) { try {
  if (!authorized(request)) throw new ApiError(401, 'Accès refusé.');
  if (!await connection()) return json({ ok: true, rien: 'Instagram n’est pas connecté.' });
  // Chiffres des carrousels déjà publiés, pour le bilan (au plus toutes les 6 heures).
  await refreshStats().catch(e => console.error('Instagram stats', e instanceof Error ? e.message : e));
  const { date, hour } = parisNow();
  if (hour < Number(process.env.INSTAGRAM_HEURE ?? 18)) return json({ ok: true, rien: 'Pas encore l’heure.' });
  const done = await publications();
  if (Object.values(done).some(p => parisNow(new Date(p.at)).date === date)) return json({ ok: true, rien: 'Déjà publié aujourd’hui.' });
  const post = nextInfo(done);
  if (!post) return json({ ok: true, rien: 'Plus aucun carrousel en réserve.' });
  // Un seul essai par heure et par carrousel, même si le précédent a échoué.
  const attempt = await readSetting<{ slug: string; at: number } | null>('instagram_essai', null);
  if (attempt?.slug === post.slug && Date.now() - attempt.at < 50 * 60000) return json({ ok: true, rien: 'Essai déjà en cours.' });
  await writeSetting('instagram_essai', { slug: post.slug, at: Date.now() });
  const publication = await publish(siteOrigin(request), post.slug);
  return json({ ok: true, publie: post.slug, ...publication });
} catch (e) { return failure(e instanceof ApiError ? e : new ApiError(502, e instanceof Error ? e.message : 'Publication Instagram impossible.')); } }
