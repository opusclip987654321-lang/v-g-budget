import type { Article } from '@/lib/blog-articles';
import { amountPrice, cost, kiloPrice, packPrice } from '@/lib/blog-cost';
import { ingredients, recipes } from '@/lib/catalog';

// Exemples de prix au kilo : uniquement les ingrédients du catalogue (relevés carrefour.fr).
// Le texte compare ces prix en toutes lettres : si un relevé inverse une comparaison, la construction échoue.
const ing = (id: string) => { const i = ingredients.find(x => x.id === id); if (!i) throw new Error(`Ingrédient inconnu : ${id}`); return i; };
const kg = (id: string) => ing(id).price / ing(id).pack;
// Quantité d'un ingrédient dans une recette du catalogue (2 portions) : le texte cite 140 g de lentilles et 240 g de pois chiches.
const dose = (recette: string, id: string) => recipes.find(r => r.id === recette)?.ingredients.find(x => x.id === id)?.qty;
// Le chou doit rester dans la moitié la moins chère au kilo des fruits et légumes vendus au poids (carte « poelee-chou »).
const legumes = ingredients.filter(x => x.category === 'Fruits et légumes' && x.unit === 'g').map(x => x.price / x.pack).sort((a, b) => a - b);
if (!(
  ing('basil').price === ing('parsley').price && ing('parsley').price === ing('garlic').price && ing('parsley').pack === ing('garlic').pack && kg('basil') > 3 * kg('parsley')
  && kg('onion') < kg('basil')
  && ing('onion').price > ing('carrot').price && ing('carrot').pack === 1000 && kg('onion') < kg('carrot')
  && ing('mushroom').price > ing('cabbage').price && ing('mushroom').price < 1.2 * ing('cabbage').price && kg('mushroom') > 3 * kg('cabbage')
  && kg('tofu') > 3 * kg('green-lentils')
  && kg('green-lentils') > kg('chickpeas') && 140 * kg('green-lentils') < 240 * kg('chickpeas') && ing('basil').pack === 15
  && dose('salade-lentilles', 'green-lentils') === 140 && dose('epinards-pois-chiches', 'chickpeas') === 240
  && legumes.indexOf(kg('cabbage')) < legumes.length / 2 && kg('potato') <= kg('cabbage')
)) throw new Error('Les prix du catalogue ont changé : revoir les comparaisons de /blog/comparer-prix-au-kilo.');

const ligne = (nom: string, id: string) => `| ${nom} | ${packPrice(id)} | ${kiloPrice(id)} |`;
const tableau = [
  '| Produit | Prix du paquet | Prix au kilo |',
  '|---|---|---|',
  ligne('Oignons (filet)', 'onion'),
  ligne('Carottes', 'carrot'),
  ligne('Chou blanc', 'cabbage'),
  ligne('Champignons (barquette)', 'mushroom'),
  ligne('Tofu nature', 'tofu'),
  ligne('Persil', 'parsley'),
  ligne('Basilic', 'basil'),
].join('\n');

