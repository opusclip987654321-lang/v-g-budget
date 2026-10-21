import { body, db, failure, json, ApiError, siteOrigin } from '@/lib/server';
import { checkSignedValue, normalizeEmail } from '@/lib/auth';
import { sendMenuConfirm } from '@/lib/mail';
import { bilanMenu, menuLink, sendMenu, weekFor, type Abonne } from '@/lib/menu-gratuit';
export const dynamic = 'force-dynamic';

// Menu gratuit de la semaine par e-mail (lib/menu-gratuit.ts).
// POST { email, source } : envoie le lien de confirmation. GET ?a=confirmer|stop&e=&s= : lien reçu par e-mail.
// GET sans paramètre : bilan public sans adresse (demandes, abonnés, sources).
export async function POST(request: Request) { try {
  const input = await body(request);
  const email = normalizeEmail(input.email);
  if (!email) throw new ApiError(400, 'Indiquez une adresse e-mail valide.');
  const source = typeof input.source === 'string' ? input.source.toLowerCase().replace(/[^a-z0-9/._-]/g, '').slice(0, 80) || null : null;
  const known = await db().prepare('SELECT * FROM menu_abonnes WHERE email=?').bind(email).first<Abonne>();
  if (known?.confirmed_at && !known.stopped_at) return json({ ok: true });
  // Au plus un e-mail de confirmation par adresse et par heure.
  if (known && Date.now() - Date.parse(known.created_at) < 3600000) return json({ ok: true });
  const now = new Date().toISOString();
  await db().prepare('INSERT INTO menu_abonnes (email,source,created_at) VALUES (?,?,?) ON CONFLICT(email) DO UPDATE SET created_at=excluded.created_at, source=IFNULL(menu_abonnes.source, excluded.source)').bind(email, source, now).run();
  await sendMenuConfirm(email, menuLink(siteOrigin(request), 'confirmer', email));
  return json({ ok: true });
} catch (e) { return failure(e); } }

export async function GET(request: Request) { try {
  const url = new URL(request.url), action = url.searchParams.get('a'), email = normalizeEmail(url.searchParams.get('e')), signature = url.searchParams.get('s') ?? '';
  if (!action) return json(await bilanMenu());
  if ((action !== 'confirmer' && action !== 'stop') || !email || !checkSignedValue(`menu-${action}:${email}`, signature)) return page('Ce lien n’est pas valable', 'Il a peut-être été coupé. Copiez l’adresse complète depuis l’e-mail.');
  const origin = siteOrigin(request);
  const a = await db().prepare('SELECT * FROM menu_abonnes WHERE email=?').bind(email).first<Abonne>();
  if (action === 'stop') {
    if (a) await db().prepare('UPDATE menu_abonnes SET stopped_at=? WHERE email=?').bind(new Date().toISOString(), email).run();
    return page('C’est noté', 'Vous ne recevrez plus le menu de la semaine.', origin);
  }
  if (!a) return page('Ce lien n’est plus valable', 'Laissez à nouveau votre adresse sur vegebudget.fr.', origin);
  const first = !a.confirmed_at || !!a.stopped_at;
  await db().prepare('UPDATE menu_abonnes SET confirmed_at=IFNULL(confirmed_at,?), stopped_at=NULL WHERE email=?').bind(new Date().toISOString(), email).run();
  const week = weekFor();
  if (first && a.last_week !== week) await sendMenu(origin, { ...a, stopped_at: null }, week).catch(e => console.error('Menu gratuit non envoyé', e));
  return page('C’est confirmé', 'Votre menu de la semaine vient de partir dans votre boîte mail. Le prochain arrive vendredi.', origin);
} catch (e) { return failure(e); } }

function page(title: string, text: string, origin?: string) {
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title} · VégéBudget</title></head><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#f6f8f6;color:#1c3027;font-family:Arial,sans-serif;text-align:center;padding:1.5rem"><div><h1 style="font-family:Georgia,serif;font-weight:400">${title}</h1><p style="color:#64736b">${text}</p>${origin ? `<p><a href="${origin}/app?commencer=1&amp;utm_source=menu-gratuit" style="display:inline-block;padding:.8rem 1.3rem;border-radius:.7rem;background:#174c38;color:#fff;font-weight:600;text-decoration:none">Créer mes menus et ma liste de courses</a></p>` : ''}</div></body></html>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } });
}
