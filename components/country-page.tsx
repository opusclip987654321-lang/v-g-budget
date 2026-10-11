import type { Metadata } from 'next';
import Link from 'next/link';
import { ingredients as baseIngredients, recipes } from '@/lib/catalog';
import { money, recipeCost, shopping, totals, type Entry } from '@/lib/planner';
import { localizeIngredients, priceSource, REGIONS, type RegionCode } from '@/lib/region';
import { HREFLANG, ldScript, organizationLd, publicOrigin, recipeImage, recipePath } from '@/lib/seo';
import { PublicShell } from './public-shell';

// Page d'accueil d'un pays (Belgique, Suisse, Québec) : prix et monnaie du pays, mots du pays (souper, épicerie).
type Copy = { title: string; h1: string; lead: string; groceries: string; store: string; faq: [string, string][] };
const COPY: Record<Exclude<RegionCode, 'FR'>, Copy> = {
  BE: {
    title: 'Menu de la semaine pas cher en Belgique : soupers sans viande et liste de courses',
    h1: 'Vos soupers de la semaine, dans votre budget, en Belgique',
    lead: 'VégéBudget compose vos soupers sans viande selon votre budget, déduit ce que vous avez au placard et vous donne la liste de courses exacte, avec les prix belges.',
    groceries: 'courses', store: 'votre supermarché',
    faq: [['Les prix sont-ils ceux de la Belgique ?', 'Oui : les prix ont été relevés dans un supermarché belge, en euros. Vous pouvez aussi saisir les prix de votre magasin, le budget est recalculé tout de suite.']],
  },
  CH: {
    title: 'Menu de la semaine pas cher en Suisse : soupers sans viande et liste de courses en CHF',
    h1: 'Vos soupers de la semaine, dans votre budget, en Suisse',
    lead: 'VégéBudget compose vos soupers sans viande selon votre budget, déduit ce que vous avez au placard et vous donne la liste de courses exacte, en francs suisses.',
    groceries: 'courses', store: 'votre supermarché',
    faq: [['Les prix sont-ils en francs suisses ?', 'Oui : les prix ont été relevés dans un supermarché suisse, en CHF. Vous pouvez aussi saisir les prix de votre magasin, le budget est recalculé tout de suite.']],
  },
  QC: {
    title: 'Menu de la semaine pas cher au Québec : soupers sans viande et liste d’épicerie',
    h1: 'Vos soupers de la semaine, dans votre budget, au Québec',
    lead: 'VégéBudget compose vos soupers sans viande selon votre budget, déduit ce que vous avez au garde-manger et vous donne la liste d’épicerie exacte, en dollars canadiens.',
    groceries: 'épicerie', store: 'votre épicerie',
    faq: [['Les prix sont-ils ceux du Québec ?', 'Oui : les prix ont été relevés dans une épicerie québécoise, en dollars canadiens. Vous pouvez aussi saisir les prix de votre épicerie, le budget est recalculé tout de suite.']],
  },
};
// Semaine d'exemple : les 5 soupers du menu à petit prix du blog, pour 2 personnes.
const EXAMPLE = ['curry-corail', 'pates-brocoli', 'riz-saute', 'epinards-pois-chiches', 'soupe-petits-pois'];

export function countryExample(code: RegionCode) {
  const ingredients = localizeIngredients(baseIngredients, code);
  const entries: Entry[] = EXAMPLE.map((recipeId, n) => ({ id: recipeId, recipeId, date: `2026-10-${12 + n}`, servings: 2, cooked: false, locked: false }));
  const week = totals(shopping(entries, [], {}, recipes, ingredients));
  const portions = recipes.map(r => ({ recipe: r, cost: recipeCost(r, 2, {}, ingredients) / 2 })).sort((a, b) => a.cost - b.cost);
  return { week, portions, estimated: ingredients.filter(i => 'estimated' in i && i.estimated).length };
}

export function countryMetadata(code: Exclude<RegionCode, 'FR'>): Metadata {
  const r = REGIONS[code], c = COPY[code];
  const description = `${c.lead} Première semaine gratuite.`;
  return { title: c.title, description, alternates: { canonical: r.path, languages: HREFLANG }, openGraph: { title: c.title, description, locale: r.locale.replace('-', '_') } };
}

export async function CountryPage({ code }: { code: Exclude<RegionCode, 'FR'> }) {
  const origin = await publicOrigin();
  const r = REGIONS[code], c = COPY[code];
  const { week, portions } = countryExample(code);
  const start = `/?pays=${r.short}`;
  const faq: [string, string][] = [
    [`Combien coûte une semaine de soupers ?`, `L’exemple de semaine (5 soupers pour 2 personnes) revient à environ ${money(week.purchase, code)} ${c.groceries === 'épicerie' ? 'd’épicerie' : 'de courses'}, en paquets entiers. ${priceSource(code)}.`],
    ['Est-ce que VégéBudget est gratuit ?', `La première semaine est gratuite, sans compte ni carte bancaire. Ensuite, Premium coûte ${r.premium.label} par mois, sans engagement.`],
    ...c.faq,
  ];
  const ld = { '@context': 'https://schema.org', '@graph': [organizationLd(origin), { '@type': 'WebPage', name: c.title, url: `${origin}${r.path}`, inLanguage: r.locale }, { '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }] };
  return <PublicShell>
    <script type="application/ld+json" dangerouslySetInnerHTML={ldScript(ld)} />
    <p className="pub-eyebrow">VégéBudget · {r.name}</p>
    <h1>{c.h1}</h1>
    <p className="pub-lead">{c.lead}</p>
    <ul className="pub-facts"><li><strong>{money(week.purchase, code)}</strong> la semaine type pour 2</li><li><strong>{money(portions[0].cost, code)}</strong> la portion la moins chère</li><li><strong>3 minutes</strong> pour composer la semaine</li></ul>
    <p className="pub-note">{priceSource(code)}.</p>
    <div className="pub-cta-box"><p><strong>Essayez avec votre budget.</strong> Vos soupers, la liste {c.groceries === 'épicerie' ? 'd’épicerie' : 'de courses'} exacte et le total avant de partir à {c.store}.</p><Link href={start} className="pub-cta">Composer ma semaine gratuitement</Link><small>Première semaine gratuite, sans compte ni carte bancaire.</small></div>
    <section><h2>Les soupers les moins chers, aux prix {code === 'QC' ? 'du Québec' : code === 'CH' ? 'suisses' : 'belges'}</h2>
      <ul className="pub-grid">{portions.slice(0, 8).map(({ recipe, cost }) => <li key={recipe.id}><Link href={recipePath(recipe)} className="pub-card"><img src={recipeImage(recipe)} alt="" width={300} height={300} loading="lazy" /><span className="pub-card-title">{recipe.title}</span><span className="pub-card-meta">{recipe.minutes} min · {money(cost, code)} la portion</span></Link></li>)}</ul></section>
    <section><h2>Questions fréquentes</h2><div className="pub-faq">{faq.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></section>
    <p className="pub-note">Aussi disponible : {(['FR', 'BE', 'CH', 'QC'] as RegionCode[]).filter(x => x !== code).map((x, n) => <span key={x}>{n > 0 && ' · '}<Link href={REGIONS[x].path}>{REGIONS[x].name}</Link></span>)}</p>
  </PublicShell>;
}
