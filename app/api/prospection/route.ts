import { z } from 'zod';
import { adminUser, body, json, failure, ApiError } from '@/lib/server';
import { bilanProspection, marquer } from '@/lib/prospection';
export const dynamic = 'force-dynamic';

// POST (propriétaire seulement, depuis /prospection) : cocher « envoyé », « a répondu » ou tout annuler.
// GET : bilan public en nombres, lu par Claude pour suivre la prospection.
const input = z.object({ compte: z.string().min(1).max(80), action: z.enum(['envoye', 'repondu', 'annuler']) });

export async function POST(request: Request) { try {
  await adminUser();
  const data = input.parse(await body(request));
  try { return json({ ok: true, etat: await marquer(data.compte, data.action) }); } catch (e) { throw new ApiError(404, e instanceof Error ? e.message : 'Créateur inconnu.'); }
} catch (e) { return failure(e); } }

export async function GET() { try { return json(await bilanProspection()); } catch (e) { return failure(e); } }
