import type { Metadata } from 'next';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { isAdmin, memberFor } from '@/lib/server';
import { bilanAffiliation, prospects } from '@/lib/affiliation';
import { PublicShell } from '@/components/public-shell';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Affiliation', robots: { index: false, follow: false } };

// Page du propriétaire du site : les sites de cuisine repérés pour le futur programme d'affiliation, avec leur contact
// publié. Rien n'est envoyé d'ici : les mails partiront au lancement de l'appli mobile (Walid, 22/10/2026).
export default async function AffiliationPage() {
  const user = await getCurrentUser().catch(() => null);
  if (user) await memberFor(user);
  if (!user || !await isAdmin(user.userId)) return <PublicShell minimal>
    <h1>Espace réservé</h1>
    <p className="pub-lead">{user ? `Vous êtes connecté avec ${user.email}, qui n’est pas l’adresse du propriétaire du site.` : 'Connectez-vous d’abord avec l’adresse du propriétaire du site, puis revenez sur cette page.'}</p>
    <p><Link href="/app">{user ? 'Aller à mon espace' : 'Me connecter'}</Link></p>
  </PublicShell>;
  const b = await bilanAffiliation();
  const list = (await prospects()).filter(p => p.ok === 1).sort((x, y) => (y.verifie_le ?? '').localeCompare(x.verifie_le ?? ''));
  const cell = { padding: '.45rem .6rem', borderBottom: '1px solid #e3e8e4', textAlign: 'left' as const, verticalAlign: 'top' as const };
  return <PublicShell minimal>
    <p className="pub-eyebrow">Affiliation</p>
    <h1>Sites à contacter</h1>
    <p className="pub-lead">{b.retenus} sites de cuisine vérifiés ({b.avecMail} avec une adresse mail publiée, {b.avecPageContact} avec une page contact), {b.aVisiter} en attente de visite, {b.ecartes} écartés. Aucun mail ne part avant le lancement de l’appli mobile.</p>
    <p><a href="/api/affiliation?format=csv">Télécharger la liste complète (CSV)</a>{list.length > 1000 ? ' · les 1 000 derniers sites vérifiés ci-dessous' : ''}</p>
    <div style={{ overflowX: 'auto' }}><table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '.9rem' }}>
      <thead><tr><th style={cell}>Site</th><th style={cell}>Thème</th><th style={cell}>Contact</th><th style={cell}>Vérifié le</th></tr></thead>
      <tbody>{list.slice(0, 1000).map(p => <tr key={p.site}>
        <td style={cell}><a href={p.site} target="_blank" rel="noopener noreferrer">{p.nom || p.titre || p.site}</a></td>
        <td style={cell}>{p.theme}</td>
        <td style={cell}>{p.email ? <a href={`mailto:${p.email}`}>{p.email}</a> : p.contact ? <a href={p.contact} target="_blank" rel="noopener noreferrer">page contact</a> : '—'}</td>
        <td style={cell}>{p.verifie_le?.slice(0, 10)}</td>
      </tr>)}</tbody>
    </table></div>
  </PublicShell>;
}
