import type { Article } from '@/lib/blog-articles';
import { cost, kiloPrice, packPrice } from '@/lib/blog-cost';
import { money, roundMoney } from '@/lib/planner';
import { weekPlan } from '@/lib/semaine-type';

// Panier de la semaine type du blog (lib/semaine-type.ts, 2 adultes, 7 jours, 3 repas par jour) :
// tous les montants sont calculés avec les prix du catalogue, rien n'est écrit en dur.
const w = weekPlan();
// L'article répond « oui » : si un relevé de prix fait passer le panier à 50 € ou plus, la construction échoue.
if (w.purchase >= 50) throw new Error(`Le panier de la semaine type coûte ${w.purchase} € : réécrire /blog/courses-50-euros-par-semaine.`);
const rayons: [string, string, string[]][] = [
  ['Légumes secs', 'lentilles, pois chiches, haricots rouges', ['green-lentils', 'chickpeas', 'kidney']],
  ['Féculents', 'riz, pâtes, semoule, pain', ['rice', 'pasta', 'couscous', 'bread']],
  ['Légumes', 'carottes, oignons, pommes de terre, épinards, tomates, ail, citron', ['carrot', 'onion', 'potato', 'spinach', 'tomato', 'garlic', 'lemon']],
  ['Petit-déjeuner', 'yaourt de soja, beurre de cacahuète', ['yogurt', 'peanut']],
  ['Placard', 'huile, sel, cumin, curry', ['oil', 'salt', 'cumin', 'curry']],
];
const rayon = (ids: string[]) => money(roundMoney(w.items.filter(i => ids.includes(i.id)).reduce((s, i) => s + i.purchaseCost, 0)));
const rayonTable = [
  '| Rayon | Ce qu’on achète | Montant |',
  '|---|---|---|',
  ...rayons.map(([name, what, ids]) => `| ${name} | ${what} | ${rayon(ids)} |`),
  `| **Total** | 7 jours, 2 adultes | **${money(w.purchase)}** |`,
].join('\n');
const margin = money(roundMoney(50 - w.purchase));

