import type { Metadata } from 'next';
import Link from 'next/link';
import { categories, recipes } from '@/lib/catalog';
import { PRICE_SOURCE } from '@/lib/pricing';
import { ldScript, organizationLd, portionCost, publicOrigin, recipePath } from '@/lib/seo';
import { Cta, PublicShell, RecipeCard } from '@/components/public-shell';

const minutes = recipes.map(r => r.minutes);
const title = 'Recettes sans viande pour les petits budgets';
const description = 'Découvrez des recettes faciles pour vos repas du soir, avec les étapes de préparation et le coût estimé des ingrédients par portion.';
export const metadata: Metadata = { title, description, alternates: { canonical: '/recettes' }, openGraph: { title, description } };

export default async function Recipes() {
  const origin = await publicOrigin();
  const sorted = [...recipes].sort((a, b) => portionCost(a) - portionCost(b));
  const ld = { '@context': 'https://schema.org', '@graph': [organizationLd(origin), { '@type': 'ItemList', name: 'Recettes sans viande pour les petits budgets', itemListElement: sorted.map((r, n) => ({ '@type': 'ListItem', position: n + 1, url: `${origin}${recipePath(r)}`, name: r.title })) }] };
  return <PublicShell>
    <script type="application/ld+json" dangerouslySetInnerHTML={ldScript(ld)} />
    <p className="pub-eyebrow">Recettes</p>
    <h1>Des recettes sans viande pour les petits budgets</h1>
    <p className="pub-lead">Découvrez {recipes.length} recettes faciles pour varier vos repas du soir, prêtes en {Math.min(...minutes)} à {Math.max(...minutes)} minutes, avec des ingrédients courants et un coût estimé pour chaque portion.</p>
    <p className="pub-note">Les prix correspondent aux quantités utilisées pour une personne, et non au montant des paquets à acheter. {PRICE_SOURCE}.</p>
    <p className="pub-note"><Link href="/blog/menu-semaine-pas-cher">Voir une semaine complète, midi et soir</Link>, avec la liste de courses.</p>
    {categories.filter(c => c !== 'Toutes').map(c => {
      const list = sorted.filter(r => r.category === c);
      return list.length ? <section key={c}><h2>{c}</h2><ul className="pub-grid">{list.map(r => <li key={r.id}><RecipeCard id={r.id} /></li>)}</ul></section> : null;
    })}
    <Cta lead="Ce soir, vous savez déjà quoi cuisiner." />
    <p className="pub-note"><Link href="/comment-ca-marche">Comprendre le calcul du budget</Link></p>
  </PublicShell>;
}
