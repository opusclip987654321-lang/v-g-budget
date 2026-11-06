import type { Article } from '@/lib/blog-articles';
import { cost, kiloPrice } from '@/lib/blog-cost';
import { ingredients } from '@/lib/catalog';

// Légumes de novembre présents dans le catalogue (prix relevés sur carrefour.fr).
const ligne = (nom: string, id: string) => `| ${nom} | ${kiloPrice(id)} |`;
const tableau = [
  '| Légume de novembre | Prix |',
  '|---|---|',
  ligne('Pommes de terre', 'potato'),
  ligne('Oignons', 'onion'),
  ligne('Chou blanc', 'cabbage'),
  ligne('Carottes', 'carrot'),
  ligne('Courge', 'squash'),
].join('\n');
// Le texte dit que pommes de terre, oignons, chou et carottes coûtent moins de 2 € le kilo et que la courge est la plus chère :
// si un relevé change cela, la construction échoue.
const kg = (id: string) => { const i = ingredients.find(x => x.id === id); if (!i) throw new Error(`Ingrédient inconnu : ${id}`); return i.price / i.pack * 1000; };
if (!(Math.max(kg('potato'), kg('onion'), kg('cabbage'), kg('carrot')) < 2 && kg('squash') > Math.max(kg('potato'), kg('onion'), kg('cabbage'), kg('carrot'))))
  throw new Error('Les prix du catalogue ont changé : revoir les comparaisons de /blog/fruits-legumes-novembre.');

