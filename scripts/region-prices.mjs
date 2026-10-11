// Génère lib/region-prices.ts à partir des relevés de prix par pays (JSON).
// Usage : node scripts/region-prices.mjs BE:releve-be.json CH:releve-ch.json QC:releve-qc.json
// Relevé : {"store":"…","brand":"…","date":"AAAA-MM-JJ","items":{"rice":{"pack":1000,"price":1.49,"unit":"g"},…}}
import { readFileSync, writeFileSync } from 'node:fs';

const catalog = readFileSync(new URL('../lib/catalog.ts', import.meta.url), 'utf8');
const base = Object.fromEntries([...catalog.matchAll(/i\('([a-z-]+)','[^']+','[^']+','([^']+)',([\d.]+),([\d.]+)/g)].map(m => [m[1], { unit: m[2], pack: Number(m[3]), price: Number(m[4]) }]));
// Conserves vendues au volume (Québec : boîtes en ml) : on compte le poids égoutté, environ 60 % du volume.
const DRAINED = ['chickpeas', 'kidney', 'white-beans', 'corn'];

function convert(id, item) {
  const fr = base[id];
  const unit = item.unit ?? fr.unit;
  if (unit === fr.unit) return item.pack;
  if (unit === 'ml' && fr.unit === 'g') return Math.round(item.pack * (DRAINED.includes(id) ? 0.6 : 1));
  if (unit === 'g' && fr.unit === 'ml') return item.pack;
  if (unit === 'pièce' && fr.unit === 'g') return fr.pack; // vendu à la pièce (botte, tête) : même format qu'en France
  return null;
}

const out = {};
for (const arg of process.argv.slice(2)) {
  const [code, file] = arg.split(':');
  const data = JSON.parse(readFileSync(file, 'utf8'));
  const items = {}, ratios = [];
  for (const [id, item] of Object.entries(data.items)) {
    if (!base[id] || item.missing || !(item.price > 0) || !(item.pack > 0)) continue;
    const pack = convert(id, item);
    if (!pack) { console.warn(`${code} ${id} : unité ${item.unit} non convertible, ignoré`); continue; }
    items[id] = { pack, price: Math.round(item.price * 100) / 100 };
    ratios.push((items[id].price / pack) / (base[id].price / base[id].pack));
  }
  ratios.sort((a, b) => a - b);
  const ratio = Math.round(ratios[Math.floor(ratios.length / 2)] * 100) / 100;
  out[code] = { store: data.store, brand: data.brand, date: data.date, ratio, items };
  console.log(`${code} : ${Object.keys(items).length} prix relevés sur ${Object.keys(base).length}, écart médian ×${ratio}`);
}
const header = `// Prix relevés hors de France, générés par scripts/region-prices.mjs à partir des relevés en magasin.
// pack : taille du paquet (g, ml ou pièce, comme dans lib/catalog.ts) ; price : prix du paquet dans la monnaie du pays.
// ratio : écart de prix médian avec la France sur les produits relevés, pour estimer ceux qui manquent.
export type RegionPrices = { store: string; brand: string; date: string; ratio: number; items: Record<string, { pack: number; price: number }> };
export const regionPrices: Record<'BE' | 'CH' | 'QC', RegionPrices> = `;
const key = k => /^[a-z]\w*$/i.test(k) ? k : `'${k}'`;
const body = Object.entries(out).map(([code, r]) => `  ${code}: {\n    store: ${JSON.stringify(r.store)}, brand: ${JSON.stringify(r.brand)}, date: '${r.date}', ratio: ${r.ratio},\n    items: {\n${Object.entries(r.items).map(([id, x]) => `      ${key(id)}: { pack: ${x.pack}, price: ${x.price} },`).join('\n')}\n    },\n  },`).join('\n');
writeFileSync(new URL('../lib/region-prices.ts', import.meta.url), `${header}{\n${body}\n};\n`);
