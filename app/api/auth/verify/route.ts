import { db, siteOrigin } from '@/lib/server';
import { APP_LOGIN_URL, createSessionValue, hashToken, sessionCookie, SESSION_DAYS } from '@/lib/auth';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const origin = siteOrigin(request);
  const url = new URL(request.url), token = url.searchParams.get('token') ?? '', appli = url.searchParams.get('appli') === '1';
  const payer = ['premium', 'founder'].includes(url.searchParams.get('payer') ?? '') ? url.searchParams.get('payer') : null;
  const now = Date.now();
  const row = token ? await db().prepare('SELECT email FROM login_tokens WHERE token_hash=? AND used_at IS NULL AND expires_at>?').bind(hashToken(token), now).first<{ email: string }>() : null;
  if (!row) return appli ? appPage(`${APP_LOGIN_URL}?erreur=expiree`, 'Ce lien n’est plus valable', 'Demandez un nouveau lien depuis l’appli.') : Response.redirect(`${origin}/app?connexion=expiree`, 303);
  const used = await db().prepare('UPDATE login_tokens SET used_at=? WHERE token_hash=? AND used_at IS NULL').bind(now, hashToken(token)).run();
  if (used.meta.changes !== 1) return appli ? appPage(`${APP_LOGIN_URL}?erreur=expiree`, 'Ce lien n’est plus valable', 'Demandez un nouveau lien depuis l’appli.') : Response.redirect(`${origin}/app?connexion=expiree`, 303);
  const member = await db().prepare('SELECT id FROM members WHERE email=? ORDER BY created_at LIMIT 1').bind(row.email).first<{ id: string }>();
  const userId = member?.id ?? crypto.randomUUID();
  const session = createSessionValue(userId, row.email, now);
  if (appli) return appPage(`${APP_LOGIN_URL}?session=${encodeURIComponent(session)}`, 'Vous êtes connecté', 'Retournez dans l’appli VégéBudget.');
  return new Response(null, { status: 303, headers: { Location: payer ? `${origin}/app?payer=${payer}#offre` : `${origin}/app#dashboard`, 'Set-Cookie': sessionCookie(session, SESSION_DAYS * 86400), 'Cache-Control': 'no-store' } });
}

// Page de passage pour l'appli : elle rouvre l'appli tout de suite, avec un bouton si le téléphone demande confirmation.
function appPage(target: string, title: string, text: string) {
  const href = target.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title} · VégéBudget</title></head><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#f6f8f6;color:#1c3027;font-family:Arial,sans-serif;text-align:center;padding:1.5rem"><div><h1 style="font-family:Georgia,serif;font-weight:400">${title}</h1><p style="color:#64736b">${text}</p><p><a href="${href}" style="display:inline-block;padding:.8rem 1.3rem;border-radius:.7rem;background:#174c38;color:#fff;font-weight:600;text-decoration:none">Ouvrir l’appli VégéBudget</a></p></div><script>location.href=${JSON.stringify(target)};</script></body></html>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } });
}
