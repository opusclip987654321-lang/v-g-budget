import type { Article } from '@/lib/blog-articles';
import { amountPrice, cost, kiloPrice, packPrice } from '@/lib/blog-cost';

export default {
  slug: 'remplacer-la-viande-pas-cher',
  title: 'Remplacer la viande pas cher : gardez vos plats, changez la protéine',
  seoTitle: 'Remplacer la viande pas cher : 6 plats et leur coût',
  description: 'Remplacer la viande pas cher dans la bolognaise, le chili ou le hachis parmentier : quoi mettre à la place, 6 recettes et leur coût par portion.',
  lead: `Pour remplacer la viande pas cher, gardez vos plats habituels et mettez des légumes secs à la place : lentilles dans la bolognaise et le hachis parmentier, haricots rouges dans le chili. Notre bolognaise de lentilles revient à ${cost('bolognaise-lentilles')} la portion en ingrédients.`,
  category: 'Budget',
  keywords: ['remplacer la viande pas cher', 'par quoi remplacer la viande pas cher', 'par quoi remplacer la viande hachée', 'remplacer la viande dans une bolognaise', 'hachis parmentier sans viande', 'chili sans viande', 'manger moins de viande économies'],
  date: '2026-10-20',
  coverAlt: 'Remplacer la viande pas cher : une assiette de pâtes à la bolognaise de lentilles, un bol de lentilles, un bloc de tofu et des haricots rouges',
  body: `
@essentiel
- **Gardez vos recettes** : seule la viande change, le reste du plat ne bouge pas.
- **Les lentilles** remplacent la viande hachée dans la bolognaise et le hachis parmentier.
- **Les haricots rouges** prennent sa place dans le chili, les **lentilles corail** dans le curry.
- **Avant d’acheter des steaks végétaux tout prêts**, comparez leur prix au kilo avec celui des légumes secs.

@chiffres ${cost('bolognaise-lentilles')} | la portion de bolognaise de lentilles ; ${kiloPrice('green-lentils')} | les lentilles vertes sèches ; 500 g | de viande au plus par semaine, hors volaille

## Par quoi remplacer la viande pas cher dans ses plats habituels ?

Gardez vos plats habituels et ne changez que la viande. Manger Bouger le rappelle : associés à un produit céréalier (pâtes, riz, semoule, pain), les légumes secs peuvent remplacer la viande.

| Plat habituel | À la place de la viande | Coût par portion |
|---|---|---|
| [Bolognaise](/recettes/bolognaise-lentilles) | Lentilles corail | ${cost('bolognaise-lentilles')} |
| [Hachis parmentier](/recettes/hachis-lentilles) | Lentilles vertes | ${cost('hachis-lentilles')} |
| [Chili](/recettes/chili-haricots) | Haricots rouges | ${cost('chili-haricots')} |
| [Curry](/recettes/curry-corail) | Lentilles corail | ${cost('curry-corail')} |
| [Steak haché](/recettes/galettes-lentilles) | Galettes de lentilles | ${cost('galettes-lentilles')} |
| [Poulet sauté](/recettes/tofu-cacahuete) | Tofu | ${cost('tofu-cacahuete')} |

Coût estimé des ingrédients : prix relevés le 7 octobre 2026 sur carrefour.fr, marques distributeur, hors promotions. Pour comparer, reprenez le prix de la viande sur votre dernier ticket de caisse.

## Par quoi remplacer la viande hachée dans une bolognaise ou un hachis parmentier ?

@recette bolognaise-lentilles | Les lentilles corail cuisent directement dans la sauce tomate et s’y fondent. Pour 2, elles coûtent ${amountPrice('red-lentils', 100)}.

![Pâtes à la bolognaise de lentilles dans une assiette](/images/recettes/bolognaise-lentilles.jpg "La bolognaise de lentilles : ${cost('bolognaise-lentilles')} la portion.")

@recette hachis-lentilles | Ici, ce sont des lentilles vertes, qui gardent leur forme sous la purée. Pour 2, comptez ${amountPrice('green-lentils', 140)} de lentilles.

@cta-court Moins de viande, sans chercher chaque soir quoi cuisiner : VégéBudget prépare vos dîners sans viande de la semaine selon votre budget, avec la liste de courses et le coût estimé. La première semaine est gratuite, sans compte ni carte.

## Par quoi remplacer la viande dans un chili, un curry ou un steak haché ?

@recette chili-haricots | Les haricots rouges en conserve remplacent le bœuf haché. Rincez-les : ils sont prêts.

@recette curry-corail | Des lentilles corail et du riz : légumes secs et céréale dans la même assiette, comme le conseille Manger Bouger.

@recette galettes-lentilles | À la place du steak haché : des galettes de lentilles, de carottes et de flocons d’avoine, dorées à la poêle.

@recette tofu-cacahuete | Pour remplacer le poulet sauté, faites dorer du tofu à la poêle. C’est l’option la plus chère du tableau : ${packPrice('tofu')}.

Vous ne voulez pas tout changer d’un coup ? Commencez par ne remplacer que la moitié de la viande dans la bolognaise ou le chili.

## Les steaks végétaux du commerce sont-ils moins chers ?

Pas forcément. Comparez le prix au kilo indiqué sur l’étiquette avec ces repères :

- **Lentilles vertes sèches** : ${kiloPrice('green-lentils')}.
- **Lentilles corail sèches** : ${kiloPrice('red-lentils')}.
- **Haricots rouges en conserve** : ${kiloPrice('kidney')}.
- **Tofu nature** : ${kiloPrice('tofu')}.

> Les légumes secs gonflent à la cuisson : un paquet sec donne donc plus de portions que son poids ne le laisse penser. Pour comparer les protéines elles-mêmes, voyez notre article sur les [protéines végétales et leur coût](/blog/proteines-vegetales).

## Combien de viande peut-on manger par semaine ?

- **Viande hors volaille** : 500 g par semaine au plus, soit environ 3 à 4 steaks (Manger Bouger).
- **Charcuterie** : 150 g par semaine au plus.
- **Légumes secs** : au moins 2 fois par semaine.
- **Autres options** : les œufs et les produits laitiers remplacent aussi la viande. Pour bien choisir vos œufs, lisez notre article sur le [code des œufs](/blog/code-oeufs).

Pour d’autres idées, voyez nos [recettes de lentilles pas chères](/blog/recettes-lentilles-pas-cheres), nos [recettes de pois chiches](/blog/recettes-pois-chiches), nos [repas pas chers pour 2](/blog/repas-pas-cher-pour-2) et notre [menu de la semaine pas cher](/blog/menu-semaine-pas-cher).

## D’autres dîners sans viande pas chers

@recettes mijote-lentilles, wrap-haricots, couscous-legumes

@cta Préparez vos dîners sans viande selon votre budget
`,
  faq: [
    ['Par quoi remplacer la viande pas cher ?', `Par des légumes secs : lentilles, haricots rouges, pois chiches. Associés à des pâtes, du riz ou de la semoule, ils peuvent remplacer la viande, rappelle Manger Bouger. Notre bolognaise de lentilles revient à ${cost('bolognaise-lentilles')} la portion en ingrédients.`],
    ['Quelles lentilles pour remplacer la viande hachée ?', 'Les lentilles vertes gardent leur forme : elles conviennent au hachis parmentier. Les lentilles corail se défont à la cuisson et donnent une sauce plus lisse, comme dans une bolognaise.'],
    ['Les steaks végétaux sont-ils moins chers que la viande ?', `Pas toujours. Comparez leur prix au kilo, indiqué sur l’étiquette, avec celui des légumes secs : ${kiloPrice('green-lentils')} pour des lentilles vertes sèches, ${kiloPrice('red-lentils')} pour des lentilles corail.`],
    ['Combien de viande peut-on manger par semaine ?', 'Manger Bouger conseille de privilégier la volaille et de limiter les autres viandes à 500 g par semaine, soit environ 3 à 4 steaks, et la charcuterie à 150 g par semaine.'],
    ['Peut-on remplacer seulement la moitié de la viande ?', 'Oui. Dans une bolognaise ou un chili, vous pouvez remplacer la moitié de la viande hachée par des lentilles ou des haricots rouges, sans changer le reste de la recette.'],
  ],
  sources: [
    ['Réduire la viande (Manger Bouger, Santé publique France)', 'https://www.mangerbouger.fr/l-essentiel/les-recommandations-sur-l-alimentation-l-activite-physique-et-la-sedentarite/reduire/reduire-la-viande-porc-baeuf-veau-mouton-agneau-abats'],
    ['Augmenter les légumes secs (Manger Bouger, Santé publique France)', 'https://www.mangerbouger.fr/l-essentiel/les-recommandations-sur-l-alimentation-l-activite-physique-et-la-sedentarite/augmenter/augmenter-les-legumes-secs'],
    ['Les alternatives à la viande existent ! (Manger Bouger, Santé publique France)', 'https://www.mangerbouger.fr/manger-mieux/bien-manger-sans-se-ruiner/bien-manger-en-preservant-la-planete-sans-se-ruiner-c-est-possible/les-alternatives-a-la-viande-existent'],
  ],
} satisfies Article;
