import type { Article } from '@/lib/blog-articles';
import { cost } from '@/lib/blog-cost';
import { ingredients } from '@/lib/catalog';
import { money, quantity } from '@/lib/planner';
import { findRecipe, portionCost } from '@/lib/seo';

// Session de batch cooking : 4 recettes du catalogue (lib/catalog.ts), 2 portions chacune, donc 4 dîners pour 2.
// Tous les montants sont calculés à partir des relevés du catalogue : rien n'est écrit en dur.
const SESSION = ['mijote-lentilles', 'bolognaise-lentilles', 'curry-corail', 'chili-haricots'];
const recette = (id: string) => { const r = findRecipe(id); if (!r) throw new Error(`Recette inconnue : ${id}`); return r; };
const ing = (id: string) => { const i = ingredients.find(x => x.id === id); if (!i) throw new Error(`Ingrédient inconnu : ${id}`); return i; };

// Coût des ingrédients réellement utilisés (8 portions).
const portions = SESSION.map(id => portionCost(recette(id)));
const utilise = money(portions.reduce((s, p) => s + p * 2, 0));
const minPortion = SESSION[portions.indexOf(Math.min(...portions))];
const maxPortion = SESSION[portions.indexOf(Math.max(...portions))];

// Quantités totales de la session, puis paquets entiers à acheter si rien n'est à la maison.
const total = new Map<string, number>();
for (const id of SESSION) for (const x of recette(id).ingredients) total.set(x.id, (total.get(x.id) ?? 0) + x.qty);
const paquets = (id: string) => Math.ceil(total.get(id)! / ing(id).pack);
const caisse = money([...total.keys()].reduce((s, id) => s + paquets(id) * ing(id).price, 0));
// Huile, sel, épices et ail : supposés déjà au placard, regroupés sur une ligne.
const PLACARD = ['oil', 'salt', 'paprika', 'cumin', 'curry', 'garlic'];
if ([...total.keys()].filter(id => PLACARD.includes(id)).length !== PLACARD.length) throw new Error('La session a changé : revoir la ligne « placard » de /blog/batch-cooking-pas-cher.');
const achat = (id: string) => { const i = ing(id); const n = paquets(id); return i.unit === 'pièce' ? quantity(n, 'pièce') : `${n} × ${quantity(i.pack, i.unit)}`; };
const liste = [
  '| Produit | Pour la session | À acheter |',
  '|---|---|---|',
  ...[...total.keys()].filter(id => !PLACARD.includes(id)).map(id => `| ${ing(id).name} | ${quantity(total.get(id)!, ing(id).unit)} | ${achat(id)} |`),
  '| Huile, sel, épices, ail | un peu | au placard |',
].join('\n');

// Temps : somme des temps affichés sur les fiches recettes.
const minutes = SESSION.reduce((s, id) => s + recette(id).minutes, 0);
const duree = `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')}`;
// Le texte dit que deux recettes se servent avec du riz et une avec des pâtes, à cuire le soir même.
const avec = (id: string, x: string) => recette(id).ingredients.some(y => y.id === x);
if (maxPortion !== 'chili-haricots') throw new Error('Le chili n’est plus le plat le plus cher : revoir /blog/batch-cooking-pas-cher.');
if (!(avec('curry-corail', 'rice') && avec('chili-haricots', 'rice') && avec('bolognaise-lentilles', 'pasta') && !avec('mijote-lentilles', 'rice') && !avec('mijote-lentilles', 'pasta')))
  throw new Error('Les recettes ont changé : revoir le paragraphe riz et pâtes de /blog/batch-cooking-pas-cher.');
// Le texte dit : oignons et tomates dans les 4 plats, lentilles dans 3, les 4 marqués « À préparer en avance », le mijoté est le plus long.
const lentilles = (id: string) => avec(id, 'green-lentils') || avec(id, 'red-lentils');
if (!SESSION.every(id => avec(id, 'onion') && avec(id, 'tomato') && recette(id).tags.includes('À préparer en avance')) || SESSION.filter(lentilles).length !== 3)
  throw new Error('Les recettes ont changé : revoir les bases communes de /blog/batch-cooking-pas-cher.');
