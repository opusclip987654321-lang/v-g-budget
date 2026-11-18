import type { Article } from '@/lib/blog-articles';
import { cost, kiloPrice, packPrice } from '@/lib/blog-cost';
import { recipes } from '@/lib/catalog';

// Tous les prix du site sont relevés en marques distributeur (PRICE_SOURCE, lib/pricing.ts) : l'article ne donne
// aucun prix de grande marque. L'écart moyen vient d'une source externe (FCD-FEEF-NielsenIQ).
['bolognaise-lentilles', 'curry-corail', 'pates-brocoli', 'riz-saute', 'chili-haricots', 'salade-lentilles'].forEach(id => {
  if (!recipes.some(r => r.id === id)) throw new Error(`Recette ${id} absente : revoir /blog/marque-distributeur-ou-grande-marque.`);
});

const ligne = (nom: string, id: string) => `| ${nom} | ${packPrice(id)} | ${kiloPrice(id)} |`;
const tableau = [
  '| Produit de base | Prix du paquet | Prix au kilo |',
  '|---|---|---|',
  ligne('Pâtes', 'pasta'),
  ligne('Riz', 'rice'),
  ligne('Farine de blé', 'flour'),
  ligne('Lentilles vertes sèches', 'green-lentils'),
  ligne('Pois chiches (égouttés)', 'chickpeas'),
  ligne('Tomates concassées', 'tomato'),
  ligne('Épinards surgelés', 'spinach'),
].join('\n');

