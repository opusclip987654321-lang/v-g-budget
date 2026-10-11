// Tarif Premium. Les montants facturés par pays sont dans lib/region.ts ; le site crée les prix Stripe correspondants (lib/billing.ts).
export const PREMIUM_PRICE_LABEL='4,99 €';
// Offre membre fondateur : réservée pendant la préouverture, prix annuel bloqué pour les premières places.
export const FOUNDER_PRICE_LABEL='19 €';
export const FOUNDER_SEATS=100;
// Source des prix du catalogue (lib/catalog.ts) : à mettre à jour à chaque nouveau relevé.
export const PRICE_SOURCE='Prix relevés le 7 octobre 2026 sur carrefour.fr, marques distributeur, hors promotions';
