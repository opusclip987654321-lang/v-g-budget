import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { articleLd, articles, blogCover, blogCoverJpg, blogPath, dateLabel, findArticle, outline, readingMinutes } from '@/lib/blog';
import { ldScript, publicOrigin } from '@/lib/seo';
import { BlogContent, inline } from '@/components/blog-content';
import { Cta, PublicShell } from '@/components/public-shell';

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = findArticle((await params).slug);
  if (!a) return {};
  return { title: a.seoTitle ?? a.title, description: a.description, keywords: a.keywords, alternates: { canonical: blogPath(a) }, openGraph: { title: a.title, description: a.description, type: 'article', publishedTime: a.date, images: [{ url: blogCoverJpg(a), width: 1200, height: 675, alt: a.coverAlt }] } };
}
export default async function ArticlePage({ params }: Props) {
  const a = findArticle((await params).slug);
  if (!a) notFound();
  const origin = await publicOrigin();
  const toc = outline(a);
  const others = [...articles.filter(x => x.slug !== a.slug && x.category === a.category), ...articles.filter(x => x.slug !== a.slug && x.category !== a.category)].slice(0, 3);
  return <PublicShell>
    <script type="application/ld+json" dangerouslySetInnerHTML={ldScript(articleLd(origin, a))} />
    <nav className="pub-crumbs" aria-label="Fil d’Ariane"><Link href="/">Accueil</Link> › <Link href="/blog">Blog</Link> › <span>{a.title}</span></nav>
    <article className="blog-article">
      <p className="pub-eyebrow">{a.category}</p>
      <h1>{a.title}</h1>
      <p className="pub-lead">{inline(a.lead)}</p>
      <p className="pub-note">Par l’équipe VégéBudget · {dateLabel(a.date)} · {readingMinutes(a)} min de lecture</p>
      <figure className="blog-cover"><img src={blogCover(a)} alt={a.coverAlt} width={1200} height={675} /></figure>
      {toc.length > 2 && <nav className="blog-toc" aria-label="Sommaire"><strong>Au sommaire</strong><ol>{toc.map(t => <li key={t.id}><a href={`#${t.id}`}>{t.title}</a></li>)}</ol></nav>}
      <BlogContent body={a.body} />
      {a.faq.length > 0 && <section><h2 id="questions-frequentes">Questions fréquentes</h2><div className="pub-faq">{a.faq.map(([q, r]) => <details key={q}><summary>{q}</summary><p>{inline(r)}</p></details>)}</div></section>}
      {a.sources.length > 0 && <section className="blog-sources"><h2>Sources</h2><ul>{a.sources.map(([label, url]) => <li key={url}><a href={url} target="_blank" rel="noopener">{label}</a></li>)}</ul></section>}
      {!a.body.includes('@cta ') && <Cta lead="Des dîners sans viande, dans votre budget." />}
      <section><h2>À lire aussi</h2><ul className="blog-grid">{others.map(o => <li key={o.slug}><Link href={blogPath(o)} className="blog-card"><img src={blogCover(o)} alt="" width={600} height={338} loading="lazy" /><span className="blog-card-title">{o.title}</span><span className="pub-card-meta">{readingMinutes(o)} min de lecture</span></Link></li>)}</ul></section>
    </article>
  </PublicShell>;
}
