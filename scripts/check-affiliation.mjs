import { readFileSync } from 'node:fs';

// Contrôle de content/affiliation/sites.ts (liste remplie chaque jour par une tâche programmée de Claude) :
// adresses https uniques par domaine, thème connu, date valable, et rien de personnel (le dépôt est public).
const src = readFileSync('content/affiliation/sites.ts', 'utf8');
const themes = JSON.parse(/themes = (\[[^\]]*\])/.exec(src)[1].replace(/'/g, '"'));
const lignes = [...src.matchAll(/^\s*\{ site: '([^']*)', nom: '((?:[^'\\]|\\.)*)', theme: '([^']*)', ajoute: '([^']*)' \},?$/gm)];
const brutes = src.split('\n').filter(l => /^\s*\{ site:/.test(l)).length;
const erreurs = [];
if (lignes.length !== brutes) erreurs.push(`${brutes - lignes.length} ligne(s) mal formée(s) : { site: 'https://…', nom: '…', theme: '…', ajoute: 'AAAA-MM-JJ' },`);
const domaines = new Map();
for (const [, site, nom, theme, ajoute] of lignes) {
  let host = '';
  try { const u = new URL(site); host = u.hostname.replace(/^www\./, ''); if (u.protocol !== 'https:') erreurs.push(`${site} : https seulement`); } catch { erreurs.push(`${site} : adresse invalide`); }
  if (domaines.has(host)) erreurs.push(`${site} : domaine déjà présent (${domaines.get(host)})`);
  domaines.set(host, site);
  if (!themes.includes(theme)) erreurs.push(`${site} : thème inconnu « ${theme} »`);
  if (!/^20\d\d-\d\d-\d\d$/.test(ajoute)) erreurs.push(`${site} : date invalide`);
  if (!nom.trim() || nom.length > 80) erreurs.push(`${site} : nom vide ou trop long`);
  if (/@/.test(site + nom)) erreurs.push(`${site} : pas d'adresse mail dans le dépôt public`);
}
if (erreurs.length) { console.error(erreurs.join('\n')); process.exit(1); }
console.log(`${lignes.length} sites d'affiliation valables.`);
