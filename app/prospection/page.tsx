import type { Metadata } from 'next';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { isAdmin, memberFor } from '@/lib/server';
import { createurs, lienPerso, messageDuo } from '@/content/prospection/createurs';
import { emails, etats, statut, type Ligne } from '@/lib/prospection';
import { PublicShell } from '@/components/public-shell';
import { ProspectionAdmin } from './prospection-admin';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Prospection', robots: { index: false, follow: false } };

// Page du propriétaire du site : les créateurs à qui proposer un duo, le message prêt à copier, l'avancement.
export default async function ProspectionPage() {
  const user = await getCurrentUser().catch(() => null);
  if (user) await memberFor(user);
  if (!user || !await isAdmin(user.userId)) return <PublicShell minimal>
    <h1>Espace réservé</h1>
    <p className="pub-lead">{user ? `Vous êtes connecté avec ${user.email}, qui n’est pas l’adresse du propriétaire du site.` : 'Connectez-vous d’abord avec l’adresse du propriétaire du site, puis revenez sur cette page.'}</p>
    <p><Link href="/app">{user ? 'Aller à mon espace' : 'Me connecter'}</Link></p>
  </PublicShell>;
  const all = await etats();
  const mails = await emails();
  const lignes: Ligne[] = createurs.map(c => ({ ...c, statut: statut(all[c.compte]), etat: all[c.compte] ?? {}, emails: mails[c.compte]?.emails ?? [], message: messageDuo(c), lien: lienPerso(c) }));
  return <PublicShell minimal>
    <p className="pub-eyebrow">Prospection</p>
    <h1>Duos avec des créateurs</h1>
    <p className="pub-lead">Pour chaque créateur : ouvrez le profil, vérifiez qu’il publie encore sur la cuisine pas chère, copiez le message et envoyez-le en message privé depuis @vegbudget. Cochez ensuite « Envoyé », puis « A répondu » quand il répond. Claude suit l’avancement ici.</p>
    <ProspectionAdmin lignes={lignes} />
  </PublicShell>;
}
