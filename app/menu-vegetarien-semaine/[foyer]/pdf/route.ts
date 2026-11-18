import { findFoyer } from '@/lib/menu-foyer';
import { menuPdf } from '@/lib/menu-pdf';
import { siteOrigin } from '@/lib/server';
export const dynamic = 'force-dynamic';

// Le menu de la semaine en PDF à imprimer (lib/menu-pdf.ts), ouvert après avoir laissé son adresse
// (components/menu-pdf-form.tsx). Hors des moteurs de recherche : on veut la visite sur la page du menu.
export async function GET(request: Request, { params }: { params: Promise<{ foyer: string }> }) {
  const f = findFoyer((await params).foyer);
  if (!f) return new Response('Menu introuvable', { status: 404 });
  const pdf = menuPdf(f, siteOrigin(request));
  return new Response(new Uint8Array(pdf), { headers: {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `inline; filename="menu-vegetarien-semaine-${f.slug}-vegebudget.pdf"`,
    'Cache-Control': 'public, max-age=3600',
    'X-Robots-Tag': 'noindex',
  } });
}
