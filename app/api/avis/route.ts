import { body, json, failure, isAdmin } from '@/lib/server';
import { getCurrentUser } from '@/lib/auth';
import { recordFeedback } from '@/lib/loop';
export const dynamic = 'force-dynamic';

// Réponse d'un visiteur à une question courte de la loop (voir lib/loop.ts).
export async function POST(request: Request) { try {
  const input = await body(request);
  const user = await getCurrentUser().catch(() => null);
  // Les réponses du propriétaire du site ne faussent pas les avis.
  if (user && await isAdmin(user.userId)) return json({ ok: true });
  const ok = await recordFeedback(request, input, !!user);
  return json({ ok }, ok ? 200 : 400);
} catch (e) { return failure(e); } }
