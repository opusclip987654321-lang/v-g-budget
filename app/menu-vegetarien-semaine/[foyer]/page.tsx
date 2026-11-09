import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { money } from '@/lib/planner';
import { PRICE_SOURCE } from '@/lib/pricing';
import { FOYERS, findFoyer, foyerPath, MENU_PATH, menuDescription, menuFaq, menuFoyer, menuTitle } from '@/lib/menu-foyer';
import { ldScript, organizationLd, publicOrigin, recipeImage, recipePath } from '@/lib/seo';
import { Cta, CtaInline, PublicShell } from '@/components/public-shell';

type Props = { params: Promise<{ foyer: string }> };
export const generateStaticParams = () => FOYERS.map(f => ({ foyer: f.slug }));
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const f = findFoyer((await params).foyer);
  if (!f) return {};
  const m = menuFoyer(f);
  const title = menuTitle(m); const description = menuDescription(m);
  return { title, description, alternates: { canonical: foyerPath(f) }, openGraph: { title, description, type: 'article', images: m.diners[0] ? [{ url: recipeImage(m.diners[0].recipe), alt: m.diners[0].recipe.title }] : [] } };
}

export default async function MenuFoyerPage({ params }: Props) {
  const f = findFoyer((await params).foyer);
  if (!f) notFound();
  const m = menuFoyer(f);
  const faq = menuFaq(m);
  const origin = await publicOrigin();
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      organizationLd(origin),
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${origin}/` },
        { '@type': 'ListItem', position: 2, name: 'Menus de la semaine', item: `${origin}${MENU_PATH}` },
        { '@type': 'ListItem', position: 3, name: f.label, item: `${origin}${foyerPath(f)}` },
      ] },
      { '@type': 'ItemList', name: menuTitle(m), itemListElement: m.diners.map((d, n) => ({ '@type': 'ListItem', position: n + 1, url: `${origin}${recipePath(d.recipe)}`, name: `${d.jour} : ${d.recipe.title}` })) },
      { '@type': 'FAQPage', mainEntity: faq.map(x => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })) },
    ],
  };
  const autres = FOYERS.filter(x => x.slug !== f.slug).map(x => ({ f: x, m: menuFoyer(x) }));
  return <PublicShell>
    <script type="application/ld+json" dangerouslySetInnerHTML={ldScript(ld)} />
    <nav className="pub-crumbs" aria-label="Fil d’Ariane"><Link href="/">Accueil</Link> › <Link href={MENU_PATH}>Menus de la semaine</Link> › <span>{f.label}</span></nav>
    <article className="pub-recipe">
      <p className="pub-eyebrow">Menu de la semaine · 100 % végétal · {f.label}</p>
      <h1>Menu végétarien de la semaine {f.pour} : 5 dîners pour {money(m.achat)}</h1>
      <p className="pub-lead">Cinq dîners sans viande, du lundi au vendredi, avec la liste de courses et le prix de chaque plat. Pas de fourchette approximative : chaque montant est calculé ingrédient par ingrédient.</p>
      <ul className="pub-facts">
        <li><strong>{money(m.achat)}</strong> de courses (paquets entiers)</li>
        <li><strong>{money(m.parPortion)}</strong> la portion</li>
        <li><strong>{money(m.utilise)}</strong> de produits vraiment utilisés</li>
        {f.people > 1 && <li><strong>{money(m.parPersonne)}</strong> de courses par personne</li>}
      </ul>
      <p className="pub-note">{PRICE_SOURCE}. Les prix peuvent varier selon le magasin.</p>

      <section><h2>Les 5 dîners de la semaine</h2>
        <ul className="pub-grid">{m.diners.map(d => <li key={d.jour}><Link href={recipePath(d.recipe)} className="pub-card"><img src={recipeImage(d.recipe)} alt="" width={300} height={300} loading="lazy" /><span className="pub-card-meta">{d.jour}</span><span className="pub-card-title">{d.recipe.title}</span><span className="pub-card-meta">{d.recipe.minutes} min · {money(d.cout)} pour {f.label} · {money(d.parPortion)} la portion</span></Link></li>)}</ul>
      </section>

      <section><h2>La liste de courses ({money(m.achat)})</h2>
        <ul className="pub-ingredients">{m.courses.map(c => <li key={c.id}><span>{c.nom} · {c.quantite}</span><span>{money(c.prix)}</span></li>)}<li><span><strong>Total</strong></span><span><strong>{money(m.achat)}</strong></span></li></ul>
        <p className="pub-note">Il vous restera environ {money(m.reste)} de produits entamés (huile, sel, oignons…) pour les semaines suivantes. Si vous avez déjà certains produits, vos courses coûteront moins cher.</p>
      </section>

      <CtaInline lead="Adaptez ce menu à votre budget et à votre placard." />

      <section><h2>Et pour un autre foyer ?</h2>
        <ul className="pub-ingredients">{autres.map(a => <li key={a.f.slug}><span><Link href={foyerPath(a.f)}>Menu de la semaine {a.f.pour}</Link></span><span>{money(a.m.achat)} · {money(a.m.parPortion)} la portion</span></li>)}</ul>
      </section>

      <section><h2>Questions fréquentes</h2>
        {faq.map(x => <div key={x.q}><h3>{x.q}</h3><p>{x.a}</p></div>)}
      </section>

      <Cta lead={`Vos menus ${f.pour}, selon votre budget.`} />
    </article>
  </PublicShell>;
}