export default {
  slug: 'fruits-legumes-novembre',
  title: 'Fruits et légumes de novembre : la liste et 5 dîners pas chers',
  seoTitle: 'Fruits et légumes de novembre : liste et dîners pas chers',
  description: 'Fruits et légumes de novembre : la liste du mois d’après l’Ademe, leur prix au kilo et 5 dîners sans viande au chou, à la courge et aux carottes.',
  lead: 'Les fruits et légumes de novembre, ce sont les courges, les choux, les poireaux, les carottes, le céleri, l’endive et les topinambours, avec les pommes, les poires, les kiwis et les premières clémentines. Voici la liste du mois, le prix au kilo de ceux de nos recettes et 5 dîners sans viande pour les cuisiner.',
  category: 'Saisons',
  keywords: ['fruits et légumes de novembre', 'légumes de saison novembre', 'fruits de saison novembre', 'que manger en novembre', 'légumes de novembre recette pas cher', 'fruits et légumes de saison novembre'],
  date: '2026-11-06',
  coverAlt: 'Fruits et légumes de novembre : courge, chou, poireau, carottes, pomme, clémentines et châtaignes sur une cagette',
  body: `
@essentiel
- **Légumes de novembre** : courge, chou, poireau, carotte, céleri, endive, panais, topinambour, salsifis.
- **Fruits de novembre** : pomme, poire, kiwi, clémentine, mandarine, et les dernières châtaignes.
- **Les moins chers de nos recettes** : pommes de terre, oignons, chou et carottes, tous à moins de 2 € le kilo.
- **Un chou ou une courge** fait plusieurs dîners de la semaine.

@chiffres ${kiloPrice('potato')} | les pommes de terre ; ${kiloPrice('cabbage')} | le chou blanc ; ${cost('poelee-chou')} | la portion de poêlée de chou

## Quels sont les fruits et légumes de novembre ?

Novembre est le mois des légumes d’hiver : courges, choux, racines. Côté fruits, les agrumes arrivent. Repères pour la France métropolitaine, d’après le calendrier de l’Ademe :

| | Légumes | Fruits |
|---|---|---|
| **Nouveaux** | Topinambour, salsifis | Clémentine, mandarine, kiwi |
| **Toujours là** | Courge, potiron, chou, chou-fleur, poireau, carotte, céleri, endive, panais, betterave, navet, mâche, pomme de terre, oignon | Pomme, poire |
| **Dernières semaines** | Brocoli, fenouil | Châtaigne, noisette |

Les saisons varient selon les régions et la météo. Le calendrier des 12 mois est dans notre article [fruits et légumes de saison](/blog/fruits-legumes-de-saison).

## Quels légumes de saison en novembre sont les moins chers ?

Dans nos relevés, les légumes de garde restent les plus abordables. La courge coûte plus cher au kilo, mais une seule courge sert à plusieurs repas.

${tableau}

> Prix relevés le 7 octobre 2026 sur carrefour.fr, marques distributeur, hors promotions.

## Que manger en novembre le soir, sans viande et pas cher ?

![Une courge butternut, un petit potiron et un chou vert sur un plan de travail en bois](/images/blog/fruits-legumes-de-saison-octobre.jpg "Courges et chou : les légumes de base de novembre.")

Cinq dîners à base de légumes de novembre. Le montant affiché est le coût estimé des ingrédients par portion.

@recette poelee-chou | Chou, pommes de terre et haricots blancs dans une seule poêle, avec du paprika.

@recette courge-lentilles | Courge et lentilles corail mixées : une soupe épaisse qui fait un vrai dîner. Plus d’idées dans nos [recettes de courge faciles](/blog/courge-recette-facile).

@recette minestrone-haricots | Carottes, pommes de terre, chou, pâtes et haricots blancs : une soupe-repas d’automne.

@cta-court Courge, chou, carottes : VégéBudget compose vos dîners sans viande de la semaine selon votre budget et vous donne la liste de courses avec son montant estimé. Première semaine gratuite, sans compte.

@recette mijote-lentilles | Lentilles vertes, carottes et pommes de terre mijotées 30 min dans une seule casserole.

@recette hachis-lentilles | Lentilles et carottes à la tomate sous une purée de pommes de terre, au four.

## Quels fruits de saison manger en novembre ?

- **Pommes et poires** : toujours là, à croquer ou en compote.
- **Kiwis** : leur saison commence.
- **Clémentines et mandarines** : les premières arrivent en novembre.
- **Châtaignes** : leurs dernières semaines.

Pour en manger assez, Manger Bouger rappelle qu’une portion de fruits ou de légumes pèse 80 à 100 g pour un adulte, qu’ils soient frais, surgelés ou en conserve.

## Comment cuisiner un chou ou une courge entière sans gaspiller ?

Avec un légume entier, c’est souvent le reste qui finit à la poubelle. En le partageant entre deux recettes, on l’utilise jusqu’au bout :

- **Le chou** (1,5 kg dans nos relevés) : 300 g pour la [poêlée de chou](/recettes/poelee-chou) et 150 g pour le [minestrone](/recettes/minestrone-haricots), deux dîners la même semaine.
- **La courge** (1 kg) : 450 g par [velouté de courge](/recettes/courge-lentilles), donc deux soupes.
- **Les carottes et les pommes de terre** : elles reviennent dans le mijoté, le hachis et le minestrone.

C’est ce que fait VégéBudget : il compte les paquets entiers dans le prix de la semaine, donc il favorise les dîners qui finissent le chou ou la courge déjà achetés. D’autres conseils dans notre article sur le [gaspillage alimentaire](/blog/gaspillage-alimentaire). Après la saison du brocoli, les [légumes surgelés](/blog/legumes-surgeles-prix) prennent le relais.

## D’autres recettes pas chères avec des légumes de novembre

@recettes galettes-lentilles, salade-lentilles, bowl-arc-en-ciel

Pour organiser toute une semaine, voyez notre [menu de la semaine pas cher](/blog/menu-semaine-pas-cher) ou toutes nos [recettes](/recettes).

@cta Organisez vos dîners de la semaine
`,
  faq: [
    ['Quels légumes sont de saison en novembre ?', 'En novembre : courge, potiron, chou, chou-fleur, poireau, carotte, céleri, endive, panais, betterave, navet, mâche, pomme de terre et oignon. Le topinambour et le salsifis arrivent, le brocoli et le fenouil finissent leur saison (calendrier de l’Ademe).'],
    ['Quels fruits manger en novembre ?', 'Pommes, poires, kiwis, clémentines et mandarines, ainsi que les dernières châtaignes et noisettes, d’après le calendrier de l’Ademe pour la France métropolitaine.'],
    ['Le kiwi est-il de saison en novembre ?', 'Oui. Selon le calendrier de l’Ademe, la saison du kiwi commence en novembre, comme celle des clémentines et des mandarines.'],
    ['Quels légumes de novembre sont les moins chers ?', `Dans nos relevés carrefour.fr du 7 octobre 2026 (marques distributeur), les pommes de terre coûtent ${kiloPrice('potato')}, les oignons ${kiloPrice('onion')}, le chou blanc ${kiloPrice('cabbage')} et les carottes ${kiloPrice('carrot')}. La courge revient à ${kiloPrice('squash')}.`],
  ],
  sources: [
    ['Fruits et légumes de saison, mois par mois (Impact CO₂, Ademe)', 'https://impactco2.fr/outils/fruitsetlegumes'],
    ['Augmenter les fruits et légumes (Manger Bouger)', 'https://www.mangerbouger.fr/l-essentiel/les-recommandations-sur-l-alimentation-l-activite-physique-et-la-sedentarite/augmenter/augmenter-les-fruits-et-legumes'],
  ],
} satisfies Article;
