import { db, json, failure } from '@/lib/server';
import { avancer, DUREE_JOURS, file, findEpingle, FLUX_PATH, heureSortie, PAR_JOUR, pinterestVerification } from '@/lib/pinterest';
export const dynamic = 'force-dynamic';

// Bilan public de l'essai Pinterest (rien de personnel) : lu par la loop (Loop Agent) pour juger l'objectif de
// 50 visites venues de Pinterest en 4 semaines. Les visites comptent utm_source=pinterest et les liens venus de pinterest.*.
export async function GET() { try {
  const e = await avancer();
  const since = new Date(Date.now() - 60 * 86400000).toISOString().slice(0, 10);
  const visites = (await db().prepare("SELECT day, COUNT(DISTINCT visitor) AS n FROM events WHERE name='visite' AND (detail LIKE '%pinterest%' OR detail='pin.it') AND day>=? GROUP BY day ORDER BY day").bind(since).all<{ day: string; n: number }>()).results;
  const fin = e.debut ? heureSortie(e.debut, PAR_JOUR * DUREE_JOURS - 1).toISOString() : null;
  return json({
    flux: FLUX_PATH,
    siteRevendique: !!pinterestVerification(),
    debut: e.debut, fin, parJour: PAR_JOUR,
    passagesPinterest: e.passages, dernierPassage: e.dernierPassage,
    sorties: e.sorties.length,
    dernieres: e.sorties.slice(-6).reverse().map(s => ({ id: s.id, titre: findEpingle(s.id)?.title ?? s.id, sortie: s.at })),
    prochaines: file(new Set(e.sorties.map(s => s.id)), 6).map(p => ({ id: p.id, titre: p.title })),
    visitesPinterest: { total: visites.reduce((t, v) => t + v.n, 0), parJour: visites },
  });
} catch (e) { return failure(e); } }
