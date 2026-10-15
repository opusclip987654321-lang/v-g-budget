import Link from 'next/link';
import { Brain, CalendarDays, Check, ChefHat, PiggyBank, Recycle, ShoppingBasket, Timer, Wallet, X } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { recipes } from '@/lib/catalog';
import { money } from '@/lib/planner';
import { FOUNDER_PRICE_LABEL, FOUNDER_SEATS, PREMIUM_PRICE_LABEL, PRICE_SOURCE } from '@/lib/pricing';
import { faq, homeExample, homeLd, ldScript, portionCost, publicOrigin, recipeImage } from '@/lib/seo';
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
        <p className="land-eyebrow">Vos dîners, vos courses, votre budget.</p>
        <h1>Mangez sans viande. Gardez le plaisir, maîtrisez le budget.</h1>
        <p className="land-lead">Qu’est-ce qu’on mange ce soir ? VégéBudget vous propose des dîners sans viande, faciles et adaptés à votre budget, avec la liste de courses qui va avec.</p>
        <Link href={START_PATH} className="pub-cta land-cta">Créer mes menus gratuitement</Link>
        <p className="land-reassure">Première semaine gratuite, sans compte ni carte bancaire.</p>
      </div>
      <img src="/images/couscous.jpg" alt="Couscous aux légumes et aux pois chiches" width={560} height={560} />
    </section>

    <ul className="land-proof" aria-label="En bref">
      <li><strong>{recipes.length} recettes</strong> 100 % végétales</li>
      <li><strong>Prix réels</strong> relevés chez Carrefour</li>
      <li><strong>Sans compte</strong> pour la première semaine</li>
    </ul>

    <section className="land-example" aria-labelledby="exemple">
      <div className="land-example-head">
        <p className="land-eyebrow">Un exemple concret</p>
        <h2 id="exemple">{example.dinners} dîners pour 2 personnes, environ {Math.round(example.purchase)} € de courses</h2>
        <p>Ce montant inclut les paquets entiers : une partie servira pour d’autres repas.</p>
      </div>
      <ol className="land-week">{week.map((r, n) => <li key={r.id}><Link href={START_PATH}><img src={recipeImage(r)} alt="" width={120} height={120} loading="lazy" /><span><small>{['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'][n]}</small><strong>{r.title}</strong><small>{r.minutes} min · {money(portionCost(r))} par portion</small></span></Link></li>)}</ol>
      <p className="pub-note">{PRICE_SOURCE}. Les prix peuvent varier selon le magasin. Le prix par portion correspond aux ingrédients utilisés.</p>
    </section>

    <section className="land-before-after" aria-labelledby="avant-apres">
      <h2 id="avant-apres">Avant : on improvise. Avec VégéBudget : tout est prévu.</h2>
      <p className="land-sub">Vous décidez une fois par semaine, en quelques minutes. Ensuite, vous n’avez plus qu’à cuisiner.</p>
      <div className="land-compare">
        <div className="land-old"><strong>Sans plan</strong><ul>{['Chaque soir, la même question : on mange quoi ?', 'Des courses au hasard, et des produits qui finissent à la poubelle.', 'Le total découvert à la caisse.'].map(t => <li key={t}><X aria-hidden />{t}</li>)}</ul><p className="land-ticket"><small>À la caisse</small><b>? €</b></p></div>
        <div className="land-new"><strong>Avec VégéBudget</strong><ul>{['Vos dîners de la semaine choisis d’avance.', 'Une liste de courses qui tient compte de ce que vous avez déjà.', 'Le montant estimé connu avant d’aller au magasin.'].map(t => <li key={t}><Check aria-hidden />{t}</li>)}</ul><p className="land-ticket"><small>Avant d’aller au magasin</small><b>≈ {Math.round(example.purchase)} €</b></p></div>
      </div>
    </section>

    <section aria-labelledby="pourquoi">
      <h2 id="pourquoi">Ce que ça change chaque semaine</h2>
      <ul className="land-benefits">
        <li><Brain aria-hidden /><strong>Moins de charge mentale</strong><p>Le menu de la semaine est décidé. Le soir, vous suivez la recette.</p></li>
        <li><Timer aria-hidden /><strong>Des repas rapides</strong><p>Des recettes simples, prêtes en {Math.min(...recipes.map(r => r.minutes))} à {Math.max(...recipes.map(r => r.minutes))} minutes.</p></li>
        <li><Wallet aria-hidden /><strong>Un budget maîtrisé</strong><p>Les menus respectent le budget que vous fixez, et vous suivez vos dépenses.</p></li>
        <li><Recycle aria-hidden /><strong>Moins de gaspillage</strong><p>La liste tient compte de ce que vous avez déjà, pour ne rien racheter en double.</p></li>
      </ul>
    </section>

    <section aria-labelledby="etapes">
      <h2 id="etapes">Comment ça marche</h2>
      <ol className="land-steps">
        <li><div className="land-shot"><img src="/images/apercu/reglages.jpg" alt="Écran de l’appli : choix des soirs et du temps de préparation" width={620} height={731} loading="lazy" /></div><span>1</span><strong>Vos réglages</strong><p>Le nombre de personnes, les soirs à prévoir, votre temps et votre budget.</p></li>
        <li><div className="land-shot"><img src="/images/apercu/placard.jpg" alt="Écran de l’appli : ingrédients déjà à la maison cochés" width={620} height={731} loading="lazy" /></div><span>2</span><strong>Votre placard</strong><p>Cochez ce que vous avez déjà à la maison.</p></li>
        <li><div className="land-shot"><img src="/images/apercu/menus.jpg" alt="Écran de l’appli : un dîner de la semaine avec son prix par portion" width={620} height={731} loading="lazy" /></div><span>3</span><strong>Vos menus</strong><p>VégéBudget propose vos dîners. Changez ceux qui ne vous plaisent pas.</p></li>
        <li><div className="land-shot"><img src="/images/apercu/courses.jpg" alt="Écran de l’appli : liste de courses par rayon avec les prix" width={620} height={731} loading="lazy" /></div><span>4</span><strong>Vos courses</strong><p>Partez au magasin avec la liste et le montant estimé.</p></li>
      </ol>
    </section>

    <section aria-labelledby="contenu">
      <h2 id="contenu">Tout ce que vous recevez</h2>
      <div className="land-get-wrap">
      <figure className="land-phone"><img src="/images/apercu/budget.jpg" alt="Écran de l’appli : total des courses prévu, comparé au budget" width={620} height={731} loading="lazy" /><figcaption>Votre budget, suivi semaine après semaine</figcaption></figure>
      <ul className="land-get">
        <li><CalendarDays aria-hidden /><strong>Les menus du soir</strong><p>De 1 à 7 dîners par semaine, pour 1 à 8 personnes.</p></li>
        <li><ShoppingBasket aria-hidden /><strong>La liste de courses</strong><p>Regroupée par type de produit, avec les quantités à acheter.</p></li>
        <li><ChefHat aria-hidden /><strong>{recipes.length} recettes pas à pas</strong><p>Ingrédients, étapes et coût par portion pour chacune.</p><span className="land-thumbs">{recipes.slice(0, 5).map(r => <img key={r.id} src={recipeImage(r)} alt="" width={40} height={40} loading="lazy" />)}</span></li>
        <li><PiggyBank aria-hidden /><strong>Le suivi du budget</strong><p>Le total prévu, vos achats et ce qu’il reste à dépenser.</p></li>
      </ul>
      </div>
    </section>

    <section aria-labelledby="formules">
      <h2 id="formules">Essayez gratuitement, continuez si ça vous plaît</h2>
      <div className="land-plans">
        <article><p className="land-eyebrow">Découverte</p><p className="land-price">Gratuit</p><p>Votre première semaine de menus et sa liste de courses, sans compte ni carte bancaire.</p><Link href={START_PATH} className="pub-cta">Créer mes menus gratuitement</Link></article>
        <article className="land-premium"><p className="land-eyebrow">Premium</p><p className="land-price">{PREMIUM_PRICE_LABEL} <small>par mois</small></p><p>De nouveaux menus et leur liste de courses chaque semaine, vos menus préférés réutilisables et le suivi de vos dépenses.</p><p>Sans engagement, résiliable depuis Mon compte.</p></article>
        <article><p className="land-eyebrow">Offre de lancement</p><p className="land-price">{FOUNDER_PRICE_LABEL} <small>par an</small></p><p>Tout Premium pour l’année, soit moins de 2 € par mois. Réservé aux {FOUNDER_SEATS} premiers abonnés.</p></article>
      </div>
    </section>

    <section aria-labelledby="questions">
      <h2 id="questions">Questions fréquentes</h2>
      <div className="pub-faq">{faq.slice(0, 5).map(f => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}</div>
    </section>

    <div className="pub-cta-box land-final"><p><strong>Ce soir, vous savez déjà quoi cuisiner.</strong></p><Link href={START_PATH} className="pub-cta">Créer mes menus gratuitement</Link><small>Première semaine gratuite, sans compte ni carte bancaire.</small></div>
  </PublicShell>;
}
