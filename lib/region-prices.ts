// Prix relevés hors de France (généré depuis les relevés : voir scripts/region-prices.mjs).
// pack : taille du paquet (g, ml ou pièce, comme dans lib/catalog.ts) ; price : prix du paquet dans la monnaie du pays.
// ratio : écart de prix moyen avec la France sur les produits relevés, pour estimer ceux qui manquent.
export type RegionPrices = { store: string; brand: string; date: string; ratio: number; items: Record<string, { pack: number; price: number }> };
export const regionPrices: Record<'BE' | 'CH' | 'QC', RegionPrices> = {
  BE: { store: '', brand: '', date: '2026-10-11', ratio: 1, items: {} },
  CH: { store: '', brand: '', date: '2026-10-11', ratio: 1, items: {} },
  QC: { store: '', brand: '', date: '2026-10-11', ratio: 1, items: {} },
};
