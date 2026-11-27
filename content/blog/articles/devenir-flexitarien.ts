import type { Article } from '@/lib/blog-articles';
import { cost, kiloPrice, packPrice } from '@/lib/blog-cost';
import { recipes, type Recipe } from '@/lib/catalog';
import { money, recipeCost, roundMoney, shopping, totals, type Entry } from '@/lib/planner';

// Tous les montants viennent du catalogue (lib/catalog.ts) et du calcul de la liste de courses de l'appli (lib/planner.ts).
const jour = '2026-11-27';

// La semaine type : 3 dîners sans viande pour 2, les autres soirs comme d'habitude.
const SEMAINE: [string, string | null][] = [
  ['Lundi', 'bolognaise-lentilles'],
  ['Mardi', null],
  ['Mercredi', 'curry-corail'],
  ['Jeudi', null],
  ['Vendredi', 'hachis-lentilles'],
  ['Samedi', null],
  ['Dimanche', null],
];
const recette = (id: string): Recipe => {
  const r = recipes.find(x => x.id === id);
  if (!r) throw new Error(`Recette ${id} absente : revoir /blog/devenir-flexitarien.`);
  return r;
};
const ids = SEMAINE.flatMap(([, id]) => (id ? [id] : []));
const entrees: Entry[] = ids.map((id, n) => ({ id: `f-${n}`, recipeId: id, date: jour, servings: 2, cooked: false, locked: false }));
const items = shopping(entrees, []).filter(i => i.packages > 0);
const t = totals(items);
const portion = money(t.used / (ids.length * 2));

// Huile, sel et épices : souvent déjà dans le placard.
const PLACARD = ['oil', 'salt', 'curry', 'paprika'];
const sansPlacard = roundMoney(items.filter(i => !PLACARD.includes(i.id)).reduce((s, i) => s + i.purchaseCost, 0));

// Le texte dit qu'il restera des pâtes, du riz et des lentilles (corail et vertes).
for (const id of ['pasta', 'rice', 'red-lentils', 'green-lentils']) {
  const i = items.find(x => x.id === id);
  if (!i || i.surplus <= 0) throw new Error(`Il ne reste plus de ${id} : revoir /blog/devenir-flexitarien.`);
}
// Le texte dit que chaque recette de la semaine type est faite pour 2 en 40 min au plus.
for (const id of ids) if (recette(id).minutes > 40) throw new Error(`${id} dépasse 40 min : revoir /blog/devenir-flexitarien.`);
// Recettes citées comme exemples de plats connus, avec leur protéine végétale.
if (!JSON.stringify(recette('chili-haricots').ingredients).includes('"kidney"')) throw new Error('Le chili n’a plus de haricots rouges : revoir /blog/devenir-flexitarien.');
if (!JSON.stringify(recette('bolognaise-lentilles').ingredients).includes('"red-lentils"')) throw new Error('La bolognaise n’a plus de lentilles corail : revoir /blog/devenir-flexitarien.');
if (!JSON.stringify(recette('hachis-lentilles').ingredients).includes('"green-lentils"')) throw new Error('Le hachis n’a plus de lentilles vertes : revoir /blog/devenir-flexitarien.');

const semaine = [
  '| Soir | Dîner | La portion |',
  '|---|---|---|',
  ...SEMAINE.map(([j, id]) => (id ? `| **${j}** | [${recette(id).title}](/recettes/${id}) | ${cost(id)} |` : `| ${j} | Votre dîner habituel | |`)),
].join('\n');

