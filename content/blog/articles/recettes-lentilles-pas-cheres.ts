import type { Article } from '@/lib/blog-articles';
import { amountPrice, cost, kiloPrice, packPrice } from '@/lib/blog-cost';

export default {
  slug: 'recettes-lentilles-pas-cheres',
  title: 'Recettes de lentilles pas chères : 6 dîners faciles et leur coût',
  seoTitle: 'Recettes de lentilles pas chères : 6 dîners et leur coût',
  description: 'Recettes de lentilles pas chères pour le dîner : curry, bolognaise, velouté, salade, galettes. Le coût par portion de chacune et 5 astuces pour payer moins.',
  lead: `Pour un dîner sans viande pas cher, les lentilles sèches sont un des meilleurs choix : une portion coûte environ ${amountPrice('green-lentils', 70)} en lentilles vertes et ${amountPrice('red-lentils', 70)} en lentilles corail. Voici 6 recettes faciles pour le soir, avec le prix de chacune.`,
  category: 'Recettes',
  keywords: ['recette lentilles pas cher', 'recettes de lentilles pas chères', 'recettes avec des lentilles', 'lentilles corail recette', 'lentilles vertes recette', 'quantité de lentilles par personne', 'dîner pas cher'],
  date: '2026-10-15',
  coverAlt: 'Une casserole de lentilles corail aux tomates, un paquet de lentilles et des carottes',
  photo: true,
  body: `
@essentiel
- 6 dîners aux lentilles de ${cost('salade-lentilles')} à ${cost('galettes-lentilles')} la portion (ingrédients).
- Lentilles corail : cuisson rapide, pour les currys et les soupes.
- Lentilles vertes : elles gardent leur forme, pour les salades et les plats mijotés.
- Un paquet de 500 g fait plusieurs dîners.

@chiffres ${amountPrice('green-lentils', 70)} | la portion de lentilles vertes ; 10 min | de cuisson pour les corail ; 2 fois | par semaine, conseil Manger Bouger

## Quelles recettes de lentilles pas chères faire pour le dîner ?

Six idées de notre catalogue, de la plus simple à la plus originale. Cliquez sur une recette pour voir les ingrédients et les étapes.

@recette curry-corail | Tout cuit dans une seule casserole : lentilles, tomates, épinards surgelés et lait de coco. La recette idéale pour commencer.

@recette bolognaise-lentilles | Les lentilles remplacent la viande hachée dans la sauce tomate. Sur des pâtes, toute la famille s’y retrouve.

@recette courge-lentilles | Une soupe épaisse d’automne. Avec les lentilles, elle devient un vrai dîner.

@cta-court Un paquet, trois dîners : pour deux, le curry, la bolognaise et le velouté utilisent ensemble 360 g de lentilles corail. VégéBudget compose vos dîners de la semaine selon votre budget pour que rien ne reste au placard.

@recette mijote-lentilles | Le plat mijoté classique, avec carottes et pommes de terre. Faites-en le double : il se réchauffe très bien.

@recette salade-lentilles | Lentilles vertes, pommes de terre, citron et moutarde. Tiède le soir, froide le lendemain midi.

@recette galettes-lentilles | Lentilles écrasées avec des flocons d’avoine, dorées à la poêle. Pour changer des plats en sauce.

Coût estimé des ingrédients utilisés, par portion : prix relevés le 7 octobre 2026 sur carrefour.fr, marques distributeur, hors promotions. En magasin, vous achetez des paquets entiers, et le reste sert pour d’autres repas.

## Combien coûte une portion de lentilles ?

Les lentilles gonflent à la cuisson : un paquet de 500 g sert à plusieurs dîners. Le bon repère est donc le prix d’une portion, pas celui du paquet.

| Produit | Le paquet | Une portion de 70 g |
|---|---|---|
| Lentilles corail | ${packPrice('red-lentils')} | ${amountPrice('red-lentils', 70)} |
| Lentilles vertes | ${packPrice('green-lentils')} | ${amountPrice('green-lentils', 70)} |

Prix relevés le 7 octobre 2026 sur carrefour.fr, marques distributeur, hors promotions. Nos recettes comptent de 50 à 85 g de lentilles sèches par personne, 70 g le plus souvent. Pour comparer avec les pois chiches ou le tofu, voyez notre [comparatif des protéines végétales](/blog/proteines-vegetales).

## Lentilles corail ou lentilles vertes : lesquelles choisir ?

![Un bol de lentilles corail et un bol de lentilles vertes, côte à côte](/images/blog/recettes-lentilles-pas-cheres-corail-vertes.jpg "À gauche, les lentilles corail ; à droite, les lentilles vertes.")

| | Lentilles corail | Lentilles vertes |
|---|---|---|
| Cuisson | 10 min environ (Manger Bouger) | Plus longue : voir le paquet |
| À la cuisson | Elles se défont | Elles gardent leur forme |
| Idéales pour | Currys, soupes, sauces | Salades, plats mijotés, galettes |

Dans les deux cas, rincez-les avant de les cuire et suivez les indications du paquet pour le trempage.

## Comment payer ses lentilles encore moins cher ?

- **Prenez la marque distributeur** : souvent la moins chère du rayon.
- **Comparez le prix au kilo**, pas le prix du paquet (le vrac n’est pas toujours moins cher).
- **Un paquet pour deux ou trois dîners** dans la semaine, comme dans notre [menu de la semaine pas cher](/blog/menu-semaine-pas-cher).
- **Ajoutez des légumes bon marché** : carottes, oignons, pommes de terre, [légumes de saison](/blog/fruits-legumes-de-saison).
- **Cuisinez en double** : les plats de lentilles se gardent au réfrigérateur.

## Combien de fois par semaine manger des lentilles ?

Manger Bouger conseille des légumes secs (lentilles, haricots, pois chiches…) **au moins 2 fois par semaine**, pour leurs fibres et leurs protéines végétales. Si vous n’en avez pas l’habitude, commencez par de petites quantités.

## D’autres dîners aux légumineuses

@recettes chili-haricots, epinards-pois-chiches, penne-pois-chiches

@cta Organisez vos dîners de la semaine selon votre budget
`,
  faq: [
    ['Quelle recette de lentilles pas chère faire le soir ?', `Le curry de lentilles corail (${cost('curry-corail')} la portion), la bolognaise de lentilles (${cost('bolognaise-lentilles')}) et le velouté de courge et de lentilles corail (${cost('courge-lentilles')}) se préparent en 25 à 30 min. Coût estimé des ingrédients, prix relevés le 7 octobre 2026 sur carrefour.fr, marques distributeur, hors promotions.`],
    ['Combien coûte une portion de lentilles ?', `Avec les prix relevés pour notre site, 70 g de lentilles vertes sèches (une portion pour un plat principal) coûtent environ ${amountPrice('green-lentils', 70)}, et 70 g de lentilles corail environ ${amountPrice('red-lentils', 70)}. Les prix varient selon le magasin.`],
    ['Faut-il faire tremper les lentilles ?', 'Pas toujours. Pour les légumes secs, Manger Bouger indique que le trempage est parfois nécessaire et que les lentilles corail cuisent en 10 minutes environ. Le plus simple : suivre les indications du paquet.'],
    ['Quelle quantité de lentilles par personne ?', 'Dans nos recettes, on compte de 50 à 85 g de lentilles sèches par personne pour un plat principal, 70 g le plus souvent, avec des légumes et souvent du riz ou des pâtes.'],
    ['Lentilles corail ou vertes : quelle différence ?', 'Les lentilles corail cuisent vite et se défont : elles conviennent aux soupes, currys et sauces. Les lentilles vertes gardent leur forme : elles conviennent aux salades, aux plats mijotés et aux galettes.'],
  ],
  sources: [
    ['Augmenter les légumes secs (Manger Bouger, Santé publique France)', 'https://www.mangerbouger.fr/l-essentiel/les-recommandations-sur-l-alimentation-l-activite-physique-et-la-sedentarite/augmenter/augmenter-les-legumes-secs'],
  ],
} satisfies Article;
