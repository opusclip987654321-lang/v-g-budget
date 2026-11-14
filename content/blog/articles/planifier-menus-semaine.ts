import type { Article } from '@/lib/blog-articles';
import { cost, packPrice } from '@/lib/blog-cost';
import { ingredients, recipes } from '@/lib/catalog';
import { money, roundMoney, shopping, totals, type Entry } from '@/lib/planner';

// Exemple de semaine planifiée pour 2 personnes : 5 dîners du catalogue (lib/catalog.ts) choisis pour
// partager leurs ingrédients (lentilles corail, pois chiches, épinards, pâtes, riz).
// La liste de courses, les paquets entiers et les montants viennent du même calcul que l'appli
// (lib/planner.ts, shopping) : rien n'est écrit en dur.
const DINERS = ['curry-corail', 'bolognaise-lentilles', 'epinards-pois-chiches', 'pates-brocoli', 'riz-saute'];
const PORTIONS = 2;
DINERS.forEach(id => { if (!recipes.some(r => r.id === id)) throw new Error(`Recette ${id} absente : revoir /blog/planifier-menus-semaine.`); });
// Dates internes du calcul (une semaine fixe), jamais affichées.
const entries: Entry[] = DINERS.map((id, n) => { const date = `2026-11-${16 + n}`; return { id: `planifier-${n}`, recipeId: id, date, servings: PORTIONS, cooked: false, locked: false }; });
const liste = shopping(entries, [], {}, recipes, ingredients).filter(i => i.packages > 0);
const t = totals(liste);
const parPortion = roundMoney(t.used / (DINERS.length * PORTIONS));

// Étape « placard d'abord » : riz, pâtes, huile, sel et oignons déjà à la maison (un paquet de chaque).
const PLACARD = ['rice', 'pasta', 'oil', 'salt', 'onion'];
const placard = PLACARD.map(id => { const i = ingredients.find(x => x.id === id); if (!i) throw new Error(`${id} absent du catalogue : revoir /blog/planifier-menus-semaine.`); return { id, qty: i.pack }; });
const avecPlacard = shopping(entries, placard, {}, recipes, ingredients).filter(i => i.packages > 0);
const tp = totals(avecPlacard);
const evite = roundMoney(t.purchase - tp.purchase);

// Ingrédients partagés : chaque produit acheté qui sert à au moins 2 des 5 dîners.
const partages = liste.filter(i => DINERS.filter(id => recipes.find(r => r.id === id)?.ingredients.some(x => x.id === i.id)).length >= 2).length;

// Garde-fous : le texte parle d'une semaine pas chère et d'un placard qui fait baisser la note.
if (t.purchase > 30) throw new Error(`Semaine planifiée à ${t.purchase} € : revoir /blog/planifier-menus-semaine.`);
if (evite < 3) throw new Error(`Le placard n'évite que ${evite} € : revoir /blog/planifier-menus-semaine.`);
if (partages < 6) throw new Error(`Seulement ${partages} ingrédients partagés : revoir /blog/planifier-menus-semaine.`);
// Le texte dit qu'il reste des lentilles corail pour un autre dîner (velouté de courge : 120 g).
const lentilles = liste.find(i => i.id === 'red-lentils');
if (!lentilles || lentilles.surplus < 120) throw new Error('Plus assez de lentilles corail en reste : revoir /blog/planifier-menus-semaine.');
const resteLentilles = `${Math.round(lentilles.surplus)} g`;

