import { slideJpeg } from '@/lib/instagram-image';
export const dynamic = 'force-dynamic';

// Une image d'un carrousel Instagram (« infos végé » ou article du blog) : /api/instagram/image/<slug>/<n>.jpg (1080 × 1350, JPEG
// comme l'exige Instagram). Publique : Instagram vient la chercher au moment de la publication. Dessin : lib/instagram-image.tsx.
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string; n: string }> }) {
  const { slug, n } = await params;
  const jpg = await slideJpeg(slug, Number(n.replace(/\.jpg$/, '')));
  if (!jpg) return new Response('Image introuvable.', { status: 404 });
  return new Response(new Uint8Array(jpg), { headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=3600', 'X-Robots-Tag': 'noindex' } });
}