export default {
  slug: 'courses-50-euros-par-semaine',
  title: 'Faire ses courses avec 50 € par semaine à deux : notre panier calculé',
  seoTitle: 'Courses 50 euros par semaine : le vrai panier pour 2',
  description: 'Courses 50 euros par semaine pour 2 : notre panier sans viande de 7 jours chiffré rayon par rayon, ce qu’il ne couvre pas et les bons réflexes.',
  lead: `Oui, faire ses courses avec 50 € par semaine à deux est possible si les repas sont sans viande et préparés à l’avance : notre semaine type de 3 repas par jour pour 2 adultes revient à ${money(w.purchase)} en paquets entiers. Il reste alors ${margin} pour les fruits, le café ou les imprévus.`,
  category: 'Budget',
  keywords: ['courses 50 euros par semaine', 'faire ses courses avec 50 euros par semaine', 'liste de courses 50 euros par semaine', '50 euros de courses par semaine pour 2', 'budget courses couple par semaine', 'menu semaine moins de 50 euros'],
  date: '2026-10-21',
  coverAlt: 'Courses 50 euros par semaine : un panier avec un bocal de pâtes, des boîtes de tomates et de pois chiches, des carottes et un ticket de caisse',
  body: `
@essentiel
- **Notre panier de 7 jours pour 2 adultes** coûte ${money(w.purchase)} : petit-déjeuner, midi et soir, sans viande.
- **La méthode** : cuisiner 4 portions le soir et manger le reste le lendemain midi.
- **Les légumes secs** (lentilles, pois chiches, haricots rouges) remplacent la viande.
- **Non compris** : fruits frais, café, boissons, produits d’hygiène. Gardez la marge pour eux.

@chiffres ${money(w.purchase)} | le panier de la semaine ; ${money(w.perPersonDay)} | d’ingrédients par personne et par jour ; ${money(w.leftoverValue)} | de produits entamés pour la suite

## 50 euros de courses par semaine pour 2, est-ce possible ?

Oui, nous avons fait le calcul. Notre [menu de la semaine pas cher](/blog/menu-semaine-pas-cher) nourrit 2 adultes pendant 7 jours, 3 repas par jour, pour ${money(w.purchase)} de courses. Si vous avez déjà l’huile, le sel et les épices, le panier tombe à ${money(w.withoutPantry)}.

Ces montants comptent les paquets entiers, comme à la caisse. Les ingrédients réellement mangés dans la semaine valent ${money(w.used)} : le reste (${money(w.leftoverValue)}) part dans les placards pour la semaine suivante. Coût estimé des ingrédients : prix relevés le 7 octobre 2026 sur carrefour.fr, marques distributeur, hors promotions.

## Que mettre sur une liste de courses à 50 euros par semaine ?

${rayonTable}

Les légumes secs coûtent peu pour beaucoup d’assiettes : les lentilles vertes sèches reviennent à ${kiloPrice('green-lentils')}, les pois chiches en boîte à ${packPrice('chickpeas')}. D’autres idées pour [remplacer la viande pas cher](/blog/remplacer-la-viande-pas-cher).

![Poêlée d’épinards et de pois chiches servie avec du riz](/images/recettes/epinards-pois-chiches.jpg "Épinards surgelés, pois chiches et riz : ${cost('epinards-pois-chiches')} la portion.")

## Quels dîners pour une semaine à moins de 50 euros ?

Les dîners de notre semaine type reprennent des recettes du site, parfois simplifiées. Chacun est cuisiné en 4 portions : 2 le soir, 2 le lendemain midi. Plus d’idées dans nos [repas pas chers pour 2](/blog/repas-pas-cher-pour-2).

@recette mijote-lentilles | Lentilles vertes, carottes et pommes de terre : le dîner du lundi, avec du cumin à la place du paprika.

@recette epinards-pois-chiches | Les épinards surgelés reviennent à ${kiloPrice('spinach')} et ne se perdent pas au fond du frigo.

@recette chili-haricots | Dans notre semaine, sans maïs ni poivron : des haricots rouges en conserve, rincés puis ajoutés à la sauce tomate.

@recette semoule-pois | Ici, les petits pois sont remplacés par des pois chiches : un plat de placard qui se réchauffe bien le midi.

@cta-court Avec 50 € par semaine, chaque paquet compte : VégéBudget prépare vos dîners sans viande selon votre budget, tient compte de ce que vous avez déjà et vous donne la liste de courses avec son montant estimé. La première semaine est gratuite.

## Qu’est-ce que ce budget ne couvre pas ?

Notre panier ne contient que les repas. Avec la marge de ${margin}, prévoyez :

- **Les fruits** : choisissez ceux de saison, souvent moins chers (voir notre article sur les [fruits et légumes de saison](/blog/fruits-legumes-de-saison)).
- **Le café, le thé et les boissons**.
- **Les imprévus** : un invité, un plat raté, un paquet de pâtes en plus.
- **L’hygiène et l’entretien** : à prévoir à part, ils ne sont pas dans ce budget.

## Comment tenir son budget courses en couple ?

- **Faites le tour des placards avant d’écrire la liste** : les produits entamés font baisser la note suivante.
- **Écrivez les dîners avant la liste**, puis tenez-vous-y en magasin.
- **Comparez le prix au kilo** indiqué sur l’étiquette, pas le prix du paquet.
- **Prenez les marques distributeur** pour le riz, les pâtes, les conserves et les surgelés.
- **Mangez des légumes secs au moins 2 fois par semaine**, comme le conseille Manger Bouger. Dans ce panier, ce sont eux qui remplacent la viande.
- **Gardez les restes pour le midi** : moins de gaspillage, et un repas de moins à acheter (voir notre article sur le [gaspillage alimentaire](/blog/gaspillage-alimentaire)).

> En fin de mois, quand il ne reste que le placard, piochez dans nos idées de [dîners de fin de mois](/blog/que-manger-fin-de-mois).

## D’autres dîners pas chers pour changer

@recettes riz-saute, soupe-petits-pois, salade-lentilles

@cta Préparez vos menus en fonction de votre budget
`,
  faq: [
    ['50 € de courses par semaine, est-ce suffisant pour un couple ?', `Pour les repas, oui, s’ils sont sans viande et préparés à l’avance. Notre semaine type de 3 repas par jour pour 2 adultes revient à ${money(w.purchase)} en paquets entiers, prix relevés le 7 octobre 2026 sur carrefour.fr. Les fruits, le café et l’hygiène sont à ajouter.`],
    ['Combien coûte un repas par personne avec ce budget ?', `Dans notre semaine type, les ingrédients mangés reviennent à ${money(w.perPortion)} par repas et par personne, soit ${money(w.perPersonDay)} par jour pour les 3 repas. Le panier acheté est un peu plus cher, car il comprend des paquets entiers qui serviront la semaine suivante.`],
    ['Cette méthode marche-t-elle pour une personne seule ?', 'Oui, le principe est le même : cuisinez 2 portions le soir et gardez la seconde pour le lendemain midi. Les paquets entiers durent alors plus longtemps.'],
    ['Comment remplacer la viande pour tenir 50 € par semaine ?', 'Par des légumes secs : lentilles, pois chiches ou haricots rouges, avec des pâtes, du riz ou de la semoule. Nos idées sont dans l’article « Remplacer la viande pas cher ».'],
  ],
  sources: [
    ['Augmenter les légumes secs (Manger Bouger, Santé publique France)', 'https://www.mangerbouger.fr/l-essentiel/les-recommandations-sur-l-alimentation-l-activite-physique-et-la-sedentarite/augmenter/augmenter-les-legumes-secs'],
  ],
} satisfies Article;
