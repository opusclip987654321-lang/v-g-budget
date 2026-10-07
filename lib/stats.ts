import { createHash, timingSafeEqual } from 'node:crypto';
import { db } from '@/lib/server';

// Mesure d'audience sans cookie : chaque événement garde le jour, son nom et une
// empreinte du visiteur (adresse IP + navigateur + jour, hachés avec AUTH_SECRET).
// L'empreinte change chaque jour : on compte des visiteurs par jour sans pouvoir suivre
// quelqu'un d'un jour à l'autre, et aucune adresse IP n'est conservée.
export const EVENTS = ['visite', 'semaine', 'offre_vue', 'clic_payer', 'connexion_demandee'] as const;
export type EventName = typeof EVENTS[number];
const BOTS = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|embedly|monitor|curl|wget|python|node-fetch|axios/i;

export const parisDay = (date = new Date()) => date.toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' });

export function visitorId(request: Request, day = parisDay()) {
  const ip = (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || request.headers.get('x-real-ip') || '';
  return createHash('sha256').update(`${process.env.AUTH_SECRET ?? ''}|${day}|${ip}|${request.headers.get('user-agent') ?? ''}`).digest('hex').slice(0, 24);
}

export const isBot = (request: Request) => BOTS.test(request.headers.get('user-agent') ?? '') || !request.headers.get('user-agent');

// D'où vient la visite : utm_source s'il est donné, sinon le site d'origine (google.com, instagram.com…).
export function source(referrer: unknown, utm: unknown, ownHost: string) {
  if (typeof utm === 'string' && utm.trim()) return utm.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '').slice(0, 40) || null;
  if (typeof referrer !== 'string' || !referrer) return 'direct';
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, '').replace(/^(m|l|lm)\./, '');
    return host === ownHost.replace(/^www\./, '') ? null : host.slice(0, 60);
  } catch { return 'direct'; }
}

export async function recordEvent(request: Request, name: EventName, detail: string | null = null) {
  if (isBot(request)) return false;
  const now = new Date(), day = parisDay(now), visitor = visitorId(request, day);
  // Un même visiteur ne compte qu'une fois par jour pour chaque étape (et chaque détail).
  const seen = await db().prepare('SELECT 1 FROM events WHERE day=? AND name=? AND visitor=? AND IFNULL(detail,\'\')=? LIMIT 1').bind(day, name, visitor, detail ?? '').first();
  if (seen) return false;
  await db().prepare('INSERT INTO events (day,name,visitor,detail,created_at) VALUES (?,?,?,?,?)').bind(day, name, visitor, detail, now.getTime()).run();
  return true;
}

const daysBack = (days: number, until = new Date()) => Array.from({ length: days }, (_, i) => parisDay(new Date(until.getTime() - (days - 1 - i) * 86400000)));

export async function statistics(days = 30, now = new Date()) {
  const list = daysBack(days, now), first = list[0];
  const rows = (await db().prepare('SELECT day,name,COUNT(DISTINCT visitor) AS n FROM events WHERE day>=? GROUP BY day,name').bind(first).all<{ day: string; name: EventName; n: number }>()).results;
  // Dates enregistrées en UTC : ramenées au jour de Paris.
  const since = new Date(new Date(`${first}T00:00:00Z`).getTime() - 86400000).toISOString();
  const byParisDay = (rows: { created_at: string }[]) => rows.map(r => parisDay(new Date(r.created_at)));
  const signups = byParisDay((await db().prepare('SELECT created_at FROM members WHERE created_at>=?').bind(since).all<{ created_at: string }>()).results);
  const reservations = byParisDay((await db().prepare('SELECT created_at FROM waitlist WHERE created_at>=?').bind(since).all<{ created_at: string }>()).results);
  const sources = (await db().prepare("SELECT IFNULL(detail,'direct') AS source,COUNT(DISTINCT day||visitor) AS n FROM events WHERE name='visite' AND day>=? GROUP BY 1 ORDER BY n DESC LIMIT 10").bind(first).all<{ source: string; n: number }>()).results;
  const count = (day: string, name: EventName) => rows.filter(r => r.day === day && r.name === name).reduce((s, r) => s + r.n, 0);
  const jours = list.map(day => ({
    jour: day,
    visiteurs: count(day, 'visite'),
    semaines: count(day, 'semaine'),
    offreVue: count(day, 'offre_vue'),
    connexionsDemandees: count(day, 'connexion_demandee'),
    inscrits: signups.filter(d => d === day).length,
    clicsPayer: count(day, 'clic_payer'),
    reservations: reservations.filter(d => d === day).length,
  }));
  const one = async (sql: string) => (await db().prepare(sql).first<{ n: number }>())?.n ?? 0;
  return {
    maj: now.toISOString(),
    jours,
    sources,
    totaux: {
      membres: await one('SELECT COUNT(*) AS n FROM members'),
      abonnes: await one("SELECT COUNT(*) AS n FROM members WHERE subscription_status IN ('active','trialing')"),
      reservationsFondateur: await one("SELECT COUNT(*) AS n FROM waitlist WHERE plan='founder'"),
      reservationsPremium: await one("SELECT COUNT(*) AS n FROM waitlist WHERE plan<>'founder'"),
    },
  };
}

// Lecture des chiffres par le cerveau : en-tête « Authorization: Bearer STATS_TOKEN » (ou CRON_SECRET).
export function statsAuthorized(request: Request) {
  const secret = process.env.STATS_TOKEN || process.env.CRON_SECRET;
  if (!secret || secret.length < 16) return false;
  const given = Buffer.from(request.headers.get('authorization') ?? ''), expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}
