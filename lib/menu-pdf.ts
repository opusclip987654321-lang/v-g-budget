import { ingredients } from './catalog';
import { money, portionStep, quantity } from './planner';
import { PRICE_SOURCE } from './pricing';
import { menuFoyer, type Foyer } from './menu-foyer';

// Menu de la semaine en PDF à imprimer (page 1 : les 5 dîners et la liste de courses chiffrée ; ensuite : les recettes
// pour le foyer). Offert contre une adresse mail sur les pages menu (components/menu-pdf-form.tsx), servi par
// app/menu-vegetarien-semaine/[foyer]/pdf. PDF écrit à la main (texte seul, polices standard Helvetica) : aucune
// dépendance, et les montants viennent du même calcul que la page, donc ils suivent le catalogue.

const W = 595, H = 842, M = 56, BOTTOM = 70; // A4 en points
type Font = 'R' | 'B';
type Line = { text: string; size: number; font: Font; x?: number; color?: 'green' | 'grey'; right?: string; gap?: number };

// Helvetica en WinAnsiEncoding : les caractères français tiennent sur un octet (€, ’, œ compris).
const WIN: Record<string, number> = { '€': 0x80, '‚': 0x82, '„': 0x84, '…': 0x85, '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94, '•': 0x95, '–': 0x96, '—': 0x97, 'œ': 0x9c, 'Œ': 0x8c };
function encode(s: string) {
  const out: number[] = [];
  for (const ch of s.normalize('NFC')) {
    const c = ch.codePointAt(0)!;
    if (WIN[ch]) out.push(WIN[ch]);
    else if (c === 0x202f || c === 0x2009) out.push(0x20); // espaces fines des montants
    else if (c < 256) out.push(c);
    else out.push(0x3f);
  }
  return out.map(b => b === 0x28 || b === 0x29 || b === 0x5c ? `\\${String.fromCharCode(b)}` : b < 32 || b > 126 ? `\\${b.toString(8).padStart(3, '0')}` : String.fromCharCode(b)).join('');
}

// Largeur approchée (Helvetica ≈ 0,5 em en moyenne) : sert seulement à couper les lignes longues.
function wrap(text: string, size: number, width: number) {
  const max = Math.floor(width / (size * 0.5));
  const lines: string[] = [];
  let cur = '';
  for (const word of text.split(/\s+/)) {
    if (cur && (cur + ' ' + word).length > max) { lines.push(cur); cur = word; } else cur = cur ? `${cur} ${word}` : word;
  }
  if (cur) lines.push(cur);
  return lines;
}

export function menuPdf(f: Foyer, origin: string) {
  const m = menuFoyer(f);
  const site = origin.replace(/^https?:\/\//, '');
  const lines: Line[] = [];
  const add = (text: string, size = 10.5, font: Font = 'R', extra: Partial<Line> = {}) => {
    const x = extra.x ?? M;
    wrap(text, size, W - x - M - (extra.right ? 70 : 0)).forEach((t, n) => lines.push({ text: t, size, font, ...extra, x, right: n === 0 ? extra.right : undefined, gap: n === 0 ? extra.gap : 0 }));
  };
  const PAGE = '\f';

  add('VégéBudget · menu de la semaine 100 % végétal', 9, 'B', { color: 'green' });
  add(`Menu végétarien de la semaine ${f.pour}`, 20, 'B', { gap: 10 });
  add(`5 dîners pour ${money(m.achat)} de courses · ${money(m.parPortion)} la portion`, 12, 'R', { color: 'green', gap: 4 });

  add('Les 5 dîners', 13, 'B', { gap: 18 });
  for (const d of m.diners) add(`${d.jour} : ${d.recipe.title} (${d.recipe.minutes} min)`, 10.5, 'R', { right: money(d.cout), gap: 5 });

  add(`La liste de courses (${f.label})`, 13, 'B', { gap: 18 });
  for (const c of m.courses) add(`[ ]  ${c.nom} · ${c.quantite}`, 10.5, 'R', { right: money(c.prix), gap: 4 });
  add('Total', 11, 'B', { right: money(m.achat), gap: 7 });
  add(`Il vous restera environ ${money(m.reste)} de produits entamés (huile, sel, épices…) pour les semaines suivantes. Si vous avez déjà certains produits, vos courses coûteront moins cher.`, 9, 'R', { color: 'grey', gap: 10 });
  add(`${PRICE_SOURCE}. Les prix peuvent varier selon le magasin.`, 9, 'R', { color: 'grey', gap: 3 });
  add(`Un menu adapté à votre budget, au nombre de personnes et à ce que vous avez déjà : ${site} (première semaine gratuite, sans compte).`, 10.5, 'B', { color: 'green', gap: 16 });

  for (const d of m.diners) {
    lines.push({ text: PAGE, size: 0, font: 'R' });
    const r = d.recipe;
    add(`${d.jour} · ${r.minutes} min · ${money(d.parPortion)} la portion`, 9, 'B', { color: 'green' });
    add(r.title, 17, 'B', { gap: 8 });
    add(r.description, 10.5, 'R', { color: 'grey', gap: 4 });
    add(`Ingrédients ${f.pour}`, 12, 'B', { gap: 14 });
    for (const it of r.ingredients) {
      const ing = ingredients.find(x => x.id === it.id);
      if (ing) add(`•  ${quantity(it.qty * f.people / 2, ing.unit)} · ${ing.name}`, 10.5, 'R', { gap: 3 });
    }
    add('Préparation', 12, 'B', { gap: 14 });
    r.steps.forEach((s, n) => add(`${n + 1}.  ${portionStep(s, f.people)}`, 10.5, 'R', { gap: 5 }));
    if (r.tip) add(`Astuce : ${r.tip}`, 10, 'R', { color: 'grey', gap: 12 });
  }

  // Mise en page : une nouvelle page à chaque saut demandé ou quand la page est pleine.
  const pages: string[] = [];
  let ops: string[] = [], y = H - M;
  const flush = () => { if (ops.length) pages.push(ops.join('\n')); ops = []; y = H - M; };
  const color = (c?: Line['color']) => c === 'green' ? '0.09 0.30 0.22 rg' : c === 'grey' ? '0.38 0.42 0.39 rg' : '0.11 0.17 0.14 rg';
  for (const l of lines) {
    if (l.text === PAGE) { flush(); continue; }
    const step = l.size * 1.3 + (l.gap ?? 0);
    if (y - step < BOTTOM) flush(); else y -= l.gap ?? 0;
    y -= l.size * 1.3;
    ops.push(`BT /F${l.font} ${l.size} Tf ${color(l.color)} ${l.x ?? M} ${y.toFixed(1)} Td (${encode(l.text)}) Tj ET`);
    if (l.right) ops.push(`BT /F${l.font} ${l.size} Tf ${color(l.color)} ${W - M - 62} ${y.toFixed(1)} Td (${encode(l.right)}) Tj ET`);
  }
  flush();
  pages.forEach((p, n) => { pages[n] = `${p}\nBT /FR 8 Tf 0.38 0.42 0.39 rg ${M} 36 Td (${encode(`${site} · page ${n + 1} sur ${pages.length}`)}) Tj ET`; });

  // Objets : 1 catalogue, 2 arbre des pages, 3-4 polices, puis pour chaque page son objet et son contenu.
  const objs: string[] = [];
  const kids = pages.map((_, n) => `${5 + n * 2} 0 R`).join(' ');
  objs.push('<< /Type /Catalog /Pages 2 0 R >>');
  objs.push(`<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>`);
  objs.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  objs.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  pages.forEach((content, n) => {
    objs.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /FR 3 0 R /FB 4 0 R >> >> /Contents ${6 + n * 2} 0 R >>`);
    objs.push(`<< /Length ${Buffer.byteLength(content, 'latin1')} >>\nstream\n${content}\nendstream`);
  });
  let pdf = '%PDF-1.4\n%\xe2\xe3\xcf\xd3\n';
  const offsets: number[] = [];
  objs.forEach((o, n) => { offsets.push(Buffer.byteLength(pdf, 'latin1')); pdf += `${n + 1} 0 obj\n${o}\nendobj\n`; });
  const xref = Buffer.byteLength(pdf, 'latin1');
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map(o => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`;
  pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R /Info << /Title (${encode(`Menu végétarien de la semaine ${f.pour} - VégéBudget`)}) >> >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf, 'latin1');
}
