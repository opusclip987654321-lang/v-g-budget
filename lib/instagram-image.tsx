import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import sharp from 'sharp';
import { findPost, publicDataUri, type Slide } from '@/lib/instagram';

// Dessin des images d'un carrousel Instagram (« infos végé » ou article du blog), 1080 × 1350 en JPEG comme l'exige
// Instagram. Servies par app/api/instagram/image/[slug]/[n] ; reprises par les vidéos de lib/diffusion.ts.
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

function Photo({ src, height, zoom }: { src: string | null; height: number; zoom?: { transform?: string } }) {
  if (src && zoom?.transform) return <div style={{ display: 'flex', width: W - 2 * PAD, height, borderRadius: 32, overflow: 'hidden' }}>
    <img src={src} width={W - 2 * PAD} height={height} alt="" style={{ objectFit: 'cover', ...zoom }} />
  </div>;
  return src
    ? <img src={src} width={W - 2 * PAD} height={height} alt="" style={{ borderRadius: 32, objectFit: 'cover' }} />
    : <div style={{ display: 'flex', width: W - 2 * PAD, height, borderRadius: 32, background: '#e8f0e9' }} />;
}

const Pill = ({ children, style }: { children: string; style?: object }) =>
  <div style={{ ...style, display: 'flex', background: lime, color: green, borderRadius: 999, padding: '14px 30px', fontSize: 34, fontWeight: 800 }}>{children}</div>;

// Animation des vidéos (« motion design » fabriqué par le site, Walid 21/10/2026) : p va de 0 à 1 pendant l'apparition
// d'une image ; à 1 (images du carrousel), aucun style n'est ajouté.
const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
function motion(p: number) {
  const still = p >= 1;
  return {
    // L'élément k sur K arrive à son tour, en montant et en apparaissant.
    in(k: number, K: number) {
      if (still) return {};
      const e = ease((p - (k / Math.max(1, K)) * 0.65) / 0.35);
      return { opacity: e, transform: `translateY(${Math.round((1 - e) * 60)}px)` };
    },
    // Un élément qui « saute » à sa taille en fin d'apparition (prix, total).
    pop(k: number, K: number) {
      if (still) return {};
      const x = Math.min(1, Math.max(0, (p - (k / Math.max(1, K)) * 0.65) / 0.35));
      return { opacity: Math.min(1, x * 3), transform: `scale(${(0.6 + 0.4 * ease(x) + Math.sin(x * Math.PI) * 0.12).toFixed(3)})` };
    },
    // Le premier nombre du texte compte de 0 à sa valeur (« 18,54 € », « 2,13 € la part »).
    count(text: string) {
      if (still) return text;
      return text.replace(/\d+(?:,\d+)?/, m => {
        const decimals = m.split(',')[1]?.length ?? 0;
        return (Number(m.replace(',', '.')) * ease(p * 1.15)).toFixed(decimals).replace('.', ',');
      });
    },
    // Léger zoom lent sur les photos.
    zoom: still ? {} : { transform: `scale(${(1.12 - 0.12 * ease(p)).toFixed(3)})` },
  };
}

