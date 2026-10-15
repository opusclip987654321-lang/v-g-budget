import { z } from 'zod';
import { adminUser, body, json, failure, ApiError, siteOrigin, writeSetting } from '@/lib/server';
import { connect, publish } from '@/lib/instagram';
export const dynamic = 'force-dynamic';

// Réglages Instagram depuis la page /instagram (propriétaire du site seulement) :
// enregistrer le jeton, déconnecter, publier un article tout de suite.
const input = z.discriminatedUnion('action', [
  z.object({ action: z.literal('connecter'), token: z.string().trim().min(20).max(1000) }),
  z.object({ action: z.literal('deconnecter') }),
  z.object({ action: z.literal('publier'), slug: z.string().min(1).max(120) }),
]);

export async function POST(request: Request) { try {
  await adminUser();
  const data = input.parse(await body(request));
  if (data.action === 'deconnecter') { await writeSetting('instagram', null); return json({ ok: true }); }
  try {
    if (data.action === 'connecter') { const c = await connect(data.token); return json({ ok: true, username: c.username }); }
    return json({ ok: true, ...await publish(siteOrigin(request), data.slug) });
  } catch (e) { throw new ApiError(502, e instanceof Error ? e.message : 'Instagram ne répond pas.'); }
} catch (e) { return failure(e); } }
