import { timingSafeEqual } from 'node:crypto';
import { db, catalog, json, failure, ApiError, runtime, type Member } from '@/lib/server';
import { signValue } from '@/lib/auth';
import { sendWeeklyReminder } from '@/lib/mail';
import { recipes as baseRecipes } from '@/lib/catalog';
import { addDay, monday, money, shopping, weeklyBudget, type UserState } from '@/lib/planner';
export const dynamic = 'force-dynamic';

// Rappel hebdomadaire, déclenché par une tâche planifiée du serveur (voir DEPLOIEMENT-OVH.md) :
// POST /api/reminders avec l'en-tête « Authorization: Bearer CRON_SECRET ».
function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 16) throw new ApiError(503, 'CRON_SECRET n’est pas configuré.');
  const given = Buffer.from(request.headers.get('authorization') ?? '');
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function POST(request: Request) { try {
  if (!authorized(request)) throw new ApiError(401, 'Accès refusé.');
  const origin = (runtime().SITE_ORIGIN ?? new URL(request.url).origin).replace(/\/$/, '');
  const week = addDay(monday(), 7);
  const weekLabel = new Date(`${week}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  const data = await catalog();
  const allRecipes = [...data.recipes, ...baseRecipes.filter(r => !data.recipes.some(x => x.id === r.id))];
  const members = (await db().prepare('SELECT * FROM members WHERE reminders=1 AND (reminder_week IS NULL OR reminder_week<>?)').bind(week).all<Member>()).results;
  let sent = 0, skipped = 0, failed = 0;
  for (const member of members) {
    try {
      const state = JSON.parse(member.state) as UserState;
      if (state.plans.some(p => p.weekStart === week)) { skipped++; continue; }
      const recap: string[] = [];
      const last = state.plans.filter(p => p.weekStart < week).sort((a, b) => a.weekStart.localeCompare(b.weekStart)).at(-1);
      if (last && last.weekStart >= addDay(week, -14)) {
        const cooked = last.entries.filter(e => e.cooked).length;
        const items = shopping(last.entries, state.pantry, state.prices, allRecipes, data.ingredients, state.packSizes);
        const forecast = weeklyBudget(state, last, items).forecast;
        recap.push(`${cooked} ${cooked > 1 ? 'dîners cuisinés' : 'dîner cuisiné'} sur ${last.entries.length}`);
        recap.push(`environ ${money(forecast)} de courses`);
        const usual = state.profile.usualSpend;
        if (usual && usual - forecast > 0) recap.push(`soit environ ${money(usual - forecast)} d’économie par rapport à d’habitude`);
      }
      await sendWeeklyReminder(member.email, {
        link: `${origin}/#menus`,
        stopLink: `${origin}/api/reminders/stop?u=${encodeURIComponent(member.id)}&s=${signValue(`reminders:${member.id}`)}`,
        weekLabel, recap,
      });
      await db().prepare('UPDATE members SET reminder_week=? WHERE id=?').bind(week, member.id).run();
      sent++;
    } catch (error) {
      failed++;
      console.error('Weekly reminder failed', member.id, error);
    }
  }
  return json({ week, sent, skipped, failed });
} catch (e) { return failure(e); } }
