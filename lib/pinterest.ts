import { infos } from '@/content/instagram/carrousels';
import type { Info } from './instagram-infos';
import { recipes } from './catalog';
import { money } from './planner';
import { blogCoverJpg, blogPath, sortedArticles, type Article } from './blog';
import { findRecipe, portionCost, recipeImage, recipePath } from './seo';
import { FOYERS, foyerPath, menuFoyer, type Foyer } from './menu-foyer';
import { readSetting, writeSetting } from './server';

// Pinterest sans API (proposition de Loop Agent validée par Walid le 09/11/2026) : 3 épingles nouvelles par jour
// pendant 4 semaines, objectif 50 visites venues de Pinterest. Pinterest lit chaque jour le flux RSS
// /pinterest/flux.xml (réglage « Publication automatique » d'un compte professionnel qui a revendiqué vegebudget.fr)
// et crée une épingle par nouvel élément. Pas d'appli à faire valider, pas de jeton.
// Épingles : les carrousels « infos végé » (couverture), les recettes (prix de la part), les menus par foyer et les
// articles du blog, à tour de rôle ; image verticale 1000 × 1500 dessinée par lib/pinterest-image.tsx.
// Le calendrier démarre au premier passage du robot de Pinterest sur le flux (il ne tourne pas pour rien avant).
// Bilan public : GET /api/pinterest (épingles sorties, passages de Pinterest, visites venues de Pinterest).

// Code de revendication du site donné par Pinterest (balise <meta name="p:domain_verify">). Public par nature :
// il est affiché dans la page. La variable PINTEREST_VERIFICATION du .env le remplace si besoin.
export const PINTEREST_VERIFICATION_CODE = 'ce1bc1f103652eb9372a12687bdce8de';
export const pinterestVerification = () => process.env.PINTEREST_VERIFICATION || PINTEREST_VERIFICATION_CODE;

export const PAR_JOUR = 3;
// Essai de 4 semaines, puis bilan (Loop Agent) : on prolonge ou on arrête.
export const DUREE_JOURS = 28;
// Heures de sortie après le début de la journée de calendrier (0 h, +5 h, +10 h).
const DECALAGES_H = [0, 5, 10];
const JOUR_MS = 86400000;
export const FLUX_PATH = '/pinterest/flux.xml';
export const imagePath = (id: string) => `/pinterest/image/${id}.jpg`;

export type Epingle = {
  id: string;           // info-<slug>, recette-<id>, menu-<foyer>, article-<slug>
  kind: 'info' | 'recette' | 'menu' | 'article';
  title: string;        // 100 caractères au plus (limite de Pinterest)
  description: string;  // 500 caractères au plus
  pill: string;
  sub?: string;
  image: string | null; // photo dans public/, ou null (fond vert)
  path: string;         // page du site visée
};

const cut = (s: string, n: number) => s.length <= n ? s : `${s.slice(0, n - 1).replace(/\s+\S*$/, '')}…`;
const clean = (s: string) => s.replace(/\p{Extended_Pictographic}|\uFE0F/gu, '').replace(/\s+/g, ' ').trim();
// Phrase terminée par un point, même quand l'emoji final a été retiré.
const phrase = (s: string) => { const t = clean(s); return /[.!?…]$/.test(t) ? t : `${t}.`; };
const FIN = 'Vos dîners végétariens de la semaine, avec la liste de courses et le prix réel : vegebudget.fr. Première semaine gratuite.';

function fromInfo(i: Info): Epingle {
  return { id: `info-${i.slug}`, kind: 'info', title: cut(i.title, 100), description: cut(`${phrase(i.hook)} ${FIN}`, 500), pill: i.pill, image: i.image ?? null, path: '/' };
}
function fromRecipe(r: (typeof recipes)[number]): Epingle {
  const prix = money(portionCost(r));
  return {
    id: `recette-${r.id}`, kind: 'recette', title: cut(`${r.title} : ${prix} la part`, 100),
    description: cut(`${r.description} Recette végétarienne pas chère, prête en ${r.minutes} min, ${prix} la part (prix relevés en magasin). Ingrédients pour 2 et étapes sur vegebudget.fr.`, 500),
    pill: `${prix} la part`, sub: `${r.minutes} min · recette végétarienne`, image: recipeImage(r), path: recipePath(r),
  };
}
function fromFoyer(f: Foyer): Epingle {
  const m = menuFoyer(f);
  const total = `${Math.round(m.achat)} €`;
  return {
    id: `menu-${f.slug}`, kind: 'menu', title: cut(`Menu végétarien de la semaine ${f.pour} : 5 dîners pour ${total}`, 100),
    description: cut(`5 dîners sans viande ${f.pour}, avec la liste de courses chiffrée : ${money(m.achat)} de courses, ${money(m.parPortion)} la portion. ${m.diners.map(d => d.recipe.title).join(', ')}.`, 500),
    pill: 'Menu + liste de courses', sub: `${money(m.parPortion)} la portion · ${f.label}`, image: m.diners[0] ? recipeImage(m.diners[0].recipe) : null, path: foyerPath(f),
  };
}
function fromArticle(a: Article): Epingle {
  return { id: `article-${a.slug}`, kind: 'article', title: cut(a.title, 100), description: cut(`${a.description} ${FIN}`, 500), pill: a.category, image: blogCoverJpg(a), path: blogPath(a) };
}

