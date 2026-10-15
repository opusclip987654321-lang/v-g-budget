import Link from 'next/link';
import { money } from '@/lib/planner';
import { findRecipe, portionCost, recipeImage, recipePath } from '@/lib/seo';
import { TrackVisit } from './track-visit';
// Entrée dans l'appli : ouvre directement le formulaire de première semaine.
export const START_PATH = '/app?commencer=1';
// Habillage des pages publiques (recettes, aide) : du HTML simple, lisible par Google et les assistants IA.
// minimal : page d'accueil en tunnel fermé : aucun lien vers les autres pages publiques, seulement l'entrée dans l'appli et la connexion.
// Les recettes, le blog et les pages pays restent publics pour les moteurs de recherche (sitemap).
export function PublicShell({ children, minimal = false }: { children: React.ReactNode; minimal?: boolean }) {
  return <div className="pub">
    <header className="pub-header"><Link href="/" className="pub-logo"><span aria-hidden="true" />VégéBudget</Link><nav aria-label="Pages">{!minimal && <><Link href="/recettes">Recettes</Link><Link href="/blog">Blog</Link><Link href="/comment-ca-marche">Comment ça marche</Link></>}<Link href="/app#compte">Me connecter</Link><Link href={START_PATH} className="pub-cta">Créer mes menus</Link></nav></header>
    <TrackVisit />
    <main className="pub-main">{children}</main>
    {minimal ? <footer className="pub-footer"><p>VégéBudget · Des dîners sans viande, plus simples à organiser.</p></footer> : <footer className="pub-footer"><p>VégéBudget · Des repas du soir sans viande, plus simples à organiser. <Link href="/belgique">Belgique</Link> · <Link href="/suisse">Suisse</Link> · <Link href="/quebec">Québec</Link></p><nav aria-label="Liens"><Link href="/">Accueil</Link><Link href="/recettes">Toutes les recettes</Link><Link href="/blog">Blog</Link><Link href="/comment-ca-marche">Comment ça marche</Link></nav></footer>}
  </div>;
}
export function Cta({ lead, text = 'Créer mes menus gratuitement' }: { lead: string; text?: string }) {
  return <div className="pub-cta-box"><p><strong>{lead}</strong> Préparez vos menus selon votre budget et retrouvez les produits à acheter, en tenant compte de ce que vous avez déjà.</p><Link href={START_PATH} className="pub-cta">{text}</Link><small>Première semaine gratuite, sans compte ni carte bancaire.</small></div>;
}
export function RecipeCard({ id }: { id: string }) {
  const r = findRecipe(id)!;
  return <Link href={recipePath(r)} className="pub-card"><img src={recipeImage(r)} alt="" width={300} height={300} loading="lazy" /><span className="pub-card-title">{r.title}</span><span className="pub-card-meta">{r.minutes} min · {money(portionCost(r))} par portion</span></Link>;
}
// Grande carte recette dans un article : photo, temps, coût par portion et une phrase sur le plat.
export function RecipeFeature({ id, text }: { id: string; text: React.ReactNode }) {
  const r = findRecipe(id)!;
  return <article className="blog-recipe"><Link href={recipePath(r)} tabIndex={-1} aria-hidden="true"><img src={recipeImage(r)} alt="" width={320} height={240} loading="lazy" /></Link><div><h3><Link href={recipePath(r)}>{r.title}</Link></h3><p className="blog-recipe-meta"><span>{r.minutes} min</span><span>{money(portionCost(r))} la portion</span></p><p>{text}</p><Link href={recipePath(r)} className="blog-recipe-link">Voir la recette</Link></div></article>;
}
// Bandeau d'essai court, au fil de l'article (le grand encadré @cta reste à la fin).
export function CtaInline({ lead }: { lead: string }) {
  return <div className="blog-cta-inline"><p><strong>{lead}</strong> <span>Première semaine gratuite, sans compte ni carte bancaire.</span></p><Link href={START_PATH} className="pub-cta">Créer mes menus gratuitement</Link></div>;
}