export default {
  slug: 'comparer-prix-au-kilo',
  title: 'Comparer le prix au kilo : la méthode simple, avec de vrais prix',
  seoTitle: 'Comparer le prix au kilo : méthode simple et vrais exemples',
  description: 'Comment comparer le prix au kilo : où le lire sur l’étiquette, le calculer, éviter les pièges des conserves et des grands formats, avec de vrais prix relevés.',
  lead: `Pour comparer le prix au kilo, lisez la petite ligne « prix au kg » de l’étiquette, ou divisez le prix par le poids en grammes puis multipliez par 1 000. Un sachet de basilic à ${packPrice('basil')} revient ainsi à ${kiloPrice('basil')}, contre ${kiloPrice('onion')} pour un filet d’oignons.`,
  category: 'Budget',
  keywords: ['comparer le prix au kilo', 'calculer le prix au kilo', 'prix au kilo étiquette', 'prix à l’unité de mesure', 'prix au kilo égoutté conserve', 'grand format moins cher au kilo', 'réduflation'],
  date: '2026-11-08',
  coverAlt: 'Comparer le prix au kilo : une balance de cuisine, un sachet de lentilles, une conserve et des étiquettes de prix en rayon',
  body: `
@essentiel
- **Le prix au kilo est affiché en rayon** : c’est la petite ligne sous le grand prix, obligatoire pour la plupart des produits emballés.
- **Pour le calculer** : prix ÷ poids en grammes × 1 000.
- **Pour une conserve**, comparez le poids net égoutté, pas le poids total.
- **Un petit prix n’est pas un prix bas** : un paquet plus cher peut revenir moins cher au kilo.

@chiffres ${kiloPrice('basil')} | le basilic au kilo ; ${kiloPrice('onion')} | les oignons en filet ; 2 mois | d’affichage en cas de réduflation

## Comment lire le prix au kilo sur l’étiquette ?

Sous le prix du produit, l’étiquette du rayon indique un **prix à l’unité de mesure** : au kilo, au litre, parfois à la pièce. Il est obligatoire pour la plupart des denrées alimentaires préemballées, selon l’arrêté du 16 novembre 1999 (economie.gouv.fr, Institut national de la consommation).

- **Vérifiez l’unité** : un prix « au kilo » ne se compare pas à un prix « à la pièce » ou « aux 100 g ».
- **Regardez le prix au kilo égoutté** pour les conserves, quand l’étiquette le donne.
- **Pour une promotion ou un lot**, refaites le calcul avec le prix payé et la quantité totale.

## Comment calculer le prix au kilo soi-même ?

> **La formule** : prix du paquet ÷ poids en grammes × 1 000. Exemple : le basilic à ${packPrice('basil')} revient à ${kiloPrice('basil')}.

Persil, ail et basilic coûtent tous ${amountPrice('basil', 15)} le paquet dans nos relevés. Au kilo, l’écart est énorme : ${kiloPrice('parsley')} pour le persil et l’ail (vendus à la pièce, poids estimé), ${kiloPrice('basil')} pour le basilic. Pour quelques feuilles, ce n’est pas grave. Mais le grand prix affiché ne dit rien du prix réel.

## Comment comparer le prix au kilo de deux produits ?

Mettez les deux prix au kilo côte à côte, jamais les prix des paquets. Exemples tirés de nos relevés :

${tableau}

> Prix relevés le 7 octobre 2026 sur carrefour.fr, marques distributeur, hors promotions. Le chou et le persil sont vendus à la pièce : leur poids est estimé.

- **Le filet d’oignons** coûte plus cher à la caisse que le kilo de carottes, mais moins cher au kilo.
- **La barquette de champignons** coûte à peine plus que le chou entier à la caisse ; au kilo, elle coûte plus du triple.
- **Le tofu** revient à ${kiloPrice('tofu')}, contre ${kiloPrice('green-lentils')} pour les lentilles vertes sèches : essayez nos [recettes de lentilles pas chères](/blog/recettes-lentilles-pas-cheres).

@recette poelee-chou | Du chou, des pommes de terre et des haricots blancs : un dîner bâti sur deux légumes parmi les moins chers au kilo de nos relevés.

@cta-court Plus besoin de tout calculer en rayon : VégéBudget choisit vos dîners de la semaine selon votre budget et vous donne la liste de courses avec son montant estimé. Première semaine gratuite, sans compte.

## Prix au kilo égoutté : comment comparer conserves et légumes secs ?

![Bocaux de lentilles vertes, de riz et de flocons d’avoine](/images/blog/manger-bio-pas-cher-vrac.jpg "Légumes secs : comparez leur prix pour un dîner, pas seulement au kilo.")

Sur une conserve de légumes baignant dans un liquide, l’emballage doit indiquer le **poids net égoutté** (règlement européen sur l’information des consommateurs). C’est ce poids qui compte : l’eau de la boîte ne se mange pas.

Attention aussi au piège inverse. Les lentilles vertes sèches (${kiloPrice('green-lentils')}) semblent plus chères que les pois chiches en boîte (${kiloPrice('chickpeas')} égoutté). Mais les lentilles sont pesées sèches et prennent du poids à la cuisson, alors que les pois chiches sont pesés déjà cuits.

> **Le bon repère, c’est le prix pour un dîner.** Dans nos recettes pour 2 personnes, la part de légumineuses est de 140 g de lentilles sèches, soit ${amountPrice('green-lentils', 140)}, ou de 240 g de pois chiches égouttés, soit ${amountPrice('chickpeas', 240)}. Pour un dîner, les lentilles reviennent moins cher.

@recette salade-lentilles | 140 g de lentilles vertes sèches pour 2 : la [salade tiède de lentilles](/recettes/salade-lentilles) revient à ${cost('salade-lentilles')} la portion.

@recette epinards-pois-chiches | 240 g de pois chiches en boîte, des épinards surgelés et du riz : ${cost('epinards-pois-chiches')} la portion.

## Le grand format est-il toujours moins cher au kilo ?

Pas toujours. Depuis 2007, la taille des paquets est libre pour la plupart des produits : le prix au kilo reste le seul repère fiable pour comparer deux formats, rappelle Que Choisir.

- **Comparez le format familial** au petit format, au kilo, à chaque achat.
- **Un lot ou un « 2 + 1 »** n’est intéressant que si vous finissez tout : un reste jeté fait grimper le vrai prix.
- **Le surgelé** permet souvent de prendre la juste quantité, à un prix au kilo bas (voir [légumes surgelés ou frais](/blog/legumes-surgeles-prix)).

## Comment repérer la réduflation ?

La réduflation, c’est un paquet qui rétrécit sans que son prix baisse. Depuis le 1er juillet 2024, dans les magasins à dominante alimentaire, un produit dont la quantité a diminué et dont le prix au kilo a augmenté doit être signalé en rayon pendant 2 mois (info.gouv.fr, Institut national de la consommation). Le prix au kilo, lui, ne trompe pas.

Pour garder un budget de courses serré toute la semaine, lisez aussi [faire ses courses avec 50 € par semaine](/blog/courses-50-euros-par-semaine).

@recettes minestrone-haricots, chili-haricots, bolognaise-lentilles

@cta Préparez vos menus en fonction de votre budget
`,
  faq: [
    ['Comment calculer le prix au kilo d’un produit ?', 'Divisez le prix du paquet par son poids en grammes, puis multipliez par 1 000. Pour le prix au litre, faites de même avec le volume en millilitres.'],
    ['Le prix au kilo est-il obligatoire en magasin ?', 'Oui pour la plupart des denrées alimentaires préemballées : l’arrêté du 16 novembre 1999 impose d’afficher le prix à l’unité de mesure, au kilo ou au litre, en plus du prix de vente.'],
    ['Pour une conserve, faut-il regarder le poids net ou le poids égoutté ?', 'Le poids net égoutté. Quand un aliment est vendu dans un liquide, l’emballage doit l’indiquer : c’est la quantité que vous mangerez vraiment.'],
    ['Un grand format est-il toujours moins cher au kilo ?', 'Non. Comparez toujours le prix au kilo des deux formats, et ne prenez le grand que si vous êtes sûr de tout finir.'],
    ['Qu’est-ce que la réduflation ?', 'C’est une baisse de la quantité d’un produit sans baisse de prix. Depuis le 1er juillet 2024, les magasins à dominante alimentaire doivent la signaler en rayon pendant 2 mois.'],
  ],
  sources: [
    ['Professionnels : quelles sont vos obligations en matière d’affichage des prix ? (economie.gouv.fr)', 'https://www.economie.gouv.fr/entreprises/gerer-son-entreprise-au-quotidien/gerer-un-commerce/professionnels-quelles-sont-vos-obligations-en-matiere-daffichage-des-prix'],
    ['L’information sur les prix pour certains biens et services (Institut national de la consommation)', 'https://www.inc-conso.fr/node/9762'],
    ['Règlement (UE) n° 1169/2011, annexe IX : poids net égoutté (EUR-Lex)', 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32011R1169'],
    ['La réduflation encadrée à partir du 1er juillet (info.gouv.fr)', 'https://www.info.gouv.fr/actualite/la-reduflation-encadree-a-partir-du-1er-juillet'],
    ['Réduflation : les distributeurs doivent vous informer (Institut national de la consommation)', 'https://www.inc-conso.fr/content/pratique-de-shrinkflation-ou-reduflation-les-distributeurs-doivent-vous-informer'],
    ['Emballages libres : surveillez le prix au kilo (Que Choisir)', 'https://www.quechoisir.org/actualite-emballages-libres-surveillez-le-prix-au-kilo-n9711'],
  ],
} satisfies Article;