// Toutes les épingles possibles, par famille (les nouvelles recettes, articles et carrousels s'y ajoutent seuls).
function familles() {
  return {
    info: infos.map(fromInfo),
    recette: recipes.map(fromRecipe),
    // Les menus d'abord (ce que la proposition visait : « menu végé de la semaine à X € »), puis les articles récents.
    autre: [...FOYERS.map(fromFoyer), ...sortedArticles().map(fromArticle)],
  };
}

export function findEpingle(id: string): Epingle | null {
  const [kind, ...rest] = id.split('-'), key = rest.join('-');
  if (kind === 'info') { const i = infos.find(x => x.slug === key); return i ? fromInfo(i) : null; }
  if (kind === 'recette') { const r = findRecipe(key); return r ? fromRecipe(r) : null; }
  if (kind === 'menu') { const f = FOYERS.find(x => x.slug === key); return f ? fromFoyer(f) : null; }
  if (kind === 'article') { const a = sortedArticles().find(x => x.slug === key); return a ? fromArticle(a) : null; }
  return null;
}

// Prochaines épingles à sortir, à tour de rôle : un carrousel, une recette, un menu ou un article.
export function file(dejaSorties: Set<string>, n: number) {
  const f = familles();
  const pools = [f.info, f.recette, f.autre].map(list => list.filter(e => !dejaSorties.has(e.id)));
  const out: Epingle[] = [];
  for (let k = dejaSorties.size; out.length < n && pools.some(p => p.length); k++) {
    const p = pools[k % 3].length ? pools[k % 3] : pools.find(x => x.length)!;
    out.push(p.shift()!);
  }
  return out;
}

export type Sortie = { id: string; at: string };
type Etat = { debut: string | null; sorties: Sortie[]; passages: number; dernierPassage: string | null };
const ETAT = 'pinterest';
export const etat = () => readSetting<Etat>(ETAT, { debut: null, sorties: [], passages: 0, dernierPassage: null });

// Heure de sortie de la k-ième épingle (k à partir de 0).
export const heureSortie = (debut: string, k: number) =>
  new Date(new Date(debut).getTime() + Math.floor(k / PAR_JOUR) * JOUR_MS + DECALAGES_H[k % PAR_JOUR] * 3600000);

// Fait sortir les épingles dont l'heure est passée. robot = la demande vient de Pinterest (démarre le calendrier).
export async function avancer(now = new Date(), robot = false) {
  const e = await etat();
  let change = false;
  if (robot) { e.passages += 1; e.dernierPassage = now.toISOString(); change = true; if (!e.debut) e.debut = now.toISOString(); }
  if (e.debut) {
    let dues = 0;
    while (dues < PAR_JOUR * DUREE_JOURS && heureSortie(e.debut, dues) <= now) dues++;
    if (e.sorties.length < dues) {
      const nouvelles = file(new Set(e.sorties.map(s => s.id)), dues - e.sorties.length);
      // La k-ième épingle garde son créneau, même si elle sort en retard (site arrêté, pas de visite du robot).
      for (const p of nouvelles) e.sorties.push({ id: p.id, at: heureSortie(e.debut, e.sorties.length).toISOString() });
      change = change || nouvelles.length > 0;
    }
  }
  if (change) await writeSetting(ETAT, e);
  return e;
}

export const lien = (origin: string, p: Epingle) =>
  `${origin}${p.path}?utm_source=pinterest&utm_medium=epingle&utm_campaign=${p.kind}&utm_content=${encodeURIComponent(p.id)}`;

const xml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Flux RSS 2.0 lu par Pinterest : les 50 dernières épingles sorties (avant le premier passage de Pinterest, les 3
// premières en aperçu, pour que le flux soit valide quand Walid le colle dans Pinterest).
export function flux(origin: string, items: { p: Epingle; at: string }[]) {
  const body = items.map(({ p, at }) => `    <item>
      <title>${xml(p.title)}</title>
      <link>${xml(lien(origin, p))}</link>
      <guid isPermaLink="false">vegebudget-pinterest-${xml(p.id)}</guid>
      <pubDate>${new Date(at).toUTCString()}</pubDate>
      <description>${xml(p.description)}</description>
      <enclosure url="${xml(origin + imagePath(p.id))}" type="image/jpeg" length="0" />
      <media:content url="${xml(origin + imagePath(p.id))}" medium="image" type="image/jpeg" width="1000" height="1500" />
    </item>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>VégéBudget : menus végétariens à petit budget</title>
    <link>${xml(origin)}/</link>
    <atom:link href="${xml(origin + FLUX_PATH)}" rel="self" type="application/rss+xml" />
    <description>Recettes, menus de la semaine et listes de courses végétariennes avec le prix réel de chaque plat.</description>
    <language>fr-FR</language>
${body}
  </channel>
</rss>
`;
}

export const estPinterest = (request: Request) => /pinterest/i.test(request.headers.get('user-agent') ?? '');
