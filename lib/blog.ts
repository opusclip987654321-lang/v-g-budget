import { articles, type Article } from './blog-articles';
import { organizationLd, SITE_NAME } from './seo';

export type { Article };
export { articles };
export const blogPath = (a: Article) => `/blog/${a.slug}`;
export const blogCover = (a: Article) => `/images/blog/${a.slug}.svg`;
// Version JPG de l'illustration : les réseaux sociaux et Google n'affichent pas le SVG en aperçu.
export const blogCoverJpg = (a: Article) => `/images/blog/${a.slug}.jpg`;
export const findArticle = (slug: string) => articles.find(a => a.slug === slug);
export const sortedArticles = () => [...articles].sort((a, b) => b.date.localeCompare(a.date) || articles.indexOf(a) - articles.indexOf(b));
export const blogCategories = [...new Set(articles.map(a => a.category))];

// Ancre d'un intertitre : « Où acheter en circuit court ? » → « ou-acheter-en-circuit-court ».
export const anchor = (title: string) => title.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\*\*|\[|\]\([^)]*\)/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const outline = (a: Article) => a.body.split('\n').filter(l => l.startsWith('## ')).map(l => ({ id: anchor(l.slice(3)), title: l.slice(3).replace(/\*\*/g, '') }));
export const readingMinutes = (a: Article) => Math.max(2, Math.round(a.body.split(/\s+/).length / 220));
export const dateLabel = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' });

export function articleLd(origin: string, a: Article) {
  const url = `${origin}${blogPath(a)}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting', '@id': `${url}#article`, headline: a.title, description: a.description, url, mainEntityOfPage: url,
        image: [`${origin}${blogCoverJpg(a)}`], datePublished: a.date, dateModified: a.updated ?? a.date, inLanguage: 'fr-FR',
        articleSection: a.category, keywords: a.keywords.join(', '), wordCount: a.body.split(/\s+/).length,
        author: { '@id': `${origin}/#organisation` }, publisher: { '@id': `${origin}/#organisation` },
      },
      organizationLd(origin),
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${origin}/` },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${origin}/blog` },
        { '@type': 'ListItem', position: 3, name: a.title, item: url },
      ] },
      ...(a.faq.length ? [{ '@type': 'FAQPage', mainEntity: a.faq.map(([q, r]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: r } })) }] : []),
    ],
  };
}