async function render(s: Slide, n: number, total: number, p = 1, video = false) {
  const m = motion(p);
  const logo = await publicDataUri('/favicon.svg');
  const page = { width: W, height: H, display: 'flex', flexDirection: 'column' as const, justifyContent: 'space-between', padding: PAD, background: cream, color: ink, fontFamily: 'Inter' };
  const counter = <div style={{ display: 'flex', fontSize: 28, color: grey, fontWeight: 600 }}>{`${n}/${total}`}</div>;
  if (s.kind === 'couverture' && !s.image) return <div style={{ ...page, background: green, color: '#fff' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><Pill style={m.pop(1, 2)}>{s.pill}</Pill><div style={{ display: 'flex', fontSize: 32, fontWeight: 600, color: lime }}>{video ? '' : 'Glissez →'}</div></div>
    <div style={{ ...m.in(0, 2), display: 'flex', fontSize: s.title.length > 45 ? 96 : 110, fontWeight: 800, lineHeight: 1.04, letterSpacing: -3 }}>{s.title}</div>
    <Footer light logo={logo} />
  </div>;
  if (s.kind === 'couverture') {
    const photo = await publicDataUri(s.image!);
    return <div style={page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><Pill style={m.pop(1, 2)}>{s.pill}</Pill><div style={{ display: 'flex', fontSize: 32, fontWeight: 600, color: green }}>{video ? '' : 'Glissez →'}</div></div>
      <Photo src={photo} height={700} zoom={m.zoom} />
      <div style={{ ...m.in(0, 2), display: 'flex', fontSize: s.title.length > 70 ? 60 : 70, fontWeight: 800, lineHeight: 1.08, letterSpacing: -1.5 }}>{s.title}</div>
      <Footer logo={logo} />
    </div>;
  }
  if (s.kind === 'essentiel') return <div style={page}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div style={{ display: 'flex', fontSize: 72, fontWeight: 800, color: green, letterSpacing: -1.5 }}>L’essentiel</div>{counter}</div>
    {s.items.length > 0 && <div style={{ display: 'flex', gap: 20 }}>
      {s.items.map(([v, l], i) => <div key={i} style={{ ...m.in(i, s.items.length + s.lines.length), display: 'flex', flexDirection: 'column', flex: 1, gap: 8, background: i === 0 ? green : '#fff', color: i === 0 ? '#fff' : ink, borderRadius: 28, padding: '28px 26px' }}>
        <div style={{ display: 'flex', fontSize: 58, fontWeight: 800, color: i === 0 ? lime : green, letterSpacing: -1.5 }}>{v}</div>
        <div style={{ display: 'flex', fontSize: 26, lineHeight: 1.25, fontWeight: 600 }}>{l}</div>
      </div>)}
    </div>}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      {s.lines.map((l, i) => <div key={i} style={{ ...m.in(s.items.length + i, s.items.length + s.lines.length), display: 'flex', gap: 26, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexShrink: 0, width: 52, height: 52, borderRadius: 26, background: lime, color: green, fontSize: 28, fontWeight: 800, alignItems: 'center', justifyContent: 'center' }}>{String(i + 1)}</div>
        <div style={{ display: 'flex', fontSize: 44, lineHeight: 1.25, fontWeight: 600 }}>{l}</div>
      </div>)}
    </div>
    <Footer logo={logo} />
  </div>;
  if (s.kind === 'info') return <div style={page}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 30 }}>
      <div style={{ display: 'flex', fontSize: s.title.length > 30 ? 76 : 88, fontWeight: 800, color: green, lineHeight: 1.08, letterSpacing: -1.5 }}>{s.title}</div>{counter}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
      {s.chiffre && <div style={{ ...m.in(0, 2), display: 'flex', flexDirection: 'column', gap: 12, background: green, color: '#fff', borderRadius: 36, padding: '44px 48px' }}>
        <div style={{ display: 'flex', fontSize: 170, fontWeight: 800, color: lime, letterSpacing: -4, lineHeight: 1 }}>{m.count(s.chiffre[0])}</div>
        <div style={{ display: 'flex', fontSize: 46, lineHeight: 1.25, fontWeight: 600 }}>{s.chiffre[1]}</div>
      </div>}
      {s.text && <div style={{ ...m.in(s.chiffre ? 1 : 0, s.points ? 1 + s.points.length : 2), display: 'flex', fontSize: s.chiffre ? 42 : (s.points ? 50 : 58), lineHeight: 1.3, fontWeight: s.chiffre ? 400 : 600, color: s.chiffre ? grey : ink }}>{s.text}</div>}
      {s.points && <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        {s.points.map((l, i) => <div key={i} style={{ ...m.in(1 + i, 1 + s.points!.length), display: 'flex', gap: 26, alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexShrink: 0, width: 64, height: 64, borderRadius: 32, background: lime, color: green, fontSize: 34, fontWeight: 800, alignItems: 'center', justifyContent: 'center' }}>{String(i + 1)}</div>
          <div style={{ display: 'flex', fontSize: 52, lineHeight: 1.22, fontWeight: 600 }}>{l}</div>
        </div>)}
      </div>}
    </div>
    <Footer logo={logo} />
  </div>;
  if (s.kind === 'recette') {
    const photo = await publicDataUri(s.image);
    const half = Math.ceil(s.ingredients.length / 2);
    const column = (list: [string, string][]) => <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 10 }}>
      {list.map(([name, amount], i) => <div key={name} style={{ ...m.in(1 + i, 1 + half), display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 28, borderBottom: '2px solid #e6e1d6', paddingBottom: 8 }}><span>{name}</span><span style={{ color: green, fontWeight: 800 }}>{amount}</span></div>)}
    </div>;
    return <div style={page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><Pill style={m.pop(1, 2)}>{`${m.count(s.price)} la part`}</Pill>{counter}</div>
      <Photo src={photo} height={470} zoom={m.zoom} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', fontSize: s.title.length > 34 ? 50 : 58, fontWeight: 800, lineHeight: 1.08, letterSpacing: -1 }}>{s.title}</div>
        <div style={{ display: 'flex', fontSize: 30, color: grey, fontWeight: 600 }}>{`${s.minutes} min · ingrédients pour 2`}</div>
      </div>
      <div style={{ display: 'flex', gap: 36 }}>{column(s.ingredients.slice(0, half))}{column(s.ingredients.slice(half))}</div>
      {s.text && <div style={{ display: 'flex', fontSize: 30, lineHeight: 1.3, color: grey }}>{s.text.length > 110 ? `${s.text.slice(0, 107).replace(/\s+\S*$/, '')}…` : s.text}</div>}
      <Footer logo={logo} />
    </div>;
  }
  // Ticket de caisse : papier blanc, lignes en pointillés, total en gras (format très repris par les comptes budget).
  if (s.kind === 'ticket') return <div style={page}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 30 }}>
      <div style={{ display: 'flex', fontSize: s.title.length > 30 ? 66 : 78, fontWeight: 800, color: green, lineHeight: 1.08, letterSpacing: -1.5 }}>{s.title}</div>{counter}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 12, padding: '40px 48px', gap: s.lines.length > 9 ? 10 : 16, boxShadow: '0 12px 40px rgba(0,0,0,.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'center', fontSize: 28, fontWeight: 800, letterSpacing: 6, color: grey }}>TICKET DE CAISSE</div>
      {s.lines.map(([name, price], i) => <div key={i} style={{ ...m.in(i, s.lines.length + 1), display: 'flex', justifyContent: 'space-between', fontSize: s.lines.length > 9 ? 30 : 36, borderBottom: '2px dashed #ddd6c8', paddingBottom: 8 }}><span>{name}</span><span style={{ fontWeight: 600 }}>{price}</span></div>)}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 52, fontWeight: 800, color: green, paddingTop: 8 }}><span>TOTAL</span><span style={{ display: 'flex', ...m.pop(s.lines.length, s.lines.length + 1) }}>{m.count(s.total)}</span></div>
    </div>
    <Footer logo={logo} />
  </div>;
  if (s.kind === 'quiz') return <div style={{ ...page, background: lime, color: green }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div style={{ display: 'flex', fontSize: 34, fontWeight: 800 }}>Votre réponse en commentaire</div>{counter}</div>
    <div style={{ display: 'flex', fontSize: s.title.length > 40 ? 80 : 96, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>{s.title}</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {s.choix.map((c, i) => <div key={i} style={{ ...m.in(1 + i, 1 + s.choix.length), display: 'flex', alignItems: 'center', gap: 28, background: '#fff', borderRadius: 28, padding: '28px 36px', fontSize: 48, fontWeight: 700 }}>
        <div style={{ display: 'flex', width: 72, height: 72, borderRadius: 36, background: green, color: lime, alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 800 }}>{'ABCD'[i]}</div>{c}
      </div>)}
    </div>
    <Footer logo={logo} />
  </div>;
  if (s.kind === 'grand') return <div style={{ ...page, background: green, color: '#fff' }}>
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}><div style={{ display: 'flex', fontSize: 28, color: lime, fontWeight: 600 }}>{`${n}/${total}`}</div></div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
      <div style={{ ...m.in(0, 2), display: 'flex', fontSize: s.title.length > 60 ? 88 : 108, fontWeight: 800, lineHeight: 1.04, letterSpacing: -3 }}>{s.title}</div>
      {s.text && <div style={{ ...m.in(1, 2), display: 'flex', fontSize: 46, lineHeight: 1.3, color: lime, fontWeight: 600 }}>{s.text}</div>}
    </div>
    <Footer light logo={logo} />
  </div>;
  if (s.kind === 'semaine') {
    const photos = await Promise.all(s.days.map(d => publicDataUri(d.image)));
    return <div style={page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 30 }}>
        <div style={{ display: 'flex', fontSize: s.title.length > 30 ? 62 : 74, fontWeight: 800, color: green, lineHeight: 1.08, letterSpacing: -1.5 }}>{s.title}</div>{counter}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {s.days.map((d, i) => <div key={i} style={{ ...m.in(i, s.days.length + 1), display: 'flex', alignItems: 'center', gap: 26, background: '#fff', borderRadius: 24, padding: 14 }}>
          {photos[i] ? <img src={photos[i]!} width={130} height={130} alt="" style={{ borderRadius: 18, objectFit: 'cover' }} /> : <div style={{ display: 'flex', width: 130, height: 130 }} />}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 6 }}>
            <div style={{ display: 'flex', fontSize: 26, fontWeight: 800, color: grey, letterSpacing: 2 }}>{['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE'][i]}</div>
            <div style={{ display: 'flex', fontSize: d.title.length > 34 ? 32 : 36, fontWeight: 700, lineHeight: 1.15 }}>{d.title}</div>
          </div>
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 800, color: green, paddingRight: 14 }}>{d.price}</div>
        </div>)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: green, color: '#fff', borderRadius: 28, padding: '26px 36px' }}>
        <div style={{ display: 'flex', fontSize: 36, fontWeight: 600 }}>Courses pour 2</div><div style={{ ...m.pop(s.days.length, s.days.length + 1), display: 'flex', fontSize: 60, fontWeight: 800, color: lime }}>{m.count(s.total)}</div>
      </div>
      <Footer logo={logo} />
    </div>;
  }
  if (s.kind === 'classement') return <div style={page}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 30 }}>
      <div style={{ display: 'flex', fontSize: s.title.length > 30 ? 66 : 78, fontWeight: 800, color: green, lineHeight: 1.08, letterSpacing: -1.5 }}>{s.title}</div>{counter}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {s.rows.map(([name, price], i) => <div key={i} style={{ ...m.in(s.rows.length - 1 - i, s.rows.length), display: 'flex', alignItems: 'center', gap: 26, background: i === 0 ? green : '#fff', color: i === 0 ? '#fff' : ink, borderRadius: 24, padding: '24px 30px' }}>
        <div style={{ display: 'flex', fontSize: 48, fontWeight: 800, color: i === 0 ? lime : green, width: 60 }}>{String(i + 1)}</div>
        <div style={{ display: 'flex', flex: 1, fontSize: 40, fontWeight: 700 }}>{name}</div>
        <div style={{ display: 'flex', fontSize: 36, fontWeight: 800, color: i === 0 ? lime : green }}>{price}</div>
      </div>)}
    </div>
    {s.note ? <div style={{ display: 'flex', fontSize: 30, lineHeight: 1.3, color: grey }}>{s.note}</div> : <div style={{ display: 'flex' }} />}
    <Footer logo={logo} />
  </div>;
  if (s.kind !== 'fin') return null as never;
  return <div style={{ ...page, background: green, color: '#fff' }}>
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}><div style={{ display: 'flex', fontSize: 28, color: lime, fontWeight: 600 }}>{`${n}/${total}`}</div></div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <div style={{ ...m.in(0, 3), display: 'flex', fontSize: 84, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, color: lime }}>Vos dîners de la semaine, dans votre budget.</div>
      <div style={{ ...m.in(1, 3), display: 'flex', fontSize: 42, lineHeight: 1.3 }}>Vos menus sans viande, la liste de courses et son coût estimé, préparés par VégéBudget.</div>
      <div style={{ ...m.pop(2, 3), display: 'flex', alignSelf: 'flex-start', background: lime, color: green, borderRadius: 999, padding: '22px 40px', fontSize: 40, fontWeight: 800 }}>Lien dans la bio · 1re semaine gratuite</div>
      <div style={{ display: 'flex', fontSize: 36, lineHeight: 1.3, color: '#cfe0d6' }}>{s.sources ? 'Enregistrez-le pour plus tard. Envoyez-le à quelqu’un que ça peut aider.' : 'Enregistrez pour le jour des courses. Envoyez-le à la personne avec qui vous faites les courses.'}</div>
      {s.sources && <div style={{ display: 'flex', fontSize: 24, lineHeight: 1.35, color: '#a9c4b5' }}>{s.sources}</div>}
    </div>
    <Footer light logo={logo} />
  </div>;
}

