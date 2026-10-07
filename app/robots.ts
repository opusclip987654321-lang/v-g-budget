import type { MetadataRoute } from 'next';
import { publicOrigin } from '@/lib/seo';
export const dynamic = 'force-dynamic';
// Moteurs de recherche et assistants IA (ChatGPT, Claude, Perplexity, Gemini…) sont tous bienvenus : on veut être cité.
const aiBots = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'Bingbot', 'CCBot', 'Meta-ExternalAgent', 'MistralAI-User'];
export default async function robots(): Promise<MetadataRoute.Robots> {
  const origin = await publicOrigin();
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }, ...aiBots.map(userAgent => ({ userAgent, allow: '/', disallow: ['/api/'] }))],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
