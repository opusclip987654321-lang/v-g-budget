import type { Article } from '@/lib/blog-articles';
import { cost, kiloPrice } from '@/lib/blog-cost';
import { ingredients } from '@/lib/catalog';
import { findRecipe } from '@/lib/seo';

// Légumes de décembre présents dans le catalogue (prix relevés sur carrefour.fr).
const ligne = (nom: string, id: string) => `| ${nom} | ${kiloPrice(id)} |`;
const tableau = [
  '| Légume | Prix |',
  '|---|---|',
  ligne('Pommes de terre', 'potato'),
  ligne('Oignons', 'onion'),
  ligne('Chou blanc', 'cabbage'),
  ligne('Carottes', 'carrot'),
  ligne('Courge', 'squash'),
].join('\n');
const ingredient = (id: string) => {
  const i = ingredients.find(x => x.id === id);
  if (!i || i.unit !== 'g') throw new Error(`Ingrédient ${id} absent : revoir /blog/fruits-legumes-decembre.`);
  return i;
};
const kg = (id: string) => ingredient(id).price / ingredient(id).pack * 1000;
// Le texte dit que pommes de terre, oignons, chou et carottes coûtent moins de 2 € le kilo et que la courge est la plus chère :
// si un relevé change cela, la construction échoue.
const racines = Math.max(kg('potato'), kg('onion'), kg('cabbage'), kg('carrot'));
if (!(racines < 2 && kg('squash') > racines))
  throw new Error('Les prix du catalogue ont changé : revoir les comparaisons de /blog/fruits-legumes-decembre.');

// Grammes de chou et de courge utilisés par recette, lus dans le catalogue.
const grammes = (recette: string, ing: string) => {
  const q = findRecipe(recette)?.ingredients.find(x => x.id === ing)?.qty;
  if (!q) throw new Error(`Plus de ${ing} dans ${recette} : revoir /blog/fruits-legumes-decembre.`);
  return q;
};
const chou = ingredient('cabbage').pack;
const courge = ingredient('squash').pack;
const chouColeslaw = grammes('coleslaw-pois-chiches', 'cabbage');
const chouPoelee = grammes('poelee-chou', 'cabbage');
const chouMinestrone = grammes('minestrone-haricots', 'cabbage');
const courgeCurry = grammes('curry-courge-haricots', 'squash');
const courgeVeloute = grammes('courge-lentilles', 'squash');
const fmt = (g: number) => (g >= 1000 ? `${String(g / 1000).replace('.', ',')} kg` : `${g} g`);
// Le texte dit que les 3 recettes au chou en utilisent au plus la moitié, et que le curry et le velouté tiennent dans une courge.
if (chouColeslaw + chouPoelee + chouMinestrone > chou / 2 || courgeCurry + courgeVeloute > courge)
  throw new Error('Les quantités de chou ou de courge ont changé : revoir /blog/fruits-legumes-decembre.');

