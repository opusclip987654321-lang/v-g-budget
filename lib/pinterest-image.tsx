import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import sharp from 'sharp';
import { publicDataUri } from '@/lib/instagram';
import { findEpingle, type Epingle } from '@/lib/pinterest';

// Image d'une épingle Pinterest : 1000 × 1500 (format 2:3 conseillé par Pinterest), JPEG.
// Même charte que les carrousels Instagram (lib/instagram-image.tsx). Servie par app/pinterest/image/[id].
const W = 1000, H = 1500, PAD = 64;
const green = '#174c38', lime = '#d7f369', cream = '#f7f4ee', ink = '#1d2b24', grey = '#5f6b64';

let fonts: Promise<{ name: string; data: Buffer; weight: 400 | 600 | 800; style: 'normal' }[]> | undefined;
const loadFonts = () => fonts ??= Promise.all(([400, 600, 800] as const).map(async weight => ({ name: 'Inter', weight, style: 'normal' as const, data: await readFile(join(process.cwd(), 'public/fonts', `inter-${weight}.otf`)) })));

const Pill = ({ children }: { children: string }) =>
  <div style={{ display: 'flex', background: lime, color: green, borderRadius: 999, padding: '14px 30px', fontSize: 36, fontWeight: 800 }}>{children}</div>;

async function render(p: Epingle) {
  const logo = await publicDataUri('/favicon.svg');
  const photo = p.image ? await publicDataUri(p.image) : null;
  const titleSize = p.title.length > 70 ? 64 : p.title.length > 45 ? 76 : 88;
  const footer = (light: boolean) => <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', fontSize: 32 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontWeight: 800, color: light ? '#fff' : green }}>{logo && <div style={{ display: 'flex', background: light ? '#fff' : 'transparent', borderRadius: 16, padding: light ? 6 : 0 }}><img src={logo} width={light ? 46 : 58} height={light ? 46 : 58} alt="" /></div>}VégéBudget</div>
    <div style={{ display: 'flex', color: light ? lime : grey, fontWeight: 600 }}>vegebudget.fr</div>
  </div>;
  if (!photo) return <div style={{ width: W, height: H, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: PAD, background: green, color: '#fff', fontFamily: 'Inter' }}>
    <div style={{ display: 'flex' }}><Pill>{p.pill}</Pill></div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <div style={{ display: 'flex', fontSize: titleSize + 24, fontWeight: 800, lineHeight: 1.04, letterSpacing: -3 }}>{p.title}</div>
      <div style={{ display: 'flex', fontSize: 40, lineHeight: 1.3, color: lime, fontWeight: 600 }}>Menus de la semaine et liste de courses, avec le prix réel de chaque plat.</div>
    </div>
    {footer(true)}
  </div>;
  return <div style={{ width: W, height: H, display: 'flex', flexDirection: 'column', background: cream, color: ink, fontFamily: 'Inter' }}>
    <div style={{ display: 'flex', position: 'relative', width: W, height: 860 }}>
      <img src={photo} width={W} height={860} alt="" style={{ objectFit: 'cover' }} />
      <div style={{ display: 'flex', position: 'absolute', left: PAD, top: PAD }}><Pill>{p.pill}</Pill></div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, padding: `48px ${PAD}px ${PAD}px` }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', fontSize: titleSize, fontWeight: 800, lineHeight: 1.06, letterSpacing: -1.5 }}>{p.title}</div>
        {p.sub && <div style={{ display: 'flex', fontSize: 34, color: grey, fontWeight: 600 }}>{p.sub}</div>}
      </div>
      {footer(false)}
    </div>
  </div>;
}

export async function epingleJpeg(id: string) {
  const p = findEpingle(id);
  if (!p) return null;
  const png = await new ImageResponse(await render(p), { width: W, height: H, fonts: await loadFonts() }).arrayBuffer();
  return sharp(Buffer.from(png)).jpeg({ quality: 86, mozjpeg: true }).toBuffer();
}
