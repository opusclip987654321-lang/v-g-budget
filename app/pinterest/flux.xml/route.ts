import { failure, siteOrigin } from '@/lib/server';
import { avancer, estPinterest, file, findEpingle, flux, PAR_JOUR } from '@/lib/pinterest';
export const dynamic = 'force-dynamic';

// Flux RSS lu chaque jour par Pinterest (« Publication automatique ») : chaque nouvel élément devient une épingle.
// Le premier passage du robot de Pinterest démarre le calendrier (3 épingles par jour). Voir lib/pinterest.ts.
export async function GET(request: Request) { try {
  const origin = siteOrigin(request);
  const e = await avancer(new Date(), estPinterest(request));
  const items = e.debut
    ? e.sorties.slice(-50).reverse().flatMap(s => { const p = findEpingle(s.id); return p ? [{ p, at: s.at }] : []; })
    : file(new Set(), PAR_JOUR).map(p => ({ p, at: new Date().toISOString() }));
  return new Response(flux(origin, items), { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'no-store' } });
} catch (e) { return failure(e); } }
