import { createurs, type Createur } from '@/content/prospection/createurs';
import { readSetting, writeSetting } from './server';

// Suivi des « duos » proposés aux créateurs (page /prospection, réservée au propriétaire) : Walid coche « envoyé »
// puis « a répondu » ; le site cherche aussi une adresse mail publique sur le site de chaque créateur (au plus un
// site par appel horaire de POST /api/diffusion). Aucun mail n'est envoyé d'ici.
export type Etat = { envoye?: string; repondu?: string };
export type Statut = 'a-contacter' | 'envoye' | 'repondu';

export const etats = () => readSetting<Record<string, Etat>>('prospection', {});
export const emails = () => readSetting<Record<string, { at: string; emails: string[] }>>('prospection_emails', {});
export const statut = (e?: Etat): Statut => e?.repondu ? 'repondu' : e?.envoye ? 'envoye' : 'a-contacter';

export async function marquer(compte: string, action: 'envoye' | 'repondu' | 'annuler') {
  if (!createurs.some(c => c.compte === compte)) throw new Error('Créateur inconnu.');
  const all = await etats();
  const now = new Date().toISOString();
  const e = all[compte] ?? {};
  all[compte] = action === 'annuler' ? {} : action === 'envoye' ? { ...e, envoye: e.envoye ?? now } : { ...e, envoye: e.envoye ?? now, repondu: e.repondu ?? now };
  await writeSetting('prospection', all);
  return all[compte];
}

// Adresses trouvées dans les liens « mailto: » ou le texte de la page d'accueil et de la page contact.
const IGNORE = /\.(png|jpe?g|gif|webp|svg)$|@(example|sentry|wixpress|domain)\./i;
export function extraireEmails(html: string) {
  const found = [...html.matchAll(/(?:mailto:)?([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/gi)].map(m => m[1].toLowerCase());
  return [...new Set(found.filter(e => !IGNORE.test(e)))].slice(0, 5);
}

async function page(url: string) {
  const res = await fetch(url, { signal: AbortSignal.timeout(15000), redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VegeBudget/1.0; +https://vegebudget.fr)' } });
  return res.ok ? (await res.text()).slice(0, 2_000_000) : '';
}

export async function chercherEmails(origin: string) {
  if (!origin.startsWith('https://')) return { rien: 'Site local : pas de recherche.' };
  const done = await emails();
  const c = createurs.find(x => x.site && !done[x.compte]);
  if (!c) return { rien: 'Aucun site à visiter.' };
  const base = c.site!.replace(/\/$/, '');
  let found: string[] = [];
  for (const path of ['', '/contact', '/contact/', '/a-propos/']) {
    found = extraireEmails(await page(base + path).catch(() => ''));
    if (found.length) break;
  }
  await writeSetting('prospection_emails', { ...done, [c.compte]: { at: new Date().toISOString(), emails: found } });
  return { compte: c.compte, trouvees: found.length };
}

// Bilan public : des nombres seulement (ni noms ni adresses).
export async function bilanProspection() {
  const all = await etats();
  const mails = await emails();
  const s = createurs.map(c => statut(all[c.compte]));
  return {
    createurs: createurs.length,
    envoyes: s.filter(x => x !== 'a-contacter').length,
    reponses: s.filter(x => x === 'repondu').length,
    sitesVisites: Object.keys(mails).length,
    adressesTrouvees: Object.values(mails).filter(m => m.emails.length).length,
  };
}

export type Ligne = Createur & { statut: Statut; etat: Etat; emails: string[]; message: string; lien: string };
