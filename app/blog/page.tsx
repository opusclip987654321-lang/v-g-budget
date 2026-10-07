import type { Metadata } from 'next';
import Link from 'next/link';
import { blogCategories, blogCover, blogPath, dateLabel, readingMinutes, sortedArticles } from '@/lib/blog';
import { ldScript, organizationLd, publicOrigin } from '@/lib/seo';
import { Cta, PublicShell } from '@/components/public-shell';

const title = 'Blog : manger bio, local et sans viande avec un petit budget';
const description = 'Bio pas cher, circuit court, fruits et légumes de saison, code des œufs, bien-être animal, protéines végétales : des guides pratiques pour mieux manger sans dépenser plus.';
export const metadata: Metadata = { title, description, alternates: { canonical: '/blog' }, openGraph: { title, description } };

export default async function Blog() {
  const origin = await publicOrigin();
  const list = sortedArticles();
  const ld = { '@context': 'https://schema.org', '@graph': [organizationLd(origin), { '@type': 'Blog', '@id': `${origin}/blog#blog`, name: 'Le blog VégéBudget', url: `${origin}/blog`, inLanguage: 'fr-FR', publisher: { '@id': `${origin}/#organisation` }, blogPost: list.map(a => ({ '@type': 'BlogPosting', headline: a.title, url: `${origin}${blogPath(a)}`, datePublished: a.date })) }] };
  return <PublicShell>
    <script type="application/ld+json" dangerouslySetInnerHTML={ldScript(ld)} />
    <p className="pub-eyebrow">Le blog</p>
    <h1>Mieux manger, sans dépenser plus</h1>
    <p className="pub-lead">Bio, circuit court, saisons, bien-être animal : ce qui compte vraiment dans l’assiette, et comment le faire avec un petit budget.</p>
    {blogCategories.map(c => <section key={c}><h2>{c}</h2><ul className="blog-grid">{list.filter(a => a.category === c).map(a => <li key={a.slug}>
      <Link href={blogPath(a)} className="blog-card"><img src={blogCover(a)} alt="" width={600} height={338} loading="lazy" /><span className="blog-card-title">{a.title}</span><span className="blog-card-text">{a.description}</span><span className="pub-card-meta">{dateLabel(a.date)} · {readingMinutes(a)} min de lecture</span></Link>
    </li>)}</ul></section>)}
    <Cta lead="Passer de la lecture à l’assiette ?" />
  </PublicShell>;
}