export default {
  slug: 'marque-distributeur-ou-grande-marque',
  title: 'Marque distributeur ou grande marque : où la différence vaut le coup',
  seoTitle: 'Marque distributeur ou grande marque : que choisir ?',
  description: 'Marque distributeur ou grande marque : l’écart de prix moyen, qui fabrique, la qualité et les produits où la marque du magasin suffit, avec de vrais prix.',
  lead: `Marque distributeur ou grande marque : pour les produits de base (pâtes, riz, légumes secs, conserves, surgelés), la marque distributeur suffit le plus souvent, et elle coûte en moyenne 35 % de moins selon la fédération des distributeurs (FCD). Pour les produits transformés, comparez la liste d’ingrédients et le prix au kilo avant de choisir.`,
  category: 'Budget',
  keywords: ['marque distributeur ou grande marque', 'marques distributeur moins cher', 'différence marque distributeur et premier prix', 'qui fabrique les marques distributeur', 'marques distributeur qualité', 'marque distributeur définition'],
  date: '2026-11-18',
  coverAlt: 'Marque distributeur ou grande marque : deux paquets de pâtes côte à côte sur une étagère, avec leurs étiquettes de prix et un panier de courses',
  body: `
@essentiel
- **La marque distributeur** (MDD) appartient au magasin : elle coûte en moyenne 35 % de moins que les grandes marques, selon les distributeurs.
- **Pour un produit à un seul ingrédient** (riz, pâtes, lentilles), la marque change surtout le prix : prenez la MDD.
- **Pour un produit transformé**, comparez la liste d’ingrédients, le Nutri-Score et le prix au kilo.
- **La grande marque vaut le coup** en promotion, si son prix au kilo passe sous celui de la MDD.

@chiffres 35 % | moins cher en moyenne (FCD) ; ${kiloPrice('pasta')} | les pâtes en marque distributeur ; ${cost('bolognaise-lentilles')} | la portion de bolognaise de lentilles

## Marque distributeur ou grande marque : combien moins cher ?

Une marque distributeur porte le nom de l’enseigne ou d’une marque qui lui appartient. Selon une étude FCD-FEEF-NielsenIQ de 2024, ces produits sont **en moyenne 35 % moins chers** que les grandes marques. La FCD représente les magasins : le chiffre vient donc d’eux.

> **L’écart se réduit, mais il reste.** Selon 60 Millions de consommateurs, le prix des produits alimentaires de marque distributeur a augmenté de 20 % entre décembre 2021 et décembre 2024, contre 15 % pour les grandes marques.

En volume, les marques distributeur représentent près de la moitié des produits de grande consommation achetés en France (NielsenIQ, 2025).

## Pour quels produits prendre la marque distributeur ?

![Bocaux de lentilles vertes, de riz et de flocons d’avoine](/images/blog/manger-bio-pas-cher-vrac.jpg "Riz, légumes secs, farine : des produits simples, où la marque compte peu.")

Riz, lentilles, farine : quand le paquet ne contient qu’un ingrédient, la marque change surtout le prix. Voici les prix de quelques produits de base, tous relevés en marque distributeur :

${tableau}

> Prix relevés le 7 octobre 2026 sur carrefour.fr, marques distributeur, hors promotions.

- **Féculents** : pâtes, riz, semoule, farine.
- **Légumes secs et conserves** : lentilles, pois chiches, haricots, tomates concassées.
- **Surgelés nature** : épinards, petits pois, brocoli (voir [légumes surgelés ou frais](/blog/legumes-surgeles-prix)).
- **Épicerie de base** : huile, sel, épices, sauce soja.

@recette bolognaise-lentilles | Pâtes, lentilles corail et tomates concassées, plus une carotte et un oignon : des produits de base, pour ${cost('bolognaise-lentilles')} la portion.

@recette curry-corail | Riz, tomates concassées et épinards surgelés du tableau, avec des lentilles corail : un curry à ${cost('curry-corail')} la portion.

@cta-court VégéBudget prépare vos dîners de la semaine avec des prix de marques distributeur, et donne le coût de chaque portion et le montant estimé des courses.

## Qui fabrique les marques distributeur ?

Le magasin ne fabrique pas lui-même : il écrit un cahier des charges (recette, qualité, emballage) et confie la fabrication à un industriel. Selon l’association des fabricants de MDD (PLMA), ce sont des PME, de grands groupes, mais aussi des fabricants qui vendent par ailleurs leur propre marque.

## Les marques distributeur sont-elles de moins bonne qualité ?

Pas forcément. L’Oqali, l’observatoire de l’alimentation piloté par l’Anses et l’INRAE, n’a pas trouvé les premiers prix de moins bonne qualité nutritionnelle que les autres gammes, sur plus de 16 000 produits étudiés en 2015. La qualité varie surtout d’un produit à l’autre.

- **Lisez la liste d’ingrédients** : elle est classée du plus présent au moins présent.
- **Regardez le Nutri-Score** quand il est affiché.
- **Comparez le prix au kilo**, pas le prix du paquet (méthode dans [comparer le prix au kilo](/blog/comparer-prix-au-kilo)).

## Marque distributeur ou premier prix : quelle différence ?

Le premier prix est la gamme la moins chère du magasin, le plus souvent une marque distributeur elle aussi. Le choix de produits y est plus réduit (Oqali). Selon 60 Millions de consommateurs, les premiers prix ont aussi augmenté plus vite : +26 % entre décembre 2021 et décembre 2024.

| Gamme | Pour qui | À vérifier |
|---|---|---|
| Premier prix | budget le plus serré | ingrédients, prix au kilo |
| Marque distributeur | courses de tous les jours | prix au kilo |
| Grande marque | une recette précise | promo, prix au kilo |

## Quand la grande marque vaut-elle le coup ?

- **En promotion**, si son prix au kilo passe sous celui de la marque distributeur.
- **Quand la recette est différente** et que vous la préférez : un produit qu’on finit vaut mieux qu’un produit moins cher qu’on jette.
- **Pour un produit qu’on utilise peu** (une épice, une sauce) : l’écart sur l’année reste faible.

Pour tenir un budget serré toute la semaine, lisez aussi [faire ses courses avec 50 € par semaine](/blog/courses-50-euros-par-semaine) et nos [recettes de lentilles pas chères](/blog/recettes-lentilles-pas-cheres).

@recettes pates-brocoli, riz-saute, chili-haricots

@cta Préparez vos menus en fonction de votre budget
`,
  faq: [
    ['Qu’est-ce qu’une marque distributeur ?', 'C’est une marque qui appartient au magasin : elle porte le nom de l’enseigne, ou un nom choisi par elle. Le magasin fixe la recette et confie la fabrication à un industriel.'],
    ['Les produits de marque distributeur sont-ils fabriqués par les grandes marques ?', 'Parfois. Le magasin fixe la recette et confie la fabrication à des PME, à de grands groupes ou à des fabricants qui ont aussi leur propre marque.'],
    ['Quelle différence entre marque distributeur et premier prix ?', 'Le premier prix est la gamme la moins chère du magasin, souvent une marque distributeur elle aussi. Le choix de produits y est plus réduit, mais l’Oqali ne l’a pas trouvé de moins bonne qualité nutritionnelle.'],
    ['Les marques distributeur sont-elles moins bonnes pour la santé ?', 'Pas forcément. L’Oqali n’a pas trouvé les premiers prix de moins bonne qualité nutritionnelle que les autres gammes. Comparez la liste d’ingrédients et le Nutri-Score produit par produit.'],
    ['Combien économise-t-on avec les marques distributeur ?', 'L’écart moyen annoncé par les distributeurs est de 35 %, mais il varie selon le produit. Comparez toujours le prix au kilo.'],
  ],
  sources: [
    ['Évolutions du commerce et de la distribution 2025, étude MDD-PM FCD-FEEF-NielsenIQ 2024 (FCD)', 'https://www.fcd.fr/media/filer_public/da/a7/daa7c699-d288-40f8-b248-15ecec64a6c8/evolutions_du_commerce_et_de_la_distribution_-_2025.pdf'],
    ['Les prix des produits des distributeurs ont davantage augmenté en trois ans que ceux des grandes marques, selon 60 Millions de consommateurs (franceinfo)', 'https://www.franceinfo.fr/sante/alimentation/les-prix-des-produits-des-distributeurs-ont-davantage-augmente-en-trois-ans-que-ceux-des-grandes-marques-affirme-60-millions-de-consommateurs_7097481.html'],
    ['45,5 % de part de marché pour les MDD en France, chiffres NielsenIQ (Rayon Boissons)', 'https://www.rayon-boissons.com/distribution/le-chiffre-du-jour-455-de-part-de-marche-pour-les-mdd-en-france'],
    ['Caractérisation de l’offre alimentaire par segment de marché, 2015 (Oqali, Anses-INRAE)', 'https://www.oqali.fr/media/2021/12/Oqali_2015_Caracterisation_de_l_offre_alimentaire.pdf'],
    ['Pas de différence nutritionnelle entre premiers prix et marque nationale (Process Alimentaire)', 'https://www.processalimentaire.com/ingredients/pas-de-difference-nutritionnelle-entre-premiers-prix-et-marque-nationale'],
    ['Règlement (UE) n° 1169/2011 : liste des ingrédients par ordre décroissant de poids (EUR-Lex)', 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32011R1169'],
    ['Interview du président de la PLMA, association des fabricants de MDD (LSA)', 'https://www.lsa-conso.fr/interview-de-brian-sharoff-president-de-la-plma-50-de-part-de-marche-en-2025,121472'],
  ],
} satisfies Article;
