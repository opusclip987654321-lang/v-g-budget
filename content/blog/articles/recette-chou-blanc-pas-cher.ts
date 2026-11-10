import type { Article } from '@/lib/blog-articles';
import { amountPrice, cost, kiloPrice, packPrice } from '@/lib/blog-cost';
import { ingredients } from '@/lib/catalog';
import { findRecipe, portionCost } from '@/lib/seo';

// Les 3 recettes du catalogue (lib/catalog.ts) qui contiennent du chou blanc, pour 2 personnes.
// Les grammes de chou sont lus dans le catalogue : rien n'est écrit en dur.
const CHOU = ['poelee-chou', 'minestrone-haricots', 'coleslaw-pois-chiches'];
const grammes = (id: string) => {
  const r = findRecipe(id);
  const x = r?.ingredients.find(y => y.id === 'cabbage');
  if (!x) throw new Error(`Plus de chou dans ${id} : revoir /blog/recette-chou-blanc-pas-cher.`);
  return x.qty;
};
const chou = ingredients.find(i => i.id === 'cabbage');
if (!chou || chou.unit !== 'g') throw new Error('Chou blanc absent du catalogue : revoir /blog/recette-chou-blanc-pas-cher.');
const total = CHOU.reduce((s, id) => s + grammes(id), 0);
// Le texte dit que les 3 recettes utilisent la moitié du chou, donc qu'un chou fait ces 3 dîners deux fois.
if (total * 2 !== chou.pack) throw new Error('Les 3 recettes n’utilisent plus la moitié du chou : revoir /blog/recette-chou-blanc-pas-cher.');
// Le texte dit que la poêlée est la moins chère des trois et que le chou coûte moins de 2 € le kilo.
const portion = (id: string) => portionCost(findRecipe(id)!);
if (CHOU.some(id => id !== 'poelee-chou' && portion(id) <= portion('poelee-chou'))) throw new Error('La poêlée n’est plus la moins chère : revoir /blog/recette-chou-blanc-pas-cher.');
if (chou.price / chou.pack * 1000 >= 2) throw new Error('Le chou dépasse 2 € le kilo : revoir /blog/recette-chou-blanc-pas-cher.');