export default {
  slug: 'fruits-legumes-decembre',
  title: 'Fruits et légumes de décembre : la liste et des dîners pas chers',
  seoTitle: 'Fruits et légumes de décembre : liste et dîners pas chers',
  description: 'Fruits et légumes de décembre : la liste du mois d’après l’Ademe, leur prix au kilo et des dîners sans viande au chou, à la courge et aux carottes.',
  lead: 'Les fruits et légumes de décembre sont ceux de l’hiver : chou, poireau, carotte, céleri, endive, courge, panais et mâche, avec la pomme, la poire, le kiwi, la clémentine et l’orange. Voici la liste du mois, le prix au kilo des légumes de nos recettes et des dîners sans viande pour les cuisiner.',
  category: 'Saisons',
  keywords: ['fruits et légumes de décembre', 'légumes de saison décembre', 'fruits de saison décembre', 'que manger en décembre', 'légumes d’hiver pas chers', 'fruits et légumes de saison décembre'],
  date: '2026-11-20',
  coverAlt: 'Fruits et légumes de décembre : chou, courge, poireau, carotte, pomme, oranges, clémentines et kiwis sur une planche',
  body: `
@essentiel
- **Légumes de décembre** : chou, poireau, carotte, céleri, endive, courge, panais, mâche.
- **Fruits de décembre** : pomme, poire, kiwi, clémentine et orange.
- **Les moins chers de nos recettes** : pommes de terre, oignons, chou et carottes, tous à moins de 2 € le kilo.
- **Un chou ou une courge** suffit pour plusieurs dîners de la semaine.

@chiffres ${kiloPrice('potato')} | les pommes de terre ; ${kiloPrice('cabbage')} | le chou blanc ; ${cost('coleslaw-pois-chiches')} | la portion de coleslaw au chou

## Quels sont les fruits et légumes de décembre ?

En décembre, on mange les légumes d’hiver et les agrumes. Repères pour la France métropolitaine, d’après le calendrier de l’Ademe :

| | Légumes | Fruits |
|---|---|---|
| **De saison** | Chou, poireau, carotte, céleri, endive, courge, panais, mâche | Pomme, poire, kiwi, clémentine |
| **Nouveau ce mois-ci** | | Orange |
| **Presque toute l’année** | Pomme de terre, oignon, ail | |

Les saisons varient selon les régions et la météo. Le mois précédent est dans notre article [fruits et légumes de novembre](/blog/fruits-legumes-novembre), et l’année entière dans le [calendrier des fruits et légumes de saison](/blog/fruits-legumes-de-saison).

## Quels légumes de saison en décembre sont les moins chers ?

Dans nos relevés, pommes de terre, oignons, chou et carottes restent les moins chers. La courge coûte plus cher au kilo, mais une seule courge fait deux dîners.

${tableau}

> Prix relevés le 7 octobre 2026 sur carrefour.fr, marques distributeur, hors promotions.

## Que manger en décembre le soir, sans viande et pas cher ?

Quatre dîners avec des légumes de décembre. Le montant affiché est le coût estimé des ingrédients par portion.

@recette curry-courge-haricots | Courge et haricots blancs au lait de coco, servis avec du riz. D’autres idées dans nos [recettes de courge faciles](/blog/courge-recette-facile).

@recette coleslaw-pois-chiches | Chou émincé, carottes râpées, pois chiches et sauce au yaourt citronné, avec des croûtons dorés à la poêle.

@cta-court Chou, courge, carottes : VégéBudget compose vos dîners sans viande de la semaine selon votre budget et vous donne la liste de courses avec son montant estimé.

@recette pois-chiches-rotis | Pommes de terre, carottes et pois chiches rôtis sur une seule plaque, avec une sauce au yaourt.

@recette riz-lentilles-oignons | Riz et lentilles vertes cuits ensemble, oignons bien dorés à la poêle, carottes râpées et yaourt citronné à côté.

## Quels fruits de saison manger en décembre ?

- **Clémentines** : l’interprofession des fruits et légumes, Interfel, en fait la vedette de décembre.
- **Oranges** : elles arrivent ce mois-ci, à presser ou à manger en quartiers.
- **Kiwis** : toujours de saison.
- **Pommes et poires** : à croquer ou en compote.

Manger Bouger rappelle qu’une portion de fruits ou de légumes pèse 80 à 100 g pour un adulte, qu’ils soient frais, surgelés ou en conserve.

## Comment finir un chou entier ou une courge entière en décembre ?

![Poêlée de chou blanc, de pommes de terre et de haricots blancs dans une assiette](/images/recettes/poelee-chou.jpg "La poêlée de chou : l’un des trois dîners qui se partagent le même chou.")

Avec un légume entier, c’est souvent le reste qui finit à la poubelle. En le partageant entre plusieurs recettes, on l’utilise jusqu’au bout :

- **Le chou** (${fmt(chou)} dans nos relevés) : ${chouColeslaw} g pour le [coleslaw](/recettes/coleslaw-pois-chiches), ${chouPoelee} g pour la [poêlée de chou](/recettes/poelee-chou) et ${chouMinestrone} g pour le [minestrone](/recettes/minestrone-haricots). Il en reste au moins la moitié pour d’autres repas.
- **La courge** (${fmt(courge)}) : ${courgeCurry} g pour le [curry](/recettes/curry-courge-haricots) et ${courgeVeloute} g pour le [velouté de courge](/recettes/courge-lentilles), deux dîners la même semaine.
- **Les carottes** : dans le coleslaw, la plaque rôtie, le riz aux lentilles et le minestrone.
- **Les pommes de terre** : dans la plaque rôtie, la poêlée de chou et le minestrone.

VégéBudget compte les paquets entiers dans le prix de la semaine : il favorise donc les dîners qui finissent le chou ou la courge déjà achetés. D’autres conseils dans notre article sur le [gaspillage alimentaire](/blog/gaspillage-alimentaire), et des idées de [soupes maison pas chères](/blog/soupe-maison-pas-chere) pour les soirs froids.

## D’autres recettes pas chères avec des légumes d’hiver

@recettes poelee-chou, courge-lentilles, minestrone-haricots

Pour organiser toute une semaine, consultez notre [menu de la semaine pas cher](/blog/menu-semaine-pas-cher) ou toutes nos [recettes](/recettes).

@cta Organisez vos dîners de la semaine
`,
  faq: [
    ['Quels légumes sont de saison en décembre ?', 'En décembre : chou, poireau, carotte, céleri, endive, courge, panais et mâche, d’après le calendrier de l’Ademe pour la France métropolitaine. Pommes de terre, oignons et ail se trouvent toute l’année.'],
    ['Quels fruits manger en décembre ?', 'Pommes, poires, kiwis, clémentines et oranges, d’après le calendrier de l’Ademe. L’orange est le fruit qui arrive ce mois-ci.'],
    ['La clémentine est-elle de saison en décembre ?', 'Oui. Elle est dans le calendrier de l’Ademe pour décembre, et Interfel, l’interprofession des fruits et légumes, la présente comme la vedette du mois.'],
    ['Quels légumes de décembre sont les moins chers ?', `Dans nos relevés carrefour.fr du 7 octobre 2026 (marques distributeur), les pommes de terre coûtent ${kiloPrice('potato')}, les oignons ${kiloPrice('onion')}, le chou blanc ${kiloPrice('cabbage')} et les carottes ${kiloPrice('carrot')}. La courge revient à ${kiloPrice('squash')}.`],
  ],
  sources: [
    ['Fruits et légumes de saison, mois par mois (Impact CO₂, Ademe)', 'https://impactco2.fr/outils/fruitsetlegumes'],
    ['Tendances de décembre : la clémentine, vedette de la saison (Interfel, communiqué de décembre 2024)', 'https://interfel.com/wp-content/media/2024/12/Cp-Interfel-Tendance_decembre.pdf'],
    ['Augmenter les fruits et légumes (Manger Bouger)', 'https://www.mangerbouger.fr/l-essentiel/les-recommandations-sur-l-alimentation-l-activite-physique-et-la-sedentarite/augmenter/augmenter-les-fruits-et-legumes'],
  ],
} satisfies Article;
