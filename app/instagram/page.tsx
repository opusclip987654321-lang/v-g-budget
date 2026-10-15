import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { isAdmin, readSetting } from '@/lib/server';
import { sortedArticles } from '@/lib/blog';
import { captionFor, connection, nextArticle, parisNow, publications, slidesFor, type Stats } from '@/lib/instagram';
import { PublicShell } from '@/components/public-shell';
import { InstagramAdmin } from './instagram-admin';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Instagram', robots: { index: false, follow: false } };

// Page du propriétaire du site : connecter le compte Instagram, voir le prochain carrousel, publier à la main.
export default async function InstagramPage() {
  const user = await getCurrentUser().catch(() => null);
  if (!user || !await isAdmin(user.userId)) notFound();
  const c = await connection();
  const done = await publications();
  const stats = await readSetting<{ posts: Record<string, Stats> } | null>('instagram_stats', null);
  const today = parisNow().date;
  const next = nextArticle(done, today);
  const list = sortedArticles().slice(0, 15).map(a => ({ slug: a.slug, title: a.title, date: a.date, slides: slidesFor(a).length, caption: captionFor(a), publication: done[a.slug] ?? null, stats: stats?.posts[a.slug] ?? null }));
  return <PublicShell minimal>
    <p className="pub-eyebrow">Instagram</p>
    <h1>Carrousels du blog</h1>
    <p className="pub-lead">Chaque jour vers {process.env.INSTAGRAM_HEURE ?? 18} h (heure de Paris), le site publie sur Instagram le carrousel du dernier article du blog, s’il n’est pas déjà publié.</p>
    <InstagramAdmin username={c?.username ?? null} expiresAt={c?.expiresAt ?? null} next={next?.slug ?? null} articles={list} />
  </PublicShell>;
}
