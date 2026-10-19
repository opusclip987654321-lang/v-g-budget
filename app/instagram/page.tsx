import type { Metadata } from 'next';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { isAdmin, memberFor, readSetting } from '@/lib/server';
import { infos } from '@/content/instagram/carrousels';
import { connection, findPost, nextInfo, publications, type Stats } from '@/lib/instagram';
import { PublicShell } from '@/components/public-shell';
import { InstagramAdmin } from './instagram-admin';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Instagram', robots: { index: false, follow: false } };

// Page du propriétaire du site : connecter le compte Instagram, voir le prochain carrousel, publier à la main.
export default async function InstagramPage() {
  const user = await getCurrentUser().catch(() => null);
  // memberFor enregistre le propriétaire (OWNER_EMAIL) s'il ne s'est encore jamais connecté.
  if (user) await memberFor(user);
  if (!user || !await isAdmin(user.userId)) return <PublicShell minimal>
    <h1>Espace réservé</h1>
    <p className="pub-lead">{user ? `Vous êtes connecté avec ${user.email}, qui n’est pas l’adresse du propriétaire du site.` : 'Connectez-vous d’abord avec l’adresse du propriétaire du site, puis revenez sur cette page.'}</p>
    <p><Link href="/app">{user ? 'Aller à mon espace' : 'Me connecter'}</Link></p>
  </PublicShell>;
  const c = await connection();
  const done = await publications();
  const stats = await readSetting<{ posts: Record<string, Stats> } | null>('instagram_stats', null);
  const next = nextInfo(done);
  // Carrousels « infos végé » dans l'ordre de publication, puis les carrousels déjà publiés qui n'en font pas partie (articles du blog).
  const slugs = [...infos.map(i => i.slug), ...Object.keys(done).filter(slug => !infos.some(i => i.slug === slug))];
  const list = slugs.flatMap((slug, k) => { const p = findPost(slug); return p ? [{ slug, title: p.title, date: k < infos.length ? `n° ${k + 1}` : 'article du blog', slides: p.slides.length, caption: p.caption, publication: done[slug] ?? null, stats: stats?.posts[slug] ?? null }] : []; });
  return <PublicShell minimal>
    <p className="pub-eyebrow">Instagram</p>
    <h1>Carrousels Instagram</h1>
    <p className="pub-lead">Chaque jour vers {process.env.INSTAGRAM_HEURE ?? 18} h (heure de Paris), le site publie sur Instagram le prochain carrousel « infos végé » de la liste. Claude en ajoute chaque semaine.</p>
    <InstagramAdmin username={c?.username ?? null} expiresAt={c?.expiresAt ?? null} next={next?.slug ?? null} articles={list} />
  </PublicShell>;
}
