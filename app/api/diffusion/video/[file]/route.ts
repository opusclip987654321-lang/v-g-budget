import { findPost } from '@/lib/instagram';
import { video } from '@/lib/diffusion';
export const dynamic = 'force-dynamic';

// Vidéo verticale d'un carrousel : /api/diffusion/video/<slug>.mp4 (lib/diffusion.ts). Publique : Instagram et
// Post for Me viennent la chercher au moment de la publication. Fabriquée à la première demande, puis gardée.
export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const slug = file.replace(/\.mp4$/, '');
  if (!file.endsWith('.mp4') || !findPost(slug)) return new Response('Vidéo introuvable.', { status: 404 });
  try {
    const bytes = await video(slug);
    return new Response(new Uint8Array(bytes), { headers: { 'Content-Type': 'video/mp4', 'Content-Length': String(bytes.length), 'Cache-Control': 'public, max-age=86400', 'X-Robots-Tag': 'noindex' } });
  } catch (e) {
    console.error('VegeBudget video', e instanceof Error ? e.message : e);
    return new Response('Vidéo indisponible.', { status: 503 });
  }
}
