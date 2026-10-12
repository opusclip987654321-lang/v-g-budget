import type { Ingredient } from './catalog';
import { regionPrices } from './region-prices';

// Pays servis par VégéBudget. Chaque pays a sa monnaie, son magasin de référence et ses prix relevés
// (lib/region-prices.ts) ; la France garde les prix du catalogue (lib/catalog.ts).
export type RegionCode = 'FR' | 'BE' | 'CH' | 'QC';
export type Region = {
  code: RegionCode; name: string; short: string; path: string; locale: string; currency: string; symbol: string;
  premium: { cents: number; label: string }; founder: { cents: number; label: string };
};
export const REGIONS: Record<RegionCode, Region> = {
  FR: { code: 'FR', name: 'France', short: 'fr', path: '/', locale: 'fr-FR', currency: 'EUR', symbol: '€', premium: { cents: 499, label: '4,99 €' }, founder: { cents: 1900, label: '19 €' } },
  BE: { code: 'BE', name: 'Belgique', short: 'be', path: '/belgique', locale: 'fr-BE', currency: 'EUR', symbol: '€', premium: { cents: 499, label: '4,99 €' }, founder: { cents: 1900, label: '19 €' } },
  CH: { code: 'CH', name: 'Suisse', short: 'ch', path: '/suisse', locale: 'fr-CH', currency: 'CHF', symbol: 'CHF', premium: { cents: 590, label: '5.90 CHF' }, founder: { cents: 2400, label: '24 CHF' } },
  QC: { code: 'QC', name: 'Québec', short: 'qc', path: '/quebec', locale: 'fr-CA', currency: 'CAD', symbol: '$', premium: { cents: 699, label: '6,99 $' }, founder: { cents: 2700, label: '27 $' } },
};
export const REGION_CODES = Object.keys(REGIONS) as RegionCode[];
export const isRegion = (v: unknown): v is RegionCode => typeof v === 'string' && v in REGIONS;

// Pays affiché par l'application. Il n'est changé que dans le navigateur (VegeApp) : côté serveur,
// les pages publiques restent en France, sauf quand elles passent un pays explicitement.
let current: RegionCode = 'FR';
export function setRegion(code: RegionCode) { if (typeof window !== 'undefined') current = code; }
export const region = (code: RegionCode = current) => REGIONS[code];

// Source des prix, à afficher sous les budgets.
export function priceSource(code: RegionCode = current) {
  if (code === 'FR') return 'Prix relevés le 7 octobre 2026 sur carrefour.fr, marques distributeur, hors promotions';
  const p = regionPrices[code];
  return `Prix relevés le ${new Date(`${p.date}T12:00:00Z`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} chez ${p.store}, ${p.brand}, hors promotions`;
}

// Catalogue aux prix du pays : formats et prix relevés sur place quand ils existent.
// Un ingrédient non relevé garde le prix français multiplié par l’écart de prix moyen du pays (ratio), marqué « estimated ».
export function localizeIngredients(list: Ingredient[], code: RegionCode = current): (Ingredient & { estimated?: boolean })[] {
  if (code === 'FR') return list;
  const p = regionPrices[code];
  return list.map(i => {
    const local = p.items[i.id];
    if (local) return { ...i, pack: local.pack, price: local.price };
    return { ...i, price: Math.round(i.price * p.ratio * 100) / 100, estimated: true };
  });
}

// Pays deviné à la première visite : ?pays=be dans l'adresse, sinon la langue du navigateur.
export function detectRegion(search: string, languages: readonly string[]): RegionCode {
  const asked = new URLSearchParams(search).get('pays')?.toUpperCase();
  if (isRegion(asked)) return asked;
  for (const l of languages) {
    const country = l.split('-')[1]?.toUpperCase();
    if (country === 'BE') return 'BE';
    if (country === 'CH') return 'CH';
    if (country === 'CA') return 'QC';
    if (country === 'FR') return 'FR';
  }
  return 'FR';
}

// Vocabulaire : en Belgique, en Suisse et au Québec, le repas du soir est le « souper »
// (le « dîner » est celui du midi) ; au Québec, on fait « l'épicerie » et on range au « garde-manger ».
export function vocabulary(code: RegionCode): [RegExp, Record<string, string>] | null {
  if (code === 'FR') return null;
  const words: Record<string, string> = {
    'Déjeuners et petits-déjeuners': 'Dîners et déjeuners', 'petits-déjeuners': 'déjeuners',
    'Petits-déjeuners, déjeuners': 'Déjeuners, dîners', 'petits-déjeuners, déjeuners': 'déjeuners, dîners',
    'Les petits-déjeuners et les déjeuners': 'Les déjeuners et les dîners', 'les petits-déjeuners et les déjeuners': 'les déjeuners et les dîners',
    'Dîners': 'Soupers', 'dîners': 'soupers', 'Dîner': 'Souper', 'dîner': 'souper',
  };
  if (code === 'QC') Object.assign(words, { 'Liste de courses': 'Liste d’épicerie', 'liste de courses': 'liste d’épicerie', 'Mes courses': 'Mon épicerie', 'de courses': 'd’épicerie', 'Mon placard': 'Mon garde-manger', 'placard': 'garde-manger' });
  if (REGIONS[code].symbol !== '€') words['€'] = REGIONS[code].symbol;
  const keys = Object.keys(words).sort((a, b) => b.length - a.length).map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return [new RegExp(keys.join('|'), 'g'), words];
}
export function localizeText(text: string, code: RegionCode = current) {
  const v = vocabulary(code);
  return v ? text.replace(v[0], m => v[1][m]) : text;
}
