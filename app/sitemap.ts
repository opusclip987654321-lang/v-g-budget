import type { MetadataRoute } from 'next';
import { recipes } from '@/lib/catalog';
import { publicOrigin, PUBLISHED, recipeImage, recipePath } from '@/lib/seo';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = await publicOrigin();
  const lastModified = new Date(`${PUBLISHED}T12:00:00Z`);
  return [
    { url: `${origin}/`, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${origin}/recettes`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${origin}/comment-ca-marche`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    ...recipes.map(r => ({ url: `${origin}${recipePath(r)}`, lastModified, changeFrequency: 'monthly' as const, priority: 0.7, images: [`${origin}${recipeImage(r)}`] })),
  ];
}
