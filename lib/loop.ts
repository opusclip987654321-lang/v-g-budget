import { db } from '@/lib/server';
import { isBot, parisDay, visitorId } from '@/lib/stats';
import { loop } from '@/content/loop/loop';

// Avis des visiteurs pour la loop (content/loop/CONSIGNES.md) : la réponse à une question courte,
// sans cookie. Un visiteur répond une fois par jour à chaque question (même empreinte que la mesure d'audience).
export const questionsAt = (moment: 'menus' | 'offre') => loop.questions.filter(q => q.moment === moment);

// La loop relit les textes libres : on retire adresses e-mail et numéros de téléphone.
export const scrub = (text: string) => text
  .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, '[e-mail]')
  .replace(/(?:\+|00)?\d[\d .-]{7,}\d/g, '[numéro]')
  .replace(/\s+/g, ' ').trim().slice(0, 500);

export async function recordFeedback(request: Request, input: Record<string, unknown>, member: boolean) {
  const question = loop.questions.find(q => q.id === input.question);
  if (!question) return false;
  const choice = typeof input.choix === 'string' && question.choix.includes(input.choix) ? input.choix : null;
  const text = question.texteLibre && typeof input.texte === 'string' ? scrub(input.texte) : '';
  if (!choice && !text) return false;
  if (isBot(request)) return true;
  const now = new Date(), day = parisDay(now);
  await db().prepare('INSERT OR IGNORE INTO avis (day,visitor,question,choix,texte,membre,version,created_at) VALUES (?,?,?,?,?,?,?,?)')
    .bind(day, visitorId(request, day), question.id, choice, text || null, member ? 1 : 0, loop.version, now.getTime()).run();
  return true;
}

export async function feedback(days = 90, now = new Date()) {
  const first = parisDay(new Date(now.getTime() - (days - 1) * 86400000));
  const rows = (await db().prepare('SELECT day,question,choix,texte,membre,version FROM avis WHERE day>=? ORDER BY id DESC LIMIT 500').bind(first)
    .all<{ day: string; question: string; choix: string | null; texte: string | null; membre: number; version: number }>()).results;
  return rows.map(r => ({ jour: r.day, question: r.question, choix: r.choix, texte: r.texte, membre: r.membre === 1, version: r.version }));
}

// Ce que le cerveau montre de la loop : version en cours, essai, questions et journal.
export const loopInfo = () => ({
  version: loop.version, depuis: loop.depuis, essai: loop.essai,
  questions: loop.questions.map(({ id, moment, question, choix }) => ({ id, moment, question, choix })),
  journal: loop.journal.slice(-12),
});