// Une image de la vidéo : l'image n du carrousel arrivée à p (0 à 1), entrant par la droite au début. JPEG 1080 × 1350.
export async function slideFrame(slug: string, index: number, p: number) {
  const slides = findPost(slug)?.slides ?? [];
  if (!Number.isInteger(index) || index < 1 || index > slides.length) return null;
  const x = index === 1 ? 0 : Math.round((1 - ease(p / 0.25)) * W);
  const page = <div style={{ display: 'flex', width: W, height: H, background: green }}>
    <div style={{ display: 'flex', transform: `translateX(${x}px)` }}>{await render(slides[index - 1], index, slides.length, Math.min(1, p / 0.85), true)}</div>
  </div>;
  const png = await new ImageResponse(page, { width: W, height: H, fonts: await loadFonts() }).arrayBuffer();
  return sharp(Buffer.from(png)).jpeg({ quality: 85 }).toBuffer();
}

// Bandeau du haut de la vidéo (sur le vert au-dessus de l'image) : le titre du carrousel, comme l'accroche des Reels.
export async function videoBand(slug: string, width: number, height: number) {
  const first = findPost(slug)?.slides[0];
  const title = first && 'title' in first ? first.title : 'VégéBudget';
  const page = <div style={{ display: 'flex', width, height, alignItems: 'center', justifyContent: 'center', padding: '0 36px', background: green }}>
    <div style={{ display: 'flex', textAlign: 'center', justifyContent: 'center', fontFamily: 'Inter', fontWeight: 800, color: '#fff', lineHeight: 1.12, letterSpacing: -0.5, fontSize: title.length > 60 ? 34 : title.length > 40 ? 40 : 46 }}>{title}</div>
  </div>;
  return Buffer.from(await new ImageResponse(page, { width, height, fonts: await loadFonts() }).arrayBuffer());
}

// Une image du carrousel en JPEG (null si le carrousel ou l'image n'existe pas).
export async function slideJpeg(slug: string, index: number) {
  const slides = findPost(slug)?.slides ?? [];
  if (!Number.isInteger(index) || index < 1 || index > slides.length) return null;
  const png = await new ImageResponse(await render(slides[index - 1], index, slides.length), { width: W, height: H, fonts: await loadFonts() }).arrayBuffer();
  return sharp(Buffer.from(png)).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
}
