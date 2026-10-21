import { db } from '@/lib/server';
import { signValue } from '@/lib/auth';
import { sendFreeMenu } from '@/lib/mail';
import { addDay, blankState, generatePlan, monday, money, shopping, totals } from '@/lib/planner';
import { findRecipe, portionCost, recipePath } from '@/lib/seo';
import { FOUNDER_PRICE_LABEL } from '@/lib/pricing';
import { parisNow } from '@/lib/instagram';

const parisWeekday = (date = new Date()) => new Date(`${parisNow(date).date}T12:00:00Z`).getUTCDay();

// Menu gratuit de la semaine par e-mail : le visiteur laisse son adresse (accueil, articles du blog), confirme
// par un lien, reçoit tout de suite le menu de la semaine, puis un nouveau chaque vendredi (FREE_MENU_JOUR, 5 = vendredi)
// à partir de 9 h, heure de Paris. Le même menu pour tous : 5 dîners pour 2, tiré de la semaine (seed fixe).
export type Abonne = { email: string; source: string | null; created_at: string; confirmed_at: string | null; stopped_at: string | null; last_week: string | null };

export const menuLink = (origin: string, action: 'confirmer' | 'stop', email: string) =>
  `${origin}/api/menu-gratuit?a=${action}&e=${encodeURIComponent(email)}&s=${signValue(`menu-${action}:${email}`)}`;

// Semaine visée : celle qui commence lundi prochain (le vendredi, on prépare les courses du week-end).
export function weekFor(date = new Date()) {
  const day = parisWeekday(date);
  return day >= 5 || day === 0 ? addDay(monday(date), 7) : monday(date);
}

export function weekMenu(week: string) {
  const seed = Number(week.replaceAll('-', ''));
  const plan = generatePlan(blankState(), week, seed).plan;
  const dinners = (plan?.entries ?? []).map(e => findRecipe(e.recipeId)).filter(r => !!r).map(r => ({ title: r.title, path: recipePath(r), minutes: r.minutes, portion: money(portionCost(r)) }));
  return { week, dinners, total: money(totals(shopping(plan?.entries ?? [], [])).purchase) };
}

export async function sendMenu(origin: string, a: Abonne, week: string) {
  const menu = weekMenu(week);
  const weekLabel = new Date(`${week}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  await sendFreeMenu(a.email, { ...menu, weekLabel, origin, appLink: `${origin}/app?commencer=1&utm_source=menu-gratuit`, stopLink: menuLink(origin, 'stop', a.email), founder: FOUNDER_PRICE_LABEL });
  await db().prepare('UPDATE menu_abonnes SET last_week=? WHERE email=?').bind(week, a.email).run();
}

// Appelé chaque heure par POST /api/diffusion : le vendredi dès 9 h, le menu de la semaine suivante à chaque abonné confirmé.
export async function menuDuVendredi(origin: string) {
  if (parisWeekday() !== Number(process.env.FREE_MENU_JOUR ?? 5) || parisNow().hour < 9) return { rien: 'Pas le jour ni l’heure.' };
  const week = addDay(monday(), 7);
  const list = (await db().prepare('SELECT * FROM menu_abonnes WHERE confirmed_at IS NOT NULL AND stopped_at IS NULL AND (last_week IS NULL OR last_week<>?)').bind(week).all<Abonne>()).results;
  let envoyes = 0, erreurs = 0;
  for (const a of list) {
    try { await sendMenu(origin, a, week); envoyes++; } catch (e) { erreurs++; console.error('Menu gratuit non envoyé', e); }
  }
  return { week, envoyes, erreurs };
}

// Bilan public, sans aucune adresse : lu par la revue du lundi.
export async function bilanMenu() {
  const row = await db().prepare('SELECT COUNT(*) AS demandes, SUM(confirmed_at IS NOT NULL AND stopped_at IS NULL) AS abonnes, SUM(stopped_at IS NOT NULL) AS desinscrits FROM menu_abonnes').first<{ demandes: number; abonnes: number | null; desinscrits: number | null }>();
  const sources = (await db().prepare("SELECT IFNULL(source,'inconnue') AS source, COUNT(*) AS n FROM menu_abonnes WHERE confirmed_at IS NOT NULL GROUP BY 1 ORDER BY n DESC LIMIT 10").all<{ source: string; n: number }>()).results;
  return { demandes: row?.demandes ?? 0, abonnes: row?.abonnes ?? 0, desinscrits: row?.desinscrits ?? 0, sources };
}
