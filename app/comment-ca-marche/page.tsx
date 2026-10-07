import type { Metadata } from 'next';
import Link from 'next/link';
import { FOUNDER_PRICE_LABEL, FOUNDER_SEATS, PREMIUM_PRICE_LABEL, PRICE_SOURCE } from '@/lib/pricing';
import { faq, ldScript, organizationLd, publicOrigin } from '@/lib/seo';
import { Cta, PublicShell } from '@/components/public-shell';

const title = 'Comment faire ses menus de la semaine avec un petit budget';
const description = 'VégéBudget compose vos dîners sans viande selon votre budget, déduit votre placard et donne la liste de courses exacte. Fonctionnement, prix et questions fréquentes.';
export const metadata: Metadata = { title, description, alternates: { canonical: '/comment-ca-marche' }, openGraph: { title, description } };

export default async function HowItWorks() {
  const origin = await publicOrigin();
  const ld = { '@context': 'https://schema.org', '@graph': [organizationLd(origin), { '@type': 'FAQPage', mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }, { '@type': 'HowTo', name: 'Composer ses dîners de la semaine avec VégéBudget', totalTime: 'PT3M', step: steps.map(([name, text], n) => ({ '@type': 'HowToStep', position: n + 1, name, text })) }] };
  return <PublicShell>
    <script type="application/ld+json" dangerouslySetInnerHTML={ldScript(ld)} />
    <p className="pub-eyebrow">Comment ça marche</p>
    <h1>Vos menus de la semaine, avec un petit budget</h1>
    <p className="pub-lead">VégéBudget part de votre budget, pas d’une liste d’idées. En trois minutes, vous avez vos dîners sans viande de la semaine, la liste de courses exacte et le total avant de partir au magasin.</p>
    <section><h2>En trois étapes</h2><ol className="pub-steps">{steps.map(([name, text]) => <li key={name}><strong>{name}.</strong> {text}</li>)}</ol></section>
    <section><h2>Combien ça coûte</h2>
      <ul className="pub-ingredients"><li><span>Première semaine</span><span>Gratuite, sans compte ni carte bancaire</span></li><li><span>Premium</span><span>{PREMIUM_PRICE_LABEL} par mois, sans engagement</span></li><li><span>Offre fondateur ({FOUNDER_SEATS} premiers membres)</span><span>{FOUNDER_PRICE_LABEL} par an</span></li></ul>
      <p className="pub-note">L’exemple de semaine (5 dîners pour 2) revient à environ 21 € de courses. {PRICE_SOURCE}.</p></section>
    <section><h2>Questions fréquentes</h2><div className="pub-faq">{faq.map(f => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}</div></section>
    <Cta lead="Prêt à essayer ?" />
    <p className="pub-note"><Link href="/recettes">Voir les recettes et leur coût par portion</Link></p>
  </PublicShell>;
}
const steps: [string, string][] = [
  ['Votre budget et votre foyer', 'Indiquez le nombre de personnes, les jours, le temps de cuisine et le budget de la semaine.'],
  ['Ce que vous avez déjà', 'Riz, pâtes, épices : votre placard est déduit des achats, rien n’est acheté en double.'],
  ['La liste exacte', 'Des paquets entiers comme en magasin, le total avant de partir et le suivi de ce que vous dépensez vraiment.'],
];
