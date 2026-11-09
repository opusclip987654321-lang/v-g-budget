import { recipes } from '@/lib/catalog';
import { blogPath, sortedArticles } from '@/lib/blog';
import { money } from '@/lib/planner';
import { FOYERS, foyerPath, menuFoyer } from '@/lib/menu-foyer';
import { faq, HOME_DESCRIPTION, portionCost, publicOrigin, recipePath } from '@/lib/seo';
export const dynamic = 'force-dynamic';
// Résumé du site pour les assistants IA (format llms.txt : https://llmstxt.org).
export async function GET() {
  const origin = await publicOrigin();
  const text = [
    '# VégéBudget',
    '',
    `> ${HOME_DESCRIPTION}`,
    '',
    'VégéBudget est une application web française qui propose des dîners sans viande pour la semaine, selon le budget du foyer. Elle prépare la liste de courses adaptée aux menus, tient compte des ingrédients déjà disponibles et suit les dépenses que l’utilisateur enregistre. Toutes les recettes sont 100 % végétales et faciles.',
    '',
    '## Pages principales',
    `- [Accueil et application](${origin}/): créer ses menus gratuitement`,
    `- [Comment ça marche, prix et questions fréquentes](${origin}/comment-ca-marche)`,
    `- [Les ${recipes.length} recettes avec leur coût par portion](${origin}/recettes)`,
    `- [Le blog : bio, circuit court, saisons, bien-être animal, budget](${origin}/blog)`,
    '',
    '## Menus végétariens de la semaine, avec liste de courses chiffrée',
    ...FOYERS.map(f => { const m = menuFoyer(f); return `- [Menu de la semaine ${f.pour}](${origin}${foyerPath(f)}): 5 dîners, ${money(m.achat)} de courses, ${money(m.parPortion)} la portion`; }),
    '',
    '## Questions fréquentes',
    ...faq.flatMap(f => [`### ${f.q}`, f.a, '']),
    '## Articles du blog',
    ...sortedArticles().map(a => `- [${a.title}](${origin}${blogPath(a)}): ${a.description}`),
    '',
    '## Recettes',
    ...recipes.map(r => `- [${r.title}](${origin}${recipePath(r)}): ${r.minutes} min, environ ${money(portionCost(r))} par portion. ${r.description}`),
    '',
  ].join('\n');
  return new Response(text, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
}
