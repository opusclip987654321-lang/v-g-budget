import type { Metadata } from 'next';
import Link from 'next/link';
import { FOUNDER_PRICE_LABEL, FOUNDER_SEATS, PREMIUM_PRICE_LABEL, PRICE_SOURCE } from '@/lib/pricing';
import { faq, homeExample, ldScript, organizationLd, publicOrigin } from '@/lib/seo';
import { Cta, PublicShell } from '@/components/public-shell';

const title = 'Comment organiser vos menus et vos courses';
const description = 'Découvrez comment préparer vos dîners sans viande, utiliser les ingrédients déjà disponibles et estimer le montant de vos courses.';
export const metadata: Metadata = { title, description, alternates: { canonical: '/comment-ca-marche' }, openGraph: { title, description } };

export default async function HowItWorks() {
  const origin = await publicOrigin();
  const example = homeExample();
  const ld = { '@context': 'https://schema.org', '@graph': [organizationLd(origin), { '@type': 'FAQPage', mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }, { '@type': 'HowTo', name: 'Préparer ses dîners de la semaine avec VégéBudget', step: steps.map(([name, text], n) => ({ '@type': 'HowToStep', position: n + 1, name, text })) }] };
  return <PublicShell>
    <script type="application/ld+json" dangerouslySetInnerHTML={ldScript(ld)} />
    <p className="pub-eyebrow">Comment ça marche</p>
    <h1>Vos repas du soir organisés selon votre budget</h1>
    <p className="pub-lead">Indiquez pour combien de personnes vous cuisinez, les soirs à prévoir et votre budget. VégéBudget vous propose des menus sans viande et la liste des produits à acheter, en tenant compte de ce que vous avez déjà.</p>
    <section><h2>Trois étapes pour préparer votre semaine</h2><ol className="pub-steps">{steps.map(([name, text]) => <li key={name}><strong>{name}.</strong> {text}</li>)}</ol></section>
    <section><h2>Une première semaine gratuite, puis une formule au choix</h2>
      <ul className="pub-ingredients"><li><span>Première semaine</span><span>Gratuite, sans compte ni carte bancaire</span></li><li><span>Premium</span><span>{PREMIUM_PRICE_LABEL} par mois, résiliable depuis Mon compte</span></li><li><span>Offre de lancement ({FOUNDER_SEATS} premiers abonnés)</span><span>{FOUNDER_PRICE_LABEL} par an, tarif conservé tant que l’abonnement n’est pas interrompu</span></li></ul>
      <p className="pub-note">Un exemple concret : {example.dinners} dîners pour 2 personnes, pour environ {Math.round(example.purchase)} € de courses. Ce montant compte les produits à acheter en entier : une partie reste pour d’autres repas. {PRICE_SOURCE}. Les prix peuvent varier selon le magasin.</p></section>
    <section><h2>Questions fréquentes</h2><div className="pub-faq">{faq.map(f => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}</div></section>
    <Cta lead="Préparez vos premiers menus." />
    <p className="pub-note"><Link href="/recettes">Voir les recettes et leur coût par portion</Link></p>
  </PublicShell>;
}
const steps: [string, string][] = [
  ['Dites-nous pour combien vous cuisinez', 'Le nombre de personnes, les soirs à prévoir, votre temps de cuisine et votre budget.'],
  ['Utilisez ce que vous avez déjà', 'Cochez les ingrédients que vous avez à la maison : la liste de courses en tient compte pour éviter les achats inutiles.'],
  ['Retrouvez vos menus et vos courses', 'Vos dîners, les produits à acheter et le montant estimé des courses, avant de partir au magasin.'],
];
