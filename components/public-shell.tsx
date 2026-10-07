import Link from 'next/link';
import { money } from '@/lib/planner';
import { findRecipe, portionCost, recipeImage, recipePath } from '@/lib/seo';
import { TrackVisit } from './track-visit';
// Habillage des pages publiques (recettes, aide) : du HTML simple, lisible par Google et les assistants IA.
export function PublicShell({ children }: { children: React.ReactNode }) {
  return <div className="pub">
    <header className="pub-header"><Link href="/" className="pub-logo"><span aria-hidden="true" />VégéBudget</Link><nav aria-label="Pages"><Link href="/recettes">Recettes</Link><Link href="/blog">Blog</Link><Link href="/comment-ca-marche">Comment ça marche</Link><Link href="/" className="pub-cta">Composer ma semaine</Link></nav></header>
    <TrackVisit />
    <main className="pub-main">{children}</main>
    <footer className="pub-footer"><p>VégéBudget · Des dîners sans viande, dans votre budget.</p><nav aria-label="Liens"><Link href="/">Accueil</Link><Link href="/recettes">Toutes les recettes</Link><Link href="/blog">Blog</Link><Link href="/comment-ca-marche">Comment ça marche</Link></nav></footer>
  </div>;
}
export function Cta({ lead, text = 'Composer ma semaine gratuitement' }: { lead: string; text?: string }) {
  return <div className="pub-cta-box"><p><strong>{lead}</strong> VégéBudget compose vos dîners selon votre budget et vous donne la liste de courses exacte.</p><Link href="/" className="pub-cta">{text}</Link><small>Première semaine gratuite, sans compte ni carte bancaire.</small></div>;
}
export function RecipeCard({ id }: { id: string }) {
  const r = findRecipe(id)!;
  return <Link href={recipePath(r)} className="pub-card"><img src={recipeImage(r)} alt="" width={300} height={300} loading="lazy" /><span className="pub-card-title">{r.title}</span><span className="pub-card-meta">{r.minutes} min · {money(portionCost(r))} la portion</span></Link>;
}
