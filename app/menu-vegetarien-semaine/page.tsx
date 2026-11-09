import type { Metadata } from 'next';
import Link from 'next/link';
import { money } from '@/lib/planner';
import { PRICE_SOURCE } from '@/lib/pricing';
import { FOYERS, foyerPath, MENU_PATH, menuFoyer } from '@/lib/menu-foyer';
import { Cta, PublicShell } from '@/components/public-shell';

const title = 'Menu végétarien de la semaine pas cher, avec la liste de courses chiffrée';
const description = '5 dîners sans viande pour 1, 2 ou 4 personnes, avec le prix réel de chaque plat et la liste de courses. Recettes simples et 100 % végétales.';
export const metadata: Metadata = { title, description, alternates: { canonical: MENU_PATH }, openGraph: { title, description } };

export default function MenusPage() {
  const menus = FOYERS.map(f => ({ f, m: menuFoyer(f) }));
  return <PublicShell>
    <nav className="pub-crumbs" aria-label="Fil d’Ariane"><Link href="/">Accueil</Link> › <span>Menus de la semaine</span></nav>
    <h1>Menu végétarien de la semaine, selon la taille du foyer</h1>
    <p className="pub-lead">Cinq dîners sans viande, la liste de courses et le prix réel de chaque plat. Choisissez votre foyer.</p>
    <ul className="pub-ingredients">{menus.map(({ f, m }) => <li key={f.slug}><span><Link href={foyerPath(f)}>Menu de la semaine {f.pour}</Link></span><span>{money(m.achat)} de courses · {money(m.parPortion)} la portion</span></li>)}</ul>
    <p className="pub-note">{PRICE_SOURCE}.</p>
    <Cta lead="Un menu adapté à votre budget, chaque semaine." />
  </PublicShell>;
}
