import { db } from '@/lib/server';
import { checkSignedValue } from '@/lib/auth';
export const dynamic = 'force-dynamic';

// Lien « Ne plus recevoir ce rappel » des e-mails hebdomadaires. L'ouverture du lien
// affiche un bouton de confirmation (les messageries ouvrent parfois les liens toutes seules).
const page = (body: string, status = 200) => new Response(`<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>VégéBudget</title><body style="font-family:system-ui,sans-serif;max-width:32rem;margin:4rem auto;padding:0 1rem;color:#1c2b22;line-height:1.6"><h1 style="font-family:Georgia,serif;font-weight:500">VégéBudget</h1>${body}<p><a href="/" style="color:#174c38">Revenir au site</a></p></body></html>`, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
const valid = (id: string, signature: string) => !!id && !!signature && checkSignedValue(`reminders:${id}`, signature);
const attr = (value: string) => value.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('u') ?? '', signature = url.searchParams.get('s') ?? '';
  if (!valid(id, signature)) return page('<p>Ce lien n’est pas valide.</p>', 400);
  return page(`<p>Vous ne voulez plus recevoir le rappel hebdomadaire de vos dîners ?</p><form method="post"><input type="hidden" name="u" value="${attr(id)}"><input type="hidden" name="s" value="${attr(signature)}"><button style="background:#174c38;color:#fff;border:0;padding:12px 20px;border-radius:8px;font-weight:600;cursor:pointer">Ne plus recevoir ce rappel</button></form>`);
}

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const id = String(form?.get('u') ?? ''), signature = String(form?.get('s') ?? '');
  if (!valid(id, signature)) return page('<p>Ce lien n’est pas valide.</p>', 400);
  await db().prepare('UPDATE members SET reminders=0 WHERE id=?').bind(id).run();
  return page('<p>C’est noté : vous ne recevrez plus le rappel hebdomadaire. Vous pouvez le réactiver depuis votre compte.</p>');
}
