import type { Metadata } from 'next';
import Link from 'next/link';
import { categories, recipes } from '@/lib/catalog';
import { money } from '@/lib/planner';
import { PRICE_SOURCE } from '@/lib/pricing';
import { ldScript, organizationLd, portionCost, publicOrigin, recipePath } from '@/lib/seo';
import { Cta, PublicShell, RecipeCard } from '@/components/public-shell';

const costs = recipes.map(portionCost);
const title = `${recipes.length} recettes sans viande pas chères, de ${money(Math.min(...costs))} à ${money(Math.max(...costs))} la portion`;
const description = 'Des dîners végétariens faciles et économiques : lentilles, pois chiches, pâtes, soupes. Le coût par portion de chaque recette, calculé avec les prix du supermarché.';
export const metadata: Metadata = { title, description, alternates: { canonical: '/recettes' }, openGraph: { title, description } };

export default async function Recipes() {
  const origin = await publicOrigin();
  const sorted = [...recipes].sort((a, b) => portionCost(a) - portionCost(b));
  const ld = { '@context': 'https://schema.org', '@graph': [organizationLd(origin), { '@type': 'ItemList', name: 'Recettes sans viande pas chères', itemListElement: sorted.map((r, n) => ({ '@type': 'ListItem', position: n + 1, url: `${origin}${recipePath(r)}`, name: r.title })) }] };
  return <PublicShell>
    <script type="application/ld+json" dangerouslySetInnerHTML={ldScript(ld)} />
    <p className="pub-eyebrow">Recettes</p>
    <h1>Recettes sans viande pas chères</h1>
    <p className="pub-lead">{recipes.length} dîners faciles, prêts en 15 à 40 minutes, avec des ingrédients de supermarché. Le moins cher : {sorted[0].title.toLowerCase()} à {money(portionCost(sorted[0]))} la portion.</p>
    <p className="pub-note">{PRICE_SOURCE}. Coût des quantités utilisées, pour une portion.</p>
    {categories.filter(c => c !== 'Toutes').map(c => {
      const list = sorted.filter(r => r.category === c);
      return list.length ? <section key={c}><h2>{c}</h2><ul className="pub-grid">{list.map(r => <li key={r.id}><RecipeCard id={r.id} /></li>)}</ul></section> : null;
    })}
    <Cta lead="Ne plus chercher quoi manger ce soir ?" text="Composer ma semaine avec ces recettes" />
    <p className="pub-note"><Link href="/comment-ca-marche">Comment VégéBudget calcule le budget</Link></p>
  </PublicShell>;
}