export default {
  slug: 'planifier-menus-semaine',
  title: 'Planifier ses menus de la semaine : 5 étapes et un exemple chiffré',
  seoTitle: 'Planifier ses menus de la semaine en 5 étapes (avec prix)',
  description: `Planifier ses menus de la semaine en 5 étapes : placard d’abord, ingrédients communs, liste de courses. Exemple de 5 dîners pour 2 : ${money(parPortion)} la portion.`,
  lead: `Pour planifier ses menus de la semaine, regardez d’abord ce qui reste à la maison, prévoyez 5 dîners qui partagent leurs ingrédients plus un soir pour les restes, puis faites la liste de courses à partir de ces menus. Notre exemple pour 2 revient à ${money(parPortion)} la portion en ingrédients.`,
  category: 'Budget',
  keywords: ['planifier ses menus de la semaine', 'comment faire ses menus de la semaine', 'planning repas semaine', 'organiser ses repas de la semaine', 'menu de la semaine méthode', 'liste de courses à partir des menus'],
  date: '2026-11-14',
  coverAlt: 'Planifier ses menus de la semaine : un planning de dîners coché, un crayon, un bocal de lentilles et des légumes',
  body: `
@essentiel
- **Le placard d’abord** : notez ce qui reste avant de choisir les plats.
- **5 dîners, pas 7** : gardez un soir pour les restes et un soir libre.
- **Des ingrédients communs** : un paquet de lentilles sert à 2 dîners.
- **La liste vient des menus** : rangée par rayon, avec la quantité à acheter.

@chiffres ${money(parPortion)} | la portion dans notre exemple ; ${money(evite)} | d’achats évités grâce au placard ; 48 h | au plus pour les restes au frigo

## Comment planifier ses menus de la semaine en 5 étapes ?

Pour faire ses menus de la semaine, prenez un moment fixe, une fois par semaine, avant les courses. Un papier suffit.

1. **Faites l’inventaire** du placard, du frigo et du congélateur.
2. **Repérez les soirs pressés** : un plat de 20 min ces jours-là.
3. **Choisissez 5 dîners**, plus un soir pour les restes.
4. **Croisez les ingrédients** : une base (lentilles, pois chiches, riz, pâtes) pour 2 plats.
5. **Écrivez la liste** à partir des recettes, en retirant ce que vous avez déjà.

> Manger Bouger le résume ainsi : en planifiant vos repas sur la semaine, « vous limitez les risques de jeter et vous ne dépensez que le nécessaire ».

## Par quoi commencer : que reste-t-il dans le placard et le frigo ?

Commencez par ce qui doit partir vite (légumes frais, restes), puis par ce qui encombre le placard. Un fond de riz ou un paquet de pâtes entamé, c’est déjà un dîner.

Dans notre exemple, le riz, les pâtes, l’huile, le sel et les oignons sont déjà à la maison. La liste passe de ${money(t.purchase)} à ${money(tp.purchase)} : ${money(evite)} de moins à payer en caisse.

@cta-court Indiquez ce que vous avez déjà : VégéBudget choisit vos dîners sans viande selon votre budget, retire ces ingrédients de la liste et estime le montant des courses.

## Quels dîners choisir pour la semaine ?

Voici 5 dîners pour 2 qui se partagent ${partages} des ${liste.length} produits de la liste : lentilles corail, pois chiches, épinards surgelés, tomates concassées, pâtes, riz…

@recette curry-corail | Lundi : le curry ouvre le paquet de lentilles corail et le sachet d’épinards surgelés.

@recette bolognaise-lentilles | Mardi : le même paquet de lentilles, cette fois dans la sauce tomate, sur des pâtes.

@recette epinards-pois-chiches | Mercredi, soir pressé : la suite des épinards avec des pois chiches, sur du riz.

@recette pates-brocoli | Jeudi : le reste du paquet de pâtes, avec des pois chiches et du brocoli surgelé.

@recette riz-saute | Vendredi : le riz et les carottes qui restent, avec des petits pois surgelés.

Le week-end, un soir pour les restes, l’autre libre. Pour voir une semaine complète sur 7 jours, lisez notre [menu de la semaine pas cher](/blog/menu-semaine-pas-cher).

## Comment faire la liste de courses à partir de ses menus ?

Additionnez les quantités de chaque recette, puis arrondissez au paquet entier. Rangez la liste par rayon pour ne rien oublier.

| Ce qui change | Sans le placard | Avec le placard |
|---|---|---|
| Produits à acheter | ${liste.length} | ${avecPlacard.length} |
| Courses à payer | ${money(t.purchase)} | ${money(tp.purchase)} |

Il restera ${resteLentilles} de lentilles corail (${packPrice('red-lentils')}), de quoi faire un [velouté de courge aux lentilles](/recettes/courge-lentilles) la semaine suivante. Coût estimé des ingrédients : prix relevés le 7 octobre 2026 sur carrefour.fr, marques distributeur, hors promotions.

![Curry de lentilles corail aux épinards servi avec du riz](/images/recettes/curry-corail.jpg "Le curry du lundi ouvre le paquet de lentilles de la semaine.")

## Combien coûte une semaine de dîners planifiée ?

Dans notre exemple, les ingrédients réellement utilisés reviennent à ${money(parPortion)} la portion, pour 10 portions. La note en caisse est plus élevée, car on achète des paquets entiers : ${money(t.purchase)} sans rien dans le placard.

- **Le curry de lentilles corail** : ${cost('curry-corail')} la portion.
- **La bolognaise de lentilles** : ${cost('bolognaise-lentilles')} la portion.
- **Le riz sauté aux petits pois** : ${cost('riz-saute')} la portion.

Pour un panier complet à deux, voyez nos [courses à 50 € par semaine](/blog/courses-50-euros-par-semaine).

## Quels outils pour organiser ses repas de la semaine ?

- **Un planning des repas sur le frigo** : les 7 jours de la semaine, le plat, ce qu’il faut sortir du congélateur.
- **La Fabrique à menus de Manger Bouger** : un outil public et gratuit qui propose des menus et leur liste de courses.
- **[VégéBudget](/)** : vos dîners sans viande selon votre budget, la liste qui tient compte de vos placards et son montant estimé. Première semaine gratuite.

Pour aller plus loin : préparer plusieurs plats d’un coup avec notre [batch cooking pas cher](/blog/batch-cooking-pas-cher), ou finir les restes grâce à notre article [que faire avec des restes](/blog/que-faire-avec-des-restes).

## D’autres dîners faciles à glisser dans vos menus

@recettes poelee-blanche, mijote-lentilles, semoule-pois

@cta Organisez vos dîners de la semaine
`,
  faq: [
    ['Quand planifier ses menus de la semaine ?', 'Une fois par semaine, juste avant les courses : regarder le placard et le frigo, choisir 5 dîners, puis écrire la liste. Reprendre les plats qui ont plu fait gagner du temps d’une semaine à l’autre.'],
    ['Faut-il prévoir les 7 dîners de la semaine ?', 'Non : 5 dîners suffisent souvent. Gardez un soir pour finir les restes et un soir libre pour une sortie ou un imprévu, sinon des produits risquent de se perdre.'],
    ['Combien de temps se gardent les restes au réfrigérateur ?', 'Le ministère de l’Agriculture conseille de consommer les restes de plats faits maison au plus vite, dans les 48 heures au maximum, et de ne pas les laisser plus de 2 heures à température ambiante.'],
    ['Comment éviter de manger la même chose toute la semaine ?', `Gardez une même base pour 2 plats, mais changez la recette : les lentilles corail font un curry le lundi (${cost('curry-corail')} la portion) et une bolognaise le mardi (${cost('bolognaise-lentilles')}).`],
    ['Existe-t-il un outil gratuit pour faire ses menus et sa liste de courses ?', 'Oui : la Fabrique à menus de Manger Bouger propose des menus et leur liste de courses. VégéBudget prépare des dîners sans viande selon votre budget, avec une liste qui tient compte de vos placards ; la première semaine est gratuite, sans compte ni carte bancaire.'],
  ],
  sources: [
    ['Gaspillage alimentaire : on dit stop ! (Manger Bouger, Santé publique France)', 'https://www.mangerbouger.fr/manger-mieux/bien-manger-sans-se-ruiner/bien-manger-en-preservant-la-planete-sans-se-ruiner-c-est-possible/gaspillage-alimentaire-on-dit-stop'],
    ['La Fabrique à menus et sa liste de courses (Manger Bouger, Santé publique France)', 'https://www.mangerbouger.fr/manger-mieux/la-fabrique-a-menus/liste-de-courses'],
    ['Cuisiner fait maison : comment éviter les intoxications alimentaires (ministère de l’Agriculture)', 'https://agriculture.gouv.fr/cuisiner-fait-maison-comment-eviter-les-intoxications-alimentaires'],
  ],
} satisfies Article;
