import { db, siteOrigin } from '@/lib/server';
import { createSessionValue, hashToken, sessionCookie, SESSION_DAYS } from '@/lib/auth';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const origin = siteOrigin(request);
  const token = new URL(request.url).searchParams.get('token') ?? '';
  const now = Date.now();
  const row = token ? await db().prepare('SELECT email FROM login_tokens WHERE token_hash=? AND used_at IS NULL AND expires_at>?').bind(hashToken(token), now).first<{ email: string }>() : null;
  if (!row) return Response.redirect(`${origin}/?connexion=expiree`, 303);
  const used = await db().prepare('UPDATE login_tokens SET used_at=? WHERE token_hash=? AND used_at IS NULL').bind(now, hashToken(token)).run();
  if (used.meta.changes !== 1) return Response.redirect(`${origin}/?connexion=expiree`, 303);
  const member = await db().prepare('SELECT id FROM members WHERE email=? ORDER BY created_at LIMIT 1').bind(row.email).first<{ id: string }>();
  const userId = member?.id ?? crypto.randomUUID();
  return new Response(null, { status: 303, headers: { Location: `${origin}/#dashboard`, 'Set-Cookie': sessionCookie(createSessionValue(userId, row.email, now), SESSION_DAYS * 86400), 'Cache-Control': 'no-store' } });
}