export default {
  slug: 'recette-chou-blanc-pas-cher',
  title: 'Recette de chou blanc pas chère : 3 dîners sans viande et leur coût',
  seoTitle: 'Recette chou blanc pas chère : 3 dîners et leur coût',
  description: 'Recette de chou blanc pas chère : poêlée, minestrone et coleslaw sans viande, coût par portion, et comment choisir et conserver un chou entier.',
  lead: `Pour une recette de chou blanc pas chère, faites une poêlée de chou, de pommes de terre et de haricots blancs : 30 min et ${cost('poelee-chou')} la portion. Un chou blanc coûte ${packPrice('cabbage')} dans nos relevés et suffit pour plusieurs dîners dans la semaine.`,
  category: 'Saisons',
  keywords: ['recette chou blanc pas chère', 'recette chou blanc', 'que faire avec un chou blanc', 'chou blanc sans viande', 'conserver un chou blanc entamé', 'congeler du chou blanc', 'chou blanc cru ou cuit'],
  date: '2026-11-10',
  coverAlt: 'Recette de chou blanc pas chère : un chou blanc entier, du chou émincé sur une planche et un bol de poêlée',
  body: `
@essentiel
- **La moins chère** : une poêlée de chou, de pommes de terre et de haricots blancs, ${cost('poelee-chou')} la portion.
- **Un chou de ${(chou.pack / 1000).toLocaleString('fr-FR')} kg** permet de faire deux fois la poêlée, le minestrone et le coleslaw pour 2.
- **Entier**, il se garde environ une semaine au bac à légumes ; entamé, emballez-le et finissez-le en premier.
- **Cru ou cuit** : en salade comme à la poêle, il ne coûte presque rien.

@chiffres ${kiloPrice('cabbage')} | le chou blanc au kilo ; ${cost('poelee-chou')} | la portion de poêlée ; environ 1 semaine | au bac à légumes, selon Interfel

## Quelles recettes de chou blanc pas chères pour le dîner ?

Nos trois recettes de chou blanc sont sans viande. Les haricots ou les pois chiches en font un vrai plat, et non un simple accompagnement.

@recette poelee-chou | Le chou cuit à couvert avec un oignon, puis rejoint les pommes de terre précuites et les haricots blancs. Paprika, sel : c’est prêt.

@recette minestrone-haricots | Une soupe-repas avec carottes, pommes de terre, chou, tomates, pâtes et haricots blancs. Elle se réchauffe le lendemain.

@recette coleslaw-pois-chiches | Du chou cru émincé, des carottes râpées, des pois chiches et une sauce au yaourt et au citron, avec des croûtons.

@cta-court Un demi-chou au réfrigérateur ? Indiquez-le dans VégéBudget : il compose les dîners de la semaine avec ce que vous avez déjà, selon votre budget.

## Combien coûte un chou blanc et combien de repas fait-il ?

Dans nos relevés, le chou blanc coûte ${packPrice('cabbage')}, soit ${kiloPrice('cabbage')}. C’est l’un des légumes les moins chers de nos recettes, comme le montre notre [calendrier des fruits et légumes de novembre](/blog/fruits-legumes-novembre).

| Recette pour 2 | Chou utilisé | Prix de ce chou |
|---|---|---|
| Poêlée de chou | ${grammes('poelee-chou')} g | ${amountPrice('cabbage', grammes('poelee-chou'))} |
| Minestrone | ${grammes('minestrone-haricots')} g | ${amountPrice('cabbage', grammes('minestrone-haricots'))} |
| Coleslaw | ${grammes('coleslaw-pois-chiches')} g | ${amountPrice('cabbage', grammes('coleslaw-pois-chiches'))} |

Les trois dîners utilisent ${total} g, la moitié du chou. Avec le reste, refaites les mêmes plats la semaine suivante ou piochez dans les idées ci-dessous.

Coût estimé des ingrédients : prix relevés le 7 octobre 2026 sur carrefour.fr, marques distributeur, hors promotions. En caisse, vous payez le chou entier.

## Que faire avec un chou blanc entamé ?

- **Une soupe** : quelques poignées de chou émincé avec des pommes de terre, comme dans nos [soupes maison pas chères](/blog/soupe-maison-pas-chere).
- **Un riz sauté** : du chou émincé avec l’oignon et la carotte de notre [riz sauté à la sauce soja](/recettes/riz-saute).
- **Une salade du lendemain** : chou cru, carottes râpées, une vinaigrette.
- **Un curry** : quelques lamelles cuites avec la courge de notre [curry de courge et de haricots blancs](/recettes/curry-courge-haricots).

Pour d’autres réflexes anti-gaspi, lisez notre article sur le [gaspillage alimentaire](/blog/gaspillage-alimentaire).

## Comment choisir, conserver et congeler un chou blanc ?

- **Au magasin** : prenez un chou lourd et dense, aux feuilles bien serrées (Interfel).
- **Entier** : environ une semaine dans le bac à légumes du réfrigérateur, selon Interfel.
- **Entamé** : enveloppez la partie coupée dans un film ou mettez-la dans une boîte hermétique (Interfel), et cuisinez-la en premier.
- **Au congélateur** : c’est possible si vous le blanchissez d’abord, indique Test-Achats.

> Le chou est de saison en novembre, selon le calendrier de l’Ademe : c’est le bon moment pour en acheter un entier.

## Chou blanc cru ou cuit : lequel choisir ?

Les deux. Cuit, il devient tendre et se marie avec les pommes de terre et les haricots. Cru, il reste croquant : émincez-le très finement, salez-le, laissez-le reposer 5 min puis égouttez-le, comme dans notre [coleslaw de chou et de pois chiches](/recettes/coleslaw-pois-chiches).

![Coleslaw de chou blanc, de carottes et de pois chiches servi dans un saladier](/images/recettes/coleslaw-pois-chiches.jpg "Le coleslaw : du chou cru, des pois chiches et une sauce au yaourt.")

Si vous aimez les légumes d’hiver à petit prix, nos [recettes de courge faciles](/blog/courge-recette-facile) reposent sur la même idée : un légume entier, plusieurs dîners.

## Nos dîners au chou blanc

@recettes poelee-chou, minestrone-haricots, coleslaw-pois-chiches

@cta Organisez vos dîners de la semaine
`,
  faq: [
    ['Combien de temps se conserve un chou blanc entier ?', 'Environ une semaine dans le bac à légumes du réfrigérateur, selon Interfel. Choisissez-le lourd et dense, aux feuilles bien serrées.'],
    ['Comment conserver un chou blanc entamé ?', 'Enveloppez la partie coupée dans un film ou mettez-la dans une boîte hermétique, au réfrigérateur, selon Interfel, et cuisinez-la avant le reste de vos légumes.'],
    ['Peut-on congeler du chou blanc ?', 'Oui, après l’avoir blanchi, selon Test-Achats.'],
    ['Quand le chou blanc est-il de saison ?', 'Le chou fait partie des légumes de saison en novembre selon le calendrier de l’Ademe.'],
    ['Quelle est la recette de chou blanc la moins chère ?', `Dans nos recettes, c’est la poêlée de chou, de pommes de terre et de haricots blancs : ${cost('poelee-chou')} la portion en ingrédients (prix relevés le 7 octobre 2026 sur carrefour.fr, hors promotions).`],
  ],
  sources: [
    ['Fruits et légumes de saison, mois par mois (Impact CO₂, Ademe)', 'https://impactco2.fr/outils/fruitsetlegumes'],
    ['Chou pommé : présentation, disponibilité, conservation (Interfel, Les fruits et légumes frais)', 'https://www.lesfruitsetlegumesfrais.com/fruits-legumes/choux/chou-pomme'],
    ['Choisir le chou pommé (Interfel, Les fruits et légumes frais)', 'https://www.lesfruitsetlegumesfrais.com/fruits-legumes/choux/chou-pomme/choisir-le-chou-pomme'],
    ['Chou blanc (Test-Achats)', 'https://www.test-achats.be/sante/extra/fruits-et-legumes-de-saison/Chou%20blanc'],
  ],
} satisfies Article;
