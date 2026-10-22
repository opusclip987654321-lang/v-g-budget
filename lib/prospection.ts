import { createurs, mailDuo, type Createur } from '@/content/prospection/createurs';
import { signValue } from './auth';
import { sendDuo } from './mail';
import { parisNow } from './instagram';
import { readSetting, writeSetting } from './server';

// Suivi des « duos » proposés aux créateurs (page /prospection, réservée au propriétaire) : Walid coche « envoyé »
// puis « a répondu » ; le site cherche aussi une adresse mail publique sur le site de chaque créateur (au plus un
// site par appel horaire de POST /api/diffusion), puis lui envoie la proposition par mail depuis bonjour@vegebudget.fr
// (accord de Walid du 21/10/2026 : « oui pour les mails »), au plus PROSPECTION_PAR_JOUR (10) par jour, en semaine
// de 9 h à 18 h (heure de Paris), un seul mail par créateur, jamais à un créateur déjà contacté ou qui a refusé.
export type Etat = { envoye?: string; repondu?: string; mail?: string; refus?: string };
export type Statut = 'a-contacter' | 'envoye' | 'repondu' | 'refus';

export const etats = () => readSetting<Record<string, Etat>>('prospection', {});
export const emails = () => readSetting<Record<string, { at: string; emails: string[] }>>('prospection_emails', {});
export const statut = (e?: Etat): Statut => e?.refus ? 'refus' : e?.repondu ? 'repondu' : e?.envoye ? 'envoye' : 'a-contacter';

export async function marquer(compte: string, action: 'envoye' | 'repondu' | 'annuler') {
  if (!createurs.some(c => c.compte === compte)) throw new Error('Créateur inconnu.');
  const all = await etats();
  const now = new Date().toISOString();
  const e = all[compte] ?? {};
  all[compte] = action === 'annuler' ? (e.refus ? { refus: e.refus } : {}) : action === 'envoye' ? { ...e, envoye: e.envoye ?? now } : { ...e, envoye: e.envoye ?? now, repondu: e.repondu ?? now };
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

// Lien « ne plus me contacter » d'un mail de duo.
export const stopLink = (origin: string, compte: string) => `${origin}/api/prospection?a=stop&c=${encodeURIComponent(compte)}&s=${signValue(`duo-stop:${compte}`)}`;

export async function refuser(compte: string) {
  const all = await etats();
  all[compte] = { ...all[compte], refus: all[compte]?.refus ?? new Date().toISOString() };
  await writeSetting('prospection', all);
}

// Une adresse n'est retenue que si elle est sur le domaine du site du créateur, ou une boîte grand public
// (gmail, outlook…) : une adresse d'agence web ou d'hébergeur trouvée en bas de page n'est pas la sienne.
const PUBLIQUES = /@(gmail|googlemail|outlook|hotmail|live|yahoo|icloud|me|orange|free|sfr|laposte|wanadoo|protonmail|proton)\./i;
export function adresseDuSite(site: string | undefined, found: string[]) {
  const host = site ? new URL(site).hostname.replace(/^www\./, '') : '';
  return found.find(e => host && e.endsWith(`@${host}`)) ?? found.find(e => PUBLIQUES.test(e)) ?? null;
}
export const adresseDuCreateur = (c: Createur, found: string[]) => adresseDuSite(c.site, found);

const jourParis = (iso: string) => parisNow(new Date(iso)).date;

export async function envoyerMails(origin: string) {
  if (!origin.startsWith('https://') && !process.env.MAIL_OUTBOX) return { rien: 'Site local : pas d’envoi.' };
  const now = parisNow();
  const day = new Date(`${now.date}T12:00:00Z`).getUTCDay();
  if (!process.env.MAIL_OUTBOX && (day === 0 || day === 6 || now.hour < 9 || now.hour >= 18)) return { rien: 'Hors des heures d’envoi.' };
  const all = await etats();
  const mails = await emails();
  const max = Number(process.env.PROSPECTION_PAR_JOUR ?? 10);
  const dejaAujourdhui = Object.values(all).filter(e => e.mail && jourParis(e.mail) === now.date).length;
  if (dejaAujourdhui >= max) return { rien: 'Quota du jour atteint.' };
  const c = createurs.find(x => statut(all[x.compte]) === 'a-contacter' && !all[x.compte]?.mail && adresseDuCreateur(x, mails[x.compte]?.emails ?? []));
  if (!c) return { rien: 'Aucun créateur à contacter par mail.' };
  await sendDuo(adresseDuCreateur(c, mails[c.compte]!.emails)!, { ...mailDuo(c), stopLink: stopLink(origin, c.compte) });
  const at = new Date().toISOString();
  all[c.compte] = { ...all[c.compte], mail: at, envoye: at };
  await writeSetting('prospection', all);
  return { mail: c.compte };
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
    refus: s.filter(x => x === 'refus').length,
    mails: Object.values(all).filter(e => e.mail).length,
    sitesVisites: Object.keys(mails).length,
    adressesTrouvees: Object.values(mails).filter(m => m.emails.length).length,
  };
}

export type Ligne = Createur & { statut: Statut; etat: Etat; emails: string[]; message: string; lien: string };