const plusLong = recette('mijote-lentilles').minutes;
if (SESSION.some(id => id !== 'mijote-lentilles' && recette(id).minutes >= plusLong)) throw new Error('Le mijoté n’est plus le plat le plus long : revoir l’organisation de /blog/batch-cooking-pas-cher.');

export default {
  slug: 'batch-cooking-pas-cher',
  title: 'Batch cooking pas cher : 4 dîners végétariens préparés d’avance, avec la liste de courses',
  seoTitle: 'Batch cooking pas cher : 4 dîners végétariens et leur prix',
  description: 'Batch cooking pas cher : 4 dîners végétariens pour 2 à préparer d’avance, le coût réel par portion, la liste de courses et combien de temps garder les plats.',
  lead: `Un batch cooking pas cher repose sur des plats qui se gardent : légumes secs, sauces tomate, mijotés. Nos 4 dîners végétariens pour 2 coûtent ${utilise} d’ingrédients pour 8 portions, soit ${cost(minPortion)} à ${cost(maxPortion)} la portion.`,
  category: 'Recettes',
  keywords: ['batch cooking pas cher', 'batch cooking végétarien pas cher', 'batch cooking économique', 'batch cooking liste de courses', 'batch cooking combien de temps ça se conserve', 'batch cooking pour 2'],
  date: '2026-11-09',
  coverAlt: 'Batch cooking pas cher : une marmite et des boîtes de plats végétariens préparés d’avance',
  body: `
@essentiel
- **Choisissez des plats qui se gardent** : lentilles, haricots, sauces tomate. Les 4 recettes ci-dessous sont marquées « À préparer en avance » sur leur fiche.
- **Une session, 4 dîners pour 2** : ${utilise} d’ingrédients utilisés, ${caisse} en caisse si vous achetez tout en paquets entiers.
- **Au réfrigérateur, 48 heures au plus** pour un plat fait maison, selon le ministère de l’Agriculture : congelez le reste le jour même.
- **Riz et pâtes se cuisent le soir**, pendant que le plat se réchauffe : seul ce qui mijote est préparé d’avance.

@chiffres ${utilise} | d’ingrédients pour 8 portions ; ${duree} | en tout pour les 4 recettes ; 48 h | au réfrigérateur, au plus

## Quelles recettes végétariennes pour un batch cooking pas cher ?

Les quatre plats de cette session contiennent tous des oignons et des tomates concassées, et trois sur quatre des lentilles : moins de paquets entamés. Le montant affiché est le coût estimé des ingrédients par portion.

@recette mijote-lentilles | Lentilles vertes, carottes et pommes de terre dans une seule casserole : rien à cuire à côté le soir, il suffit de réchauffer.

@recette bolognaise-lentilles | La sauce aux lentilles corail se prépare d’avance, les pâtes se cuisent le soir. Plus d’idées dans nos [recettes de lentilles pas chères](/blog/recettes-lentilles-pas-cheres).

@recette curry-corail | Lentilles corail, épinards surgelés et lait de coco : une casserole, à servir sur un riz cuit le soir même.

@recette chili-haricots | Haricots rouges, maïs, poivron et tomate, avec du riz : le plat le plus cher de la série, à ${cost('chili-haricots')} la portion.

@cta-court Avant la session, il faut choisir les plats et faire la liste. VégéBudget compose vos dîners sans viande de la semaine selon votre budget, tient compte de ce que vous avez déjà et donne la liste de courses avec son montant estimé.

## Le batch cooking fait-il vraiment économiser ?

Il aide surtout à finir les paquets. Les ${paquets('tomato')} boîtes de tomates et le filet d’oignons servent aux quatre plats, le sachet de carottes à deux, au lieu de traîner au fond du réfrigérateur.

| Ce que vous payez | Montant |
|---|---|
| Ingrédients utilisés pour 8 portions | ${utilise} |
| Courses en paquets entiers, placard vide | ${caisse} |

> Prix relevés le 7 octobre 2026 sur carrefour.fr, marques distributeur, hors promotions.

L’écart entre les deux lignes, ce sont les restes de paquets : riz, pâtes, lentilles, huile, épices. Ils serviront aux semaines suivantes. Pour les contenants, réutilisez des bocaux en verre et des boîtes que vous avez déjà : inutile d’en acheter.

## Batch cooking : quelle liste de courses pour la session ?

${liste}

Avant d’acheter, regardez votre placard : riz, pâtes, lentilles et épices s’y trouvent souvent déjà. Pour un budget complet de la semaine, voyez aussi [faire ses courses avec 50 € par semaine](/blog/courses-50-euros-par-semaine).

## Comment organiser sa session de batch cooking ?

![Un bol de riz blanc et un bol de lentilles vertes aux carottes sur un plan de travail](/images/blog/proteines-vegetales-riz-lentilles.jpg "Les lentilles se préparent d’avance, le riz se cuit le soir.")

- **Commencez par l’épluchage** : les oignons et les carottes des quatre recettes, en une fois.
- **Lancez d’abord le plus long** : les lentilles vertes aux carottes, ${plusLong} min sur la fiche.
- **Sur un deuxième feu**, enchaînez le chili, la sauce bolognaise puis le curry.
- **Laissez refroidir**, puis répartissez chaque plat en portions d’un dîner.
- **Gardez le riz et les pâtes à part** : ils se cuisent le soir même.

Additionnés, les temps des fiches recettes font ${duree} ; avec deux casseroles à la fois, la session est plus courte.

## Combien de temps se conservent les plats préparés d’avance ?

- **Au réfrigérateur** : le ministère de l’Agriculture conseille de consommer les restes de plats faits maison le plus vite possible, en 48 heures au plus.
- **Refroidir vite** : ne laissez pas un plat chaud plus de 2 heures à température ambiante.
- **Au congélateur** : ce qui ne sera pas mangé dans les 48 heures part au congélateur le jour de la session, en portions datées.
- **Les soupes se congèlent aussi** : le ministère les cite parmi les préparations qui supportent la congélation (voir notre [soupe maison pas chère](/blog/soupe-maison-pas-chere)).

> Notre ordre conseillé : mijoté et bolognaise les deux premiers soirs, curry et chili sortis du congélateur la veille de leur dîner.

## Batch cooking pour 2 : quels autres dîners préparer d’avance ?

@recettes hachis-lentilles, minestrone-haricots, courge-lentilles

Pour une semaine complète de dîners déjà chiffrée, voyez notre [menu de la semaine pas cher](/blog/menu-semaine-pas-cher), ou toutes nos [recettes](/recettes).

@cta Organisez vos dîners de la semaine
`,
  faq: [
    ['Le batch cooking fait-il vraiment économiser ?', `Il aide surtout à finir les paquets : nos 4 dîners pour 2 utilisent tous des oignons et des tomates concassées, et trois sur quatre des lentilles. Les ingrédients utilisés coûtent ${utilise} pour 8 portions, et ${caisse} si vous achetez tout en paquets entiers, sans rien au placard (prix carrefour.fr du 7 octobre 2026).`],
    ['Combien de temps se garde un plat de batch cooking au réfrigérateur ?', 'Le ministère de l’Agriculture conseille de consommer les restes de plats faits maison le plus vite possible, en 48 heures au plus. Au-delà, congelez les portions le jour même de la préparation.'],
    ['Peut-on congeler les plats de batch cooking ?', 'Oui, en portions d’un dîner, une fois refroidies et datées. Gardez le riz et les pâtes à part : ils se cuisent le soir même, pendant que la sauce se réchauffe.'],
    ['Combien de recettes préparer pour une semaine ?', 'Trois ou quatre plats suffisent pour la plupart des dîners de la semaine, à condition de congeler ceux qui ne seront pas mangés dans les 48 heures. Les autres soirs, choisissez une recette rapide à cuisiner le jour même.'],
    ['Quels contenants utiliser sans dépenser ?', 'Des bocaux en verre et des boîtes déjà à la maison suffisent. Remplissez-les en portions d’un dîner pour ne sortir du congélateur que ce qu’il faut.'],
  ],
  sources: [
    ['Cuisiner fait maison : comment éviter les intoxications alimentaires (ministère de l’Agriculture)', 'https://agriculture.gouv.fr/cuisiner-fait-maison-comment-eviter-les-intoxications-alimentaires'],
    ['Les bonnes pratiques de la congélation (ministère de l’Agriculture)', 'https://agriculture.gouv.fr/les-bonnes-pratiques-de-la-congelation'],
  ],
} satisfies Article;
