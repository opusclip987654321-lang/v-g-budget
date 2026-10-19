import { indexNowKey } from '@/lib/diffusion';
export const dynamic = 'force-dynamic';

// Clé IndexNow (lib/diffusion.ts) : Bing vérifie ici que les pages signalées viennent bien du propriétaire du site.
export function GET() {
  const key = indexNowKey();
  return key ? new Response(key, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }) : new Response('Introuvable.', { status: 404 });
}
