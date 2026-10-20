import { body, db, failure, json, ApiError, siteOrigin } from '@/lib/server';
import { hashToken, LOGIN_TOKEN_MINUTES, newLoginToken, normalizeEmail } from '@/lib/auth';
import { sendLoginEmail } from '@/lib/mail';
import { recordEvent } from '@/lib/stats';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) { try {
  const input = await body(request);
  const email = normalizeEmail(input.email);
  if (!email) throw new ApiError(400, 'Indiquez une adresse e-mail valide.');
  const now = Date.now();
  const recent = await db().prepare('SELECT COUNT(*) AS n FROM login_tokens WHERE email=? AND created_at>?').bind(email, now - 3600000).first<{ n: number }>();
  if ((recent?.n ?? 0) >= 5) throw new ApiError(429, 'Trop de demandes pour cette adresse. Réessayez dans une heure.');
  await db().prepare('DELETE FROM login_tokens WHERE expires_at<?').bind(now - 86400000).run();
  const token = newLoginToken();
  await db().prepare('INSERT INTO login_tokens (token_hash,email,expires_at,created_at) VALUES (?,?,?,?)').bind(hashToken(token), email, now + LOGIN_TOKEN_MINUTES * 60000, now).run();
  // « appli » : la demande vient de l'appli pour les stores, le lien la rouvrira au lieu du site.
  // « payer » : le visiteur a cliqué sur une offre avant de se connecter, le lien le ramène au paiement de cette offre.
  const payer = input.appli !== true && (input.payer === 'premium' || input.payer === 'founder') ? `&payer=${input.payer}` : '';
  await sendLoginEmail(email, `${siteOrigin(request)}/api/auth/verify?token=${encodeURIComponent(token)}${input.appli === true ? '&appli=1' : ''}${payer}`);
  await recordEvent(request, 'connexion_demandee').catch(() => {});
  return json({ ok: true });
} catch (e) { return failure(e); } }
