import { json } from '@/lib/server';
import { statistics, statsAuthorized } from '@/lib/stats';
import { journeys } from '@/lib/journeys';
export const dynamic = 'force-dynamic';

// Chiffres du parcours pour le cerveau central (cerveau.nourmeet.com).
export async function GET(request: Request) {
  if (!statsAuthorized(request)) return json({ error: 'Accès refusé.' }, 401);
  const days = Math.min(Math.max(Number(new URL(request.url).searchParams.get('jours')) || 30, 1), 180);
  // Parcours détaillés : 7 jours par défaut (?parcours=1 à 30).
  const journeyDays = Math.min(Math.max(Number(new URL(request.url).searchParams.get('parcours')) || 7, 1), 30);
  return json({ ...await statistics(days), parcours: await journeys(journeyDays) });
}
