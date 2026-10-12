import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { recipes } from '@/lib/catalog';
import { money } from '@/lib/planner';
import { FOUNDER_PRICE_LABEL, FOUNDER_SEATS, PREMIUM_PRICE_LABEL, PRICE_SOURCE } from '@/lib/pricing';
import { faq, homeExample, homeLd, ldScript, portionCost, publicOrigin, recipeImage, recipePath } from '@/lib/seo';
import { PublicShell, START_PATH } from '@/components/public-shell';
import { AppLinkRedirect } from '@/components/app-link-redirect';
export const dynamic = 'force-dynamic';

// Page d'accueil publique : elle présente le service et mène à l'appli (/app).
// Un membre connecté va directement à ses menus.
export default async function Home() {
  if (await getCurrentUser()) redirect('/app');
  const origin = await publicOrigin();
  const example = homeExample();
  const week = example.recipeIds.map(id => recipes.find(r => r.id === id)!).filter(Boolean);
  return <PublicShell minimal>
    <script type="application/ld+json" dangerouslySetInnerHTML={ldScript(homeLd(origin))} />
    <AppLinkRedirect />
    <section className="land-hero">
      <div>
        <p className="land-eyebrow">Vos repas du soir, votre liste de courses, votre budget.</p>
        <h1>Mangez sans viande. Gardez le plaisir, maîtrisez le budget.</h1>
        <p className="land-lead">Qu’est-ce qu’on mange ce soir ? VégéBudget vous propose des dîners sans viande, faciles et adaptés à votre budget, avec la liste de courses qui va avec.</p>
        <Link href={START_PATH} className="pub-cta land-cta">Créer mes menus gratuitement</Link>
        <p className="land-reassure">Première semaine gratuite, sans compte ni carte bancaire.</p>
      </div>
      <img src="/images/couscous.jpg" alt="Couscous aux légumes et aux pois chiches" width={560} height={560} />
    </section>

    <section className="land-example" aria-labelledby="exemple">
      <div className="land-example-head">
        <p className="land-eyebrow">Un exemple concret</p>
        <h2 id="exemple">{example.dinners} dîners pour 2 personnes, environ {Math.round(example.purchase)} € de courses</h2>
        <p>Ce montant compte les produits à acheter en entier : une partie reste pour d’autres repas.</p>
      </div>
      <ol className="land-week">{week.map((r, n) => <li key={r.id}><Link href={recipePath(r)}><img src={recipeImage(r)} alt="" width={120} height={120} loading="lazy" /><span><small>{['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'][n]}</small><strong>{r.title}</strong><small>{r.minutes} min · {money(portionCost(r))} par portion</small></span></Link></li>)}</ol>
      <p className="pub-note">{PRICE_SOURCE}. Les prix peuvent varier selon le magasin. Le prix par portion correspond aux ingrédients utilisés.</p>
    </section>

    <section aria-labelledby="etapes">
      <h2 id="etapes">Trois étapes pour préparer votre semaine</h2>
      <ol className="land-steps">
        <li><span>1</span><strong>Dites-nous pour combien vous cuisinez</strong><p>Le nombre de personnes, les soirs à prévoir, votre temps de cuisine et votre budget.</p></li>
        <li><span>2</span><strong>Utilisez ce que vous avez déjà</strong><p>Cochez ce que vous avez à la maison : la liste de courses en tient compte.</p></li>
        <li><span>3</span><strong>Retrouvez vos menus et vos courses</strong><p>Vos dîners, les produits à acheter et le montant estimé, avant de partir au magasin.</p></li>
      </ol>
    </section>

    <section aria-labelledby="pourquoi">
      <h2 id="pourquoi">Ce que ça change, chaque semaine</h2>
      <ul className="land-benefits">
        <li><strong>Plus de « on mange quoi ce soir ? »</strong><p>Vos dîners de la semaine sont prévus, avec des recettes simples de {Math.min(...recipes.map(r => r.minutes))} à {Math.max(...recipes.map(r => r.minutes))} minutes.</p></li>
        <li><strong>Une seule liste de courses</strong><p>Tout ce qu’il faut acheter pour la semaine, regroupé par type de produit.</p></li>
        <li><strong>Le budget connu avant le magasin</strong><p>Vous voyez le montant estimé avant de partir, puis vous suivez les dépenses que vous enregistrez.</p></li>
      </ul>
    </section>

    <section aria-labelledby="formules">
      <h2 id="formules">Essayez gratuitement, continuez si ça vous aide</h2>
      <div className="land-plans">
        <article><p className="land-eyebrow">Découverte</p><p className="land-price">Gratuit</p><p>Votre première semaine de menus et sa liste de courses, sans compte ni carte bancaire.</p><Link href={START_PATH} className="pub-cta">Créer mes menus gratuitement</Link></article>
        <article className="land-premium"><p className="land-eyebrow">Premium</p><p className="land-price">{PREMIUM_PRICE_LABEL} <small>par mois</small></p><p>De nouveaux menus et leur liste de courses chaque semaine, vos menus préférés réutilisables et le suivi de vos dépenses. Sans engagement, résiliable depuis Mon compte.</p><p className="land-founder"><strong>Offre de lancement :</strong> Premium à {FOUNDER_PRICE_LABEL} par an, réservé aux {FOUNDER_SEATS} premiers abonnés.</p></article>
      </div>
    </section>

    <section aria-labelledby="questions">
      <h2 id="questions">Questions fréquentes</h2>
      <div className="pub-faq">{faq.slice(0, 5).map(f => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}</div>
      <p className="pub-note"><Link href="/comment-ca-marche">Toutes les questions et le détail du calcul</Link></p>
    </section>

    <div className="pub-cta-box land-final"><p><strong>Ce soir, vous savez déjà quoi cuisiner.</strong></p><Link href={START_PATH} className="pub-cta">Créer mes menus gratuitement</Link><small>Première semaine gratuite, sans compte ni carte bancaire.</small></div>
  </PublicShell>;
}
