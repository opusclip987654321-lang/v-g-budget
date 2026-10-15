import type { Article } from '@/lib/blog-articles';
import { amountPrice } from '@/lib/blog-cost';

export default {
    slug: 'proteines-vegetales',
    title: 'Protéines végétales : comparer les aliments et leur coût',
    seoTitle: 'Protéines végétales : comparer les aliments et leur coût',
    description: 'Protéines végétales : lentilles, pois chiches, haricots, tofu, avoine. Leur teneur en protéines, leur coût pour 10 g de protéines et des recettes pour le soir.',
    lead: 'Lentilles, pois chiches, haricots, tofu : comparez quelques sources de protéines végétales et découvrez des idées pour les cuisiner au quotidien.',
    category: 'Nutrition', keywords: ['protéines végétales', 'protéine végétale', 'légumineuses', 'lentilles protéines', 'remplacer la viande', 'protéines pas cher'],
    date: '2026-10-07',
    updated: '2026-10-15',
    coverAlt: 'Protéines végétales : des bols de lentilles vertes, lentilles corail, pois chiches et haricots rouges, à côté d’un bloc de tofu',
    photo: true,
    body: `
@essentiel
- Dans notre comparatif, les lentilles sèches sont les protéines végétales les moins chères.
- Les conserves de pois chiches et de haricots coûtent plus, mais sont prêtes à l’emploi.
- Le tofu est la source la plus chère du tableau.
- Repère Manger Bouger : des légumes secs au moins 2 fois par semaine.

@chiffres ${amountPrice('green-lentils', 42)} | 10 g de protéines en lentilles ; ${amountPrice('tofu', 83)} | 10 g de protéines en tofu ; 2 fois | de légumes secs par semaine

## Quelles protéines végétales coûtent le moins cher ?

| Aliment | Protéines pour 100 g (environ) | Prix pour 10 g de protéines* |
|---|---|---|
| **Lentilles vertes** (sèches) | 24 g | ${amountPrice('green-lentils', 42)} |
| **Flocons d’avoine** | 13 g | ${amountPrice('oats', 77)} |
| **Lentilles corail** (sèches) | 24 g | ${amountPrice('red-lentils', 42)} |
| **Haricots rouges** (conserve, égouttés) | 8 g | ${amountPrice('kidney', 125)} |
| **Haricots blancs** (conserve, égouttés) | 7 g | ${amountPrice('white-beans', 143)} |
| **Pois chiches** (conserve, égouttés) | 7 g | ${amountPrice('chickpeas', 143)} |
| **Tofu nature** | 12 g | ${amountPrice('tofu', 83)} |

*Calcul VégéBudget : prix relevés le 7 octobre 2026 sur carrefour.fr, marques distributeur, hors promotions. Valeurs nutritionnelles moyennes arrondies, à vérifier sur l’emballage : elles varient selon les marques.

Le tableau permet de comparer le coût estimé des protéines pour les produits retenus. Les prix et les valeurs nutritionnelles varient selon les références.

- **Lentilles sèches** : les moins chères du tableau, à cuire vous-même.
- **Conserves** : plus chères au gramme de protéines, mais prêtes à l’emploi.
- **Tofu** : le plus cher, pratique pour changer des légumes secs.

## Comment cuisiner les légumineuses le soir ?

Cinq dîners de notre catalogue, avec le temps et le coût par portion. Cliquez sur une recette pour voir les ingrédients et les étapes.

@recette curry-corail | Lentilles corail, riz, tomates et épinards dans une seule casserole. Une légumineuse et une céréale dans la même assiette.

@recette chili-haricots | Des haricots rouges en conserve, du maïs et du riz, mijotés avec des épices douces.

@cta-court Les légumes secs sont les protéines les moins chères de notre tableau : VégéBudget les place dans vos dîners de la semaine, selon votre budget, avec la liste de courses adaptée à vos menus.

@recette mijote-lentilles | Lentilles vertes et carottes mijotées. Cuisez-en le double pour une salade le lendemain.

@recette couscous-legumes | Semoule, pois chiches et légumes : l’association classique semoule et pois chiches.

@recette tofu-cacahuete | Pour changer des légumes secs : du tofu doré, une sauce à la cacahuète, du riz et du brocoli.

Pour d’autres idées, voyez nos [recettes de lentilles pas chères](/blog/recettes-lentilles-pas-cheres) et toutes les [recettes sans viande](/recettes).

## Faut-il associer céréales et légumineuses ?

![Un bol de riz blanc et un bol de lentilles vertes aux carottes, côte à côte](/images/blog/proteines-vegetales-riz-lentilles.jpg "Une céréale et une légumineuse : du riz et des lentilles.")

Les légumineuses (lentilles, pois chiches, haricots) et les céréales (riz, blé, avoine) n’ont pas exactement les mêmes acides aminés : ensemble, elles se complètent. Pas besoin de les associer dans le même repas : il suffit d’en manger au cours de la journée.

- **Riz et lentilles** : le curry de lentilles corail.
- **Semoule et pois chiches** : le couscous aux légumes.
- **Chili et maïs** : le chili doux aux haricots rouges.

## Comment manger plus de légumes secs sans se compliquer la vie ?

- **Lentilles corail** : 10 min de cuisson environ (Manger Bouger), pour les currys et les soupes.
- **Lentilles vertes** : cuisson plus longue, voir le paquet. Cuisez-en le double.
- **Conserves** : rincez-les, cela retire une partie du sel, puis utilisez-les directement.
- **Un paquet pour plusieurs dîners**, comme dans notre [menu de la semaine pas cher](/blog/menu-semaine-pas-cher).

> **Le repère officiel :** manger des légumes secs **au moins deux fois par semaine**, d’après le Programme national nutrition santé (Manger Bouger).

## De combien de protéines a-t-on besoin ?

L’Anses retient pour un adulte une référence de **0,83 g de protéines par kilo de poids et par jour**. Pour une personne de 70 kg, cela fait environ 58 g par jour.

## En vidéo

@video UlEChazV2mk | Légumineuses : le vrai du faux ! | La Quotidienne, France 5

## Des recettes pour cuisiner les légumineuses

@recettes penne-pois-chiches, galettes-lentilles, poelee-blanche

@cta Cuisinez les légumes secs autrement
`,
    faq: [
      ['Quelle est la protéine végétale la moins chère ?', `Les lentilles sèches : environ ${amountPrice('green-lentils', 42)} pour 10 g de protéines en lentilles vertes et ${amountPrice('red-lentils', 42)} en lentilles corail, avec les prix relevés le 7 octobre 2026 sur carrefour.fr (marques distributeur, hors promotions).`],
      ['Le tofu est-il une protéine végétale chère ?', `Dans notre tableau, c’est la plus chère : environ ${amountPrice('tofu', 83)} pour 10 g de protéines, contre ${amountPrice('green-lentils', 42)} pour les lentilles vertes. Les prix varient selon les références.`],
      ['Combien de protéines faut-il par jour ?', 'L’Anses retient 0,83 g par kilo de poids corporel et par jour pour un adulte, soit environ 58 g pour une personne de 70 kg.'],
      ['Faut-il associer céréales et légumineuses dans le même repas ?', 'Non. Il suffit d’en manger au cours de la journée pour que leurs acides aminés se complètent.'],
    ],
    sources: [
      ['Protéines : rôle, sources et apports recommandés (Anses)', 'https://www.anses.fr/fr/content/proteines-role-sources-et-apports-recommandes'],
      ['Augmenter les légumes secs (Manger Bouger)', 'https://www.mangerbouger.fr/l-essentiel/les-recommandations-sur-l-alimentation-l-activite-physique-et-la-sedentarite/augmenter/augmenter-les-legumes-secs'],
    ],
} satisfies Article;
