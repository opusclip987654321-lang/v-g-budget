import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { recipes } from '@/lib/catalog';
import { money } from '@/lib/planner';
import { PRICE_SOURCE } from '@/lib/pricing';
import { findRecipe, ldScript, portionCost, publicOrigin, recipeImage, recipeIngredients, recipeLd, recipePath, recipeSteps } from '@/lib/seo';
import { Cta, PublicShell, RecipeCard } from '@/components/public-shell';

type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const recipe = findRecipe((await params).id);
  if (!recipe) return {};
  const title = `${recipe.title} : recette sans viande à ${money(portionCost(recipe))} la portion`;
  const description = `${recipe.description} Recette prête en ${recipe.minutes} minutes, environ ${money(portionCost(recipe))} par portion avec des ingrédients de supermarché.`;
  return { title, description, alternates: { canonical: recipePath(recipe) }, openGraph: { title, description, type: 'article', images: [{ url: recipeImage(recipe), alt: recipe.title }] } };
}
export default async function RecipePage({ params }: Props) {
  const recipe = findRecipe((await params).id);
  if (!recipe) notFound();
  const origin = await publicOrigin();
  const others = recipes.filter(r => r.id !== recipe.id && r.category === recipe.category).concat(recipes.filter(r => r.id !== recipe.id && r.category !== recipe.category)).slice(0, 4);
  return <PublicShell>
    <script type="application/ld+json" dangerouslySetInnerHTML={ldScript(recipeLd(origin, recipe))} />
    <nav className="pub-crumbs" aria-label="Fil d’Ariane"><Link href="/">Accueil</Link> › <Link href="/recettes">Recettes</Link> › <span>{recipe.title}</span></nav>
    <article className="pub-recipe">
      <div className="pub-recipe-head">
        <img src={recipeImage(recipe)} alt={recipe.title} width={600} height={600} />
        <div><p className="pub-eyebrow">{recipe.category} · 100 % végétal</p><h1>{recipe.title}</h1><p className="pub-lead">{recipe.description}</p>
          <ul className="pub-facts"><li><strong>{money(portionCost(recipe))}</strong> par portion</li><li><strong>{recipe.minutes} min</strong> au total</li><li><strong>{recipe.difficulty}</strong></li><li><strong>2</strong> portions</li></ul>
          <p className="pub-note">{PRICE_SOURCE}. Coût des quantités utilisées.</p></div>
      </div>
      <section><h2>Ingrédients pour 2 personnes</h2><ul className="pub-ingredients">{recipeIngredients(recipe).map(i => <li key={i.name}><span>{i.name}</span><span>{i.amount}</span></li>)}</ul></section>
      <section><h2>Préparation</h2><ol className="pub-steps">{recipeSteps(recipe).map((s, n) => <li key={n}>{s}</li>)}</ol>{recipe.tip && <p className="pub-tip"><strong>Astuce :</strong> {recipe.tip}</p>}</section>
      <Cta lead="Cette recette dans une semaine complète ?" />
      <section><h2>D’autres dîners pas chers</h2><ul className="pub-grid">{others.map(r => <li key={r.id}><RecipeCard id={r.id} /></li>)}</ul></section>
    </article>
  </PublicShell>;
}
