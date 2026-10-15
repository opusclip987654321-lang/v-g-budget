import { dailyArticles } from '@/content/blog';

// Articles du blog. Le corps est en markdown simple (voir components/blog-content.tsx pour ce qui est reconnu).
// Chaque article a une illustration public/images/blog/<slug>.svg et sa version .jpg (aperçu réseaux sociaux),
// ou seulement une photo <slug>.jpg quand photo est vrai (photo générée par scripts/blog-photo.mjs).
export type Article = {
  slug: string; title: string; seoTitle?: string; description: string; lead: string; category: string; keywords: string[];
  date: string; updated?: string; coverAlt: string; photo?: boolean; body: string; faq: [string, string][]; sources: [string, string][];
  // Liste ordonnée d'éléments de la page (ancres de ses intertitres), reprise dans les données structurées (ItemList).
  itemList?: { name: string; items: { name: string; anchor: string }[] };
};

// Tous les articles sont dans content/blog (un fichier par article).
export const articles: Article[] = [...dailyArticles];