export default {
  slug: 'devenir-flexitarien',
  title: 'Devenir flexitarien : commencer par 3 dîners sans viande par semaine',
  seoTitle: 'Devenir flexitarien : par où commencer, menu et coût',
  description: 'Devenir flexitarien sans changer toute sa cuisine : par où commencer, un menu de 3 dîners sans viande avec des plats connus et leur coût par portion.',
  lead: `Devenir flexitarien, c’est manger de la viande moins souvent, sans y renoncer. Pour commencer, faites 2 ou 3 dîners sans viande par semaine avec des plats que vous connaissez déjà : la bolognaise de lentilles revient à ${cost('bolognaise-lentilles')} la portion.`,
  category: 'Budget',
  keywords: ['devenir flexitarien', 'flexitarien', 'régime flexitarien c’est quoi', 'menu flexitarien semaine', 'différence flexitarien végétarien', 'comment commencer à manger moins de viande'],
  date: '2026-11-27',
  coverAlt: 'Devenir flexitarien : un semainier avec 3 soirs sans viande sur 7, une assiette de pâtes à la bolognaise de lentilles, un bocal de lentilles et des carottes',
  body: `
@essentiel
- **Flexitarien** : vous mangez de la viande moins souvent. Aucune règle officielle ne fixe combien de fois.
- **Pour commencer** : 2 ou 3 dîners sans viande par semaine, puis davantage si cela vous convient.
- **Gardez vos plats** : bolognaise, hachis parmentier ou chili, avec des lentilles ou des haricots à la place de la viande.
- **3 dîners sans viande pour 2** : ${portion} la portion en moyenne, ingrédients seuls.

@chiffres ${portion} | la portion, 3 dîners sans viande ; 24 % | des Français se disent flexitariens (Ifop) ; 2 fois | légumes secs par semaine, selon Manger Bouger

## Le régime flexitarien, c’est quoi exactement ?

Un flexitarien mange surtout végétal et garde de la viande ou du poisson de temps en temps. Il n’existe pas de seuil officiel : c’est vous qui choisissez combien de repas sans viande vous faites.

### Quelle différence entre flexitarien et végétarien ?

| Régime | Viande et poisson | Œufs et laitages |
|---|---|---|
| **Flexitarien** | moins souvent | oui |
| **Végétarien** | non | oui |
| **Végétalien** | non | non |

Selon une enquête Ifop pour FranceAgriMer menée fin 2020, 24 % des Français se considèrent flexitariens, et 2,2 % suivent un régime sans viande.

## Comment devenir flexitarien sans changer toute sa cuisine ?

- **Semaines 1 et 2** : 2 dîners sans viande, avec des plats que tout le monde connaît.
- **Semaines 3 et 4** : passez à 3 dîners, par exemple lundi, mercredi et vendredi.
- **Ensuite** : ajoutez un soir si la famille suit, sinon restez à 3.
- **Changez la protéine, pas le plat** : des lentilles dans la bolognaise et le hachis, des haricots rouges dans le chili.

Manger Bouger conseille de manger des légumes secs au moins 2 fois par semaine : 2 ou 3 dîners de lentilles ou de haricots y suffisent.

## Quels dîners sans viande choisir pour commencer ?

@recette bolognaise-lentilles | La sauce tomate habituelle, mijotée 20 min avec des lentilles corail à la place de la viande hachée.

@recette hachis-lentilles | Des lentilles vertes à la tomate sous une purée maison, le tout passé 15 min au four.

@recette curry-corail | Lentilles corail, tomates, épinards et lait de coco, servis avec du riz.

@cta-court Dans VégéBudget, réglez le nombre de dîners par semaine, 2 ou 3 pour commencer : l’appli les compose selon votre budget et chiffre la liste de courses.

@recette chili-haricots | Le chili sans viande : haricots rouges, maïs et poivron, avec du riz.

## À quoi ressemble un menu flexitarien sur une semaine ?

${semaine}

Les 6 portions sans viande reviennent à ${money(t.used)} d’ingrédients. En caisse, comptez ${money(sansPlacard)} si vous avez déjà l’huile, le sel et les épices (VégéBudget retire de la liste ce que vous avez dans le placard) : les paquets sont entiers, il vous restera des pâtes, du riz et des lentilles pour la semaine suivante. Coût estimé des ingrédients pour 2 : prix relevés le 7 octobre 2026 sur carrefour.fr, marques distributeur, hors promotions.

## Manger moins de viande fait-il baisser le budget courses ?

Tout dépend de ce que vous achetez aujourd’hui, et nous ne relevons pas le prix de la viande. Voici les prix que nous relevons pour les bases d’un dîner sans viande.

- **Lentilles vertes sèches** : ${kiloPrice('green-lentils')}.
- **Lentilles corail** : ${kiloPrice('red-lentils')}.
- **Haricots rouges en boîte** : ${packPrice('kidney')}.
- **Riz sauté aux petits pois** : ${cost('riz-saute')} la portion, un dîner sans viande et sans légumes secs.

![Riz sauté aux petits pois et aux carottes](/images/recettes/riz-saute.jpg "Riz sauté aux petits pois : ${cost('riz-saute')} la portion.")

Pour voir l’écart chez vous, la carte « Comparez avec vos dépenses habituelles » de l’appli met côte à côte ce que vous dépensez d’habitude pour ces dîners et les courses prévues.

> **Repères de quantité** : Manger Bouger conseille de limiter la viande hors volaille à 500 g par semaine et la charcuterie à 150 g. Les détails sont dans notre article [par quoi remplacer la viande pas cher](/blog/remplacer-la-viande-pas-cher).

Pour varier les légumes secs, voyez nos [recettes de lentilles pas chères](/blog/recettes-lentilles-pas-cheres) et nos [recettes de pois chiches](/blog/recettes-pois-chiches). Sur les apports, lisez notre article sur les [protéines végétales](/blog/proteines-vegetales).

@recettes couscous-legumes, mijote-lentilles, poelee-chou

@cta Préparez vos premiers dîners sans viande de la semaine
`,
  faq: [
    ['Combien de fois par semaine un flexitarien mange-t-il de la viande ?', 'Il n’existe pas de règle officielle : chacun choisit. Manger Bouger conseille de limiter la viande hors volaille à 500 g par semaine et la charcuterie à 150 g.'],
    ['Quelle est la différence entre flexitarien et végétarien ?', 'Le végétarien ne mange ni viande ni poisson. Le flexitarien en mange, mais moins souvent, et donne plus de place aux légumes secs, aux céréales et aux légumes.'],
    ['Par quoi commencer pour manger moins de viande ?', 'Commencez par 2 dîners sans viande par semaine avec des plats connus : bolognaise de lentilles, hachis parmentier de lentilles ou chili aux haricots rouges. Passez à 3 quand ces dîners sont entrés dans vos habitudes.'],
    ['Être flexitarien coûte-t-il plus cher ?', `Les dîners de notre semaine type reviennent à ${portion} la portion en moyenne, ingrédients seuls. Comparez avec ce que vous coûtent vos dîners avec viande pour voir l’écart.`],
  ],
  sources: [
    ['Végétariens et flexitariens en France en 2020 (Ifop pour FranceAgriMer)', 'https://www.ifop.com/wp-content/uploads/2021/05/Synthese-_-Vegetariens-et-Flexitariens-en-France-en-2020-IFOP.pdf'],
    ['Réduire la viande (Manger Bouger, Santé publique France)', 'https://www.mangerbouger.fr/l-essentiel/les-recommandations-sur-l-alimentation-l-activite-physique-et-la-sedentarite/reduire/reduire-la-viande-porc-baeuf-veau-mouton-agneau-abats'],
    ['Augmenter les légumes secs (Manger Bouger, Santé publique France)', 'https://www.mangerbouger.fr/l-essentiel/les-recommandations-sur-l-alimentation-l-activite-physique-et-la-sedentarite/augmenter/augmenter-les-legumes-secs'],
  ],
} satisfies Article;
