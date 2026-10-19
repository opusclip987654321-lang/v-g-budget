import { db, json, failure, readSetting } from '@/lib/server';
import { infos } from '@/content/instagram/carrousels';
import { connection, findPost, publications, type Stats } from '@/lib/instagram';
export const dynamic = 'force-dynamic';

// Bilan public des carrousels Instagram (chiffres déjà visibles en partie sur Instagram, rien de personnel) :
// lu tous les 3 jours par la tâche programmée de Claude qui remet en question le format des carrousels.
// Les chiffres sont relevés chaque heure par /api/instagram/publier (au plus toutes les 6 heures).
export async function GET() { try {
  const c = await connection();
  const done = await publications();
  const stats = await readSetting<{ at: number; posts: Record<string, Stats>; followers?: number } | null>('instagram_stats', null);
  const since = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const visites = (await db().prepare("SELECT day, COUNT(DISTINCT visitor) AS n FROM events WHERE name='visite' AND detail LIKE '%instagram%' AND day>=? GROUP BY day ORDER BY day").bind(since).all<{ day: string; n: number }>()).results;
  const posts = Object.entries(done).sort((a, b) => b[1].at.localeCompare(a[1].at)).map(([slug, p]) => {
    const post = findPost(slug);
    return { slug, titre: post?.title ?? slug, publie: p.at, lien: p.permalink ?? null, images: post?.slides.length ?? null, chiffres: stats?.posts[slug] ?? null };
  });
  // Carrousels « infos végé » pas encore publiés : la tâche de Claude en ajoute quand il en reste moins de 7.
  const reserve = infos.filter(i => !done[i.slug]).map(i => i.slug);
  return json({ compte: c ? `@${c.username}` : null, abonnes: stats?.followers ?? null, releve: stats ? new Date(stats.at).toISOString() : null, posts, reserve, visitesInstagram: visites });
} catch (e) { return failure(e); } }
