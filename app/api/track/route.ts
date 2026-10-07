import { body, json, failure, runtime } from '@/lib/server';
import { EVENTS, recordEvent, source, type EventName } from '@/lib/stats';
export const dynamic = 'force-dynamic';

// Étapes du parcours envoyées par le navigateur (voir lib/track.ts).
export async function POST(request: Request) { try {
  const input = await body(request);
  const name = input.event as EventName;
  if (!EVENTS.includes(name) || name === 'connexion_demandee') return json({ ok: false }, 400);
  const own = new URL(runtime().SITE_ORIGIN ?? request.url).hostname;
  const detail = name === 'visite' ? source(input.referrer, input.utm, own)
    : name === 'clic_payer' && (input.detail === 'premium' || input.detail === 'fondateur') ? input.detail : null;
  // Une navigation interne (referrer = le site lui-même) n'est pas une nouvelle visite.
  if (name === 'visite' && detail === null) return json({ ok: true });
  await recordEvent(request, name, detail);
  return json({ ok: true });
} catch (e) { return failure(e); } }
