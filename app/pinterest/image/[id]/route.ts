import { epingleJpeg } from '@/lib/pinterest-image';
export const dynamic = 'force-dynamic';

// Image d'une épingle Pinterest : /pinterest/image/<id>.jpg (1000 × 1500). Hors de /api/ pour que le robot de
// Pinterest, qui respecte robots.txt, puisse la lire. Dessin : lib/pinterest-image.tsx.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const jpg = await epingleJpeg(id.replace(/\.jpg$/, ''));
  if (!jpg) return new Response('Image introuvable.', { status: 404 });
  return new Response(new Uint8Array(jpg), { headers: { 'Content-Type': 'image/jpeg', 'Content-Length': String(jpg.length), 'Cache-Control': 'public, max-age=86400', 'X-Robots-Tag': 'noindex' } });
}
