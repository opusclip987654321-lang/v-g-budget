import type { Article } from '@/lib/blog-articles';
import { amountPrice, cost, packPrice } from '@/lib/blog-cost';
import { ingredients } from '@/lib/catalog';

// Nombre de portions de 70 g (repère des recettes du site) dans un paquet de lentilles du catalogue.
const portions = (id: string) => {
  const i = ingredients.find(x => x.id === id);
  if (!i) throw new Error(`${id} absent du catalogue : revoir /blog/cuisson-legumes-secs.`);
  return Math.floor(i.pack / 70);
};

export default {
  slug: 'cuisson-legumes-secs',
  title: 'Temps de cuisson des légumes secs : le tableau, le trempage et la conservation',
  seoTitle: 'Temps de cuisson des légumes secs : tableau et trempage',
  description: 'Temps de cuisson des légumes secs, trempage ou pas, conservation : le tableau de l’Ademe et des dîners pas chers aux lentilles, pois chiches et haricots.',
  lead: 'Temps de cuisson des légumes secs selon l’Ademe : 10 à 25 min pour les lentilles et 45 min environ pour les pois cassés, sans trempage ; 1 h à 2 h pour les pois chiches et les haricots après 12 h de trempage. Un soir de semaine, prenez des lentilles ou une boîte de pois chiches déjà cuits.',
  category: 'Nutrition',
  keywords: ['temps de cuisson légumes secs', 'temps de cuisson des légumes secs', 'trempage légumes secs', 'cuisson pois chiches secs', 'comment cuire les légumes secs', 'légumes secs sans trempage', 'conservation légumes secs cuits'],
  date: '2026-11-15',
  coverAlt: 'Temps de cuisson des légumes secs : une casserole de lentilles, des bocaux de pois chiches et de haricots secs',
  body: `
@essentiel
- **Sans trempage** : lentilles (10 à 25 min de cuisson) et pois cassés (45 min environ).
- **Une nuit de trempage** : pois chiches et haricots, puis 1 h à 2 h de cuisson.
- **Jetez l’eau de trempage** et faites bien bouillir les haricots rouges.
- **Un soir pressé** : lentilles corail, ou pois chiches en boîte déjà cuits.

@chiffres 10 min | de cuisson pour les lentilles corail ; 12 h | de trempage pour les pois chiches ; 2 fois | par semaine au moins, selon Manger Bouger

## Quel est le temps de cuisson des légumes secs ?

Les temps varient selon la variété et l’âge des graines : le paquet reste la référence.

| Légume sec | Trempage | Cuisson |
|---|---|---|
| Lentilles corail ou vertes | Aucun | 10 à 25 min selon la variété |
| Lentilles brunes | 4 h | 30 min environ |
| Pois cassés | Aucun | 45 min environ |
| Pois chiches | 12 h | 1 h 30 environ |
| Haricots blancs | 12 h | 1 h à 2 h |
| Fèves | 8 à 12 h | 1 h à 2 h |

Source : infographie « Les légumes secs aux petits oignons » de l’Ademe. Pour les lentilles corail, Manger Bouger indique 10 min environ.

## Faut-il faire tremper les légumes secs avant de les cuire ?

Les lentilles et les pois cassés se cuisent sans trempage. Les pois chiches, les haricots et les fèves doivent tremper une nuit : l’Ademe indique que le trempage facilite la cuisson et la digestion.

- **Couvrez largement d’eau** : les graines gonflent.
- **Jetez l’eau de trempage** et rincez avant la cuisson, comme le conseille l’Ademe.
- **Haricots rouges secs** : Santé Canada demande au moins 5 h de trempage, puis au moins 10 min à gros bouillons. Une mijoteuse ne chauffe pas assez pour eux.

@cta-court Il reste un paquet de lentilles ou de pois chiches au placard ? Notez-le : VégéBudget prévoit vos dîners de la semaine selon votre budget et ne met sur la liste de courses que ce qui manque.

## Quels légumes secs cuire sans trempage un soir de semaine ?

![Lentilles vertes mijotées aux carottes et aux pommes de terre](/images/recettes/mijote-lentilles.jpg "Des lentilles vertes aux carottes, cuites sans trempage.")

Un paquet de lentilles vertes coûte ${packPrice('green-lentils')} et donne ${portions('green-lentils')} portions de 70 g, soit ${amountPrice('green-lentils', 70)} la portion. Pour les lentilles corail : ${packPrice('red-lentils')}, ${amountPrice('red-lentils', 70)} la portion.

@recette curry-corail | Les lentilles corail cuisent dans la sauce, sans trempage ni cuisson à part. Un dîner en 25 min.

@recette mijote-lentilles | Lentilles vertes, carottes et pommes de terre dans une seule casserole. Cuisez-en le double pour le lendemain.

Coût estimé des ingrédients, prix relevés le 7 octobre 2026 sur carrefour.fr, marques distributeur, hors promotions. Plus d’idées dans nos [recettes de lentilles pas chères](/blog/recettes-lentilles-pas-cheres).

## Comment cuire les pois chiches secs ou les remplacer par une boîte ?

Pour cuire les pois chiches et les haricots secs : une nuit de trempage, l’eau de trempage jetée, puis une cuisson à petits bouillons dans un grand volume d’eau propre. Cuisez-en beaucoup le week-end : c’est le principe du [batch cooking pas cher](/blog/batch-cooking-pas-cher).

En semaine, la boîte vous évite la nuit de trempage et la cuisson. Nos recettes utilisent des pois chiches cuits (${packPrice('chickpeas')}) et des haricots blancs cuits (${packPrice('white-beans')}) : il suffit de les égoutter.

@recette epinards-pois-chiches | Une boîte de pois chiches, des épinards et du riz, à la poêle. À table en 20 min.

@recette minestrone-haricots | Une soupe-repas de légumes, de pâtes et de haricots blancs en boîte.

D’autres idées dans nos [recettes de pois chiches](/blog/recettes-pois-chiches).

## Comment conserver les légumes secs, crus et cuits ?

| | Où | Combien de temps |
|---|---|---|
| Crus | Placard, au sec, boîte fermée | Voir la date du paquet |
| Cuits | Réfrigérateur, boîte fermée | 48 h au plus |
| Cuits, pour plus tard | Congélateur, le jour même | Notez la date sur la boîte |

Pour les plats faits maison, le ministère de l’Agriculture conseille de les consommer dans les 48 h. Pour les garder plus longtemps, congelez-les le jour de la cuisson. Voir aussi [que faire avec des restes](/blog/que-faire-avec-des-restes).

## Combien de fois par semaine manger des légumes secs ?

Manger Bouger conseille de manger des légumes secs **au moins 2 fois par semaine**, et propose les lentilles corail pour commencer. Pour comparer leur prix avec les autres protéines, consultez notre [comparatif des protéines végétales](/blog/proteines-vegetales).

@recettes chili-haricots, courge-lentilles, couscous-legumes

@cta Organisez vos dîners de la semaine selon votre budget
`,
  faq: [
    ['Quel est le temps de cuisson des légumes secs ?', 'Selon l’Ademe : 10 à 25 min pour les lentilles, 45 min environ pour les pois cassés, 1 h 30 environ pour les pois chiches et 1 h à 2 h pour les haricots blancs après trempage. Suivez aussi les indications du paquet.'],
    ['Faut-il jeter l’eau de trempage des légumes secs ?', 'Oui. L’Ademe conseille de ne pas réutiliser l’eau de trempage : rincez les légumes secs et cuisez-les dans une eau propre.'],
    ['Quels légumes secs se cuisent sans trempage ?', 'Les lentilles corail ou vertes, et les pois cassés. Les lentilles corail cuisent en 10 min environ selon Manger Bouger.'],
    ['Les haricots rouges secs mal cuits sont-ils dangereux ?', 'Ils contiennent des lectines. Santé Canada conseille au moins 5 h de trempage, de jeter l’eau, puis de les cuire à gros bouillons au moins 10 min. Les haricots en conserve sont déjà cuits.'],
    ['Combien de temps se gardent les légumes secs cuits ?', 'Comme les autres plats faits maison, 48 h au plus au réfrigérateur selon le ministère de l’Agriculture. Pour plus tard, congelez-les le jour de la cuisson.'],
  ],
  sources: [
    ['Les légumes secs aux petits oignons, infographie (Ademe)', 'https://librairie.ademe.fr/cadic/7383/infographie-legumes-secs-202209.pdf'],
    ['Augmenter les légumes secs (Manger Bouger, Santé publique France)', 'https://www.mangerbouger.fr/l-essentiel/les-recommandations-sur-l-alimentation-l-activite-physique-et-la-sedentarite/augmenter/augmenter-les-legumes-secs'],
    ['Les lectines dans les légumineuses sèches (Santé Canada)', 'https://www.canada.ca/fr/sante-canada/services/aliments-nutrition/salubrite-aliments/contaminants-chimiques/toxines-naturelles/lectines-legumineuses.html'],
    ['Cuisiner fait maison : comment éviter les intoxications alimentaires (ministère de l’Agriculture)', 'https://agriculture.gouv.fr/cuisiner-fait-maison-comment-eviter-les-intoxications-alimentaires'],
    ['Les bonnes pratiques de la congélation (ministère de l’Agriculture)', 'https://agriculture.gouv.fr/les-bonnes-pratiques-de-la-congelation'],
  ],
} satisfies Article;
