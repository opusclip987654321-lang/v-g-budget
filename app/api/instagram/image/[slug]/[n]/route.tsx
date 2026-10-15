import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import sharp from 'sharp';
import { findArticle } from '@/lib/blog';
import { publicDataUri, slidesFor, type Slide } from '@/lib/instagram';
export const dynamic = 'force-dynamic';

// Une image du carrousel Instagram d'un article : /api/instagram/image/<slug>/<n>.jpg (1080 × 1350, JPEG
// comme l'exige Instagram). Publique : Instagram vient la chercher au moment de la publication.
const W = 1080, H = 1350, PAD = 72;
const green = '#174c38', lime = '#d7f369', cream = '#f7f4ee', ink = '#1d2b24', grey = '#5f6b64';

let fonts: Promise<{ name: string; data: Buffer; weight: 400 | 600 | 800; style: 'normal' }[]> | undefined;
const loadFonts = () => fonts ??= Promise.all(([400, 600, 800] as const).map(async weight => ({ name: 'Inter', weight, style: 'normal' as const, data: await readFile(join(process.cwd(), 'public/fonts', `inter-${weight}.otf`)) })));

function Footer({ light, logo }: { light?: boolean; logo: string | null }) {
  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', fontSize: 30 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontWeight: 800, color: light ? '#fff' : green }}>
      {logo && <img src={logo} width={56} height={56} alt="" />}VégéBudget
    </div>
    <div style={{ display: 'flex', color: light ? lime : grey }}>vegebudget.fr</div>
  </div>;
}

function Photo({ src, height }: { src: string | null; height: number }) {
  return src
    ? <img src={src} width={W - 2 * PAD} height={height} alt="" style={{ borderRadius: 32, objectFit: 'cover' }} />
    : <div style={{ display: 'flex', width: W - 2 * PAD, height, borderRadius: 32, background: '#e8f0e9' }} />;
}

const Pill = ({ children }: { children: string }) =>
  <div style={{ display: 'flex', background: lime, color: green, borderRadius: 999, padding: '14px 30px', fontSize: 34, fontWeight: 800 }}>{children}</div>;

async function render(s: Slide, n: number, total: number) {
  const logo = await publicDataUri('/favicon.svg');
  const page = { width: W, height: H, display: 'flex', flexDirection: 'column' as const, justifyContent: 'space-between', padding: PAD, background: cream, color: ink, fontFamily: 'Inter' };
  const counter = <div style={{ display: 'flex', fontSize: 28, color: grey, fontWeight: 600 }}>{`${n}/${total}`}</div>;
  if (s.kind === 'couverture') {
    const photo = await publicDataUri(s.image);
    return <div style={page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><Pill>{s.category}</Pill><div style={{ display: 'flex', fontSize: 32, fontWeight: 600, color: green }}>Glissez →</div></div>
      <Photo src={photo} height={700} />
      <div style={{ display: 'flex', fontSize: s.title.length > 70 ? 60 : 70, fontWeight: 800, lineHeight: 1.08, letterSpacing: -1.5 }}>{s.title}</div>
      <Footer logo={logo} />
    </div>;
  }
  if (s.kind === 'essentiel') return <div style={page}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div style={{ display: 'flex', fontSize: 72, fontWeight: 800, color: green, letterSpacing: -1.5 }}>L’essentiel</div>{counter}</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
      {s.lines.map((l, i) => <div key={i} style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexShrink: 0, width: 56, height: 56, borderRadius: 28, background: lime, color: green, fontSize: 30, fontWeight: 800, alignItems: 'center', justifyContent: 'center' }}>{String(i + 1)}</div>
        <div style={{ display: 'flex', fontSize: 50, lineHeight: 1.25, fontWeight: 600 }}>{l}</div>
      </div>)}
    </div>
    <Footer logo={logo} />
  </div>;
  if (s.kind === 'chiffres') return <div style={page}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div style={{ display: 'flex', fontSize: 72, fontWeight: 800, color: green, letterSpacing: -1.5 }}>En chiffres</div>{counter}</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {s.items.map(([v, l], i) => <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8, background: i === 0 ? green : '#fff', color: i === 0 ? '#fff' : ink, borderRadius: 32, padding: '36px 44px' }}>
        <div style={{ display: 'flex', fontSize: 92, fontWeight: 800, color: i === 0 ? lime : green, letterSpacing: -2 }}>{v}</div>
        <div style={{ display: 'flex', fontSize: 38, fontWeight: 600 }}>{l}</div>
      </div>)}
    </div>
    <Footer logo={logo} />
  </div>;
  if (s.kind === 'recette') {
    const photo = await publicDataUri(s.image);
    return <div style={page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><Pill>{`${s.price} la part`}</Pill>{counter}</div>
      <Photo src={photo} height={580} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', fontSize: s.title.length > 34 ? 52 : 60, fontWeight: 800, lineHeight: 1.08, letterSpacing: -1 }}>{s.title}</div>
        <div style={{ display: 'flex', fontSize: 32, color: grey, fontWeight: 600 }}>{`Prêt en ${s.minutes} min · prix des ingrédients par part`}</div>
        <div style={{ display: 'flex', fontSize: 34, lineHeight: 1.3, marginTop: 8 }}>{s.text.length > 150 ? `${s.text.slice(0, 147).replace(/\s+\S*$/, '')}…` : s.text}</div>
      </div>
      <Footer logo={logo} />
    </div>;
  }
  return <div style={{ ...page, background: green, color: '#fff' }}>
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}><div style={{ display: 'flex', fontSize: 28, color: lime, fontWeight: 600 }}>{`${n}/${total}`}</div></div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <div style={{ display: 'flex', fontSize: 84, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, color: lime }}>Vos dîners de la semaine, dans votre budget.</div>
      <div style={{ display: 'flex', fontSize: 42, lineHeight: 1.3 }}>VégéBudget prépare vos menus sans viande et votre liste de courses, avec le montant estimé.</div>
      <div style={{ display: 'flex', fontSize: 36, lineHeight: 1.3, color: '#cfe0d6' }}>Première semaine gratuite, sans compte ni carte bancaire.</div>
      <div style={{ display: 'flex', alignSelf: 'flex-start', background: lime, color: green, borderRadius: 999, padding: '22px 40px', fontSize: 40, fontWeight: 800 }}>Lien dans la bio</div>
    </div>
    <Footer light logo={logo} />
  </div>;
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string; n: string }> }) {
  const { slug, n } = await params;
  const article = findArticle(slug);
  const index = Number(n.replace(/\.jpg$/, ''));
  const slides = article ? slidesFor(article) : [];
  if (!article || !Number.isInteger(index) || index < 1 || index > slides.length) return new Response('Image introuvable.', { status: 404 });
  const png = await new ImageResponse(await render(slides[index - 1], index, slides.length), { width: W, height: H, fonts: await loadFonts() }).arrayBuffer();
  const jpg = await sharp(Buffer.from(png)).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpg), { headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=3600', 'X-Robots-Tag': 'noindex' } });
}
