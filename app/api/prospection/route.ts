import { z } from 'zod';
import { adminUser, body, json, failure, ApiError } from '@/lib/server';
import { checkSignedValue } from '@/lib/auth';
import { bilanProspection, marquer, refuser } from '@/lib/prospection';
import { createurs } from '@/content/prospection/createurs';
export const dynamic = 'force-dynamic';

// POST (propriétaire seulement, depuis /prospection) : cocher « envoyé », « a répondu » ou tout annuler.
// GET : bilan public en nombres, lu par Claude pour suivre la prospection (et lien « ne plus me contacter », plus bas).
const input = z.object({ compte: z.string().min(1).max(80), action: z.enum(['envoye', 'repondu', 'annuler']) });

export async function POST(request: Request) { try {
  await adminUser();
  const data = input.parse(await body(request));
  try { return json({ ok: true, etat: await marquer(data.compte, data.action) }); } catch (e) { throw new ApiError(404, e instanceof Error ? e.message : 'Créateur inconnu.'); }
} catch (e) { return failure(e); } }

// GET ?a=stop&c=<compte>&s=<signature> : lien « ne plus me contacter » des mails de duo.
export async function GET(request: Request) { try {
  const url = new URL(request.url);
  if (url.searchParams.get('a') === 'stop') {
    const compte = url.searchParams.get('c') ?? '';
    const ok = createurs.some(c => c.compte === compte) && checkSignedValue(`duo-stop:${compte}`, url.searchParams.get('s') ?? '');
    if (ok) await refuser(compte);
    return page(ok ? 'C’est noté' : 'Ce lien n’est pas valable', ok ? 'Nous ne vous contacterons plus. Merci de votre réponse, et bonne continuation.' : 'Il a peut-être été coupé. Vous pouvez aussi répondre au mail pour nous le dire.');
  }
  return json(await bilanProspection());
} catch (e) { return failure(e); } }

function page(title: string, text: string) {
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title} · VégéBudget</title></head><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#f6f8f6;color:#1c3027;font-family:Arial,sans-serif;text-align:center;padding:1.5rem"><div><h1 style="font-family:Georgia,serif;font-weight:400">${title}</h1><p style="color:#64736b">${text}</p></div></body></html>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } });
}
