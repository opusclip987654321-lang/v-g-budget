import type { Article } from '@/lib/blog-articles';
import { amountPrice } from '@/lib/blog-cost';

export default {
    slug: 'gaspillage-alimentaire',
    title: 'Moins gaspiller à la maison : 10 habitudes à adopter',
    seoTitle: 'Gaspillage alimentaire à la maison : 10 habitudes à adopter',
    description: 'Gaspillage alimentaire à la maison : 10 habitudes simples pour mieux utiliser vos ingrédients, éviter les achats inutiles et cuisiner vos restes.',
    lead: 'Un paquet oublié, des légumes achetés en trop, des restes sans idée de recette : quelques habitudes peuvent aider à mieux utiliser ce que vous avez et à éviter des achats inutiles.',
    category: 'Budget', keywords: ['gaspillage alimentaire', 'anti gaspi', 'réduire le gaspillage alimentaire', 'économiser sur les courses', 'DLC DDM'],
    date: '2026-10-07',
    updated: '2026-10-15',
    coverAlt: 'Contre le gaspillage alimentaire : des boîtes en verre de restes de riz, de légumes et de soupe, à côté de carottes et d’un pain',
    photo: true,
    body: `
@essentiel
- Prévoir ses repas aide à préparer une liste d’achats adaptée.
- Regardez le placard et le frigo avant de partir faire les courses.
- Ne confondez pas DLC (« à consommer jusqu’au ») et DDM (« de préférence avant »).
- Les restes deviennent une soupe ou un riz sauté.

@chiffres 10 | habitudes simples à adopter ; 60 à 80 g | de riz ou pâtes crus par adulte ; ${amountPrice('rice', 80)} | le prix de 80 g de riz

## Dix habitudes pour limiter le gaspillage

### Avant les courses

- **Prévoyez vos repas de la semaine** : cela aide à préparer une liste d’achats adaptée.
- **Faites une liste et tenez-vous-y** : les promotions « 2 achetés, 1 offert » sur le frais finissent souvent à la poubelle.
- **Regardez le placard et le frigo avant de partir**, pour ne pas racheter ce que vous avez déjà.
- **Achetez du surgelé** pour les légumes que vous utilisez petit à petit.

### À la maison

- **Rangez le frigo** : les produits qui périment le plus tôt devant, les nouveaux derrière.
- **Distinguez DLC et DDM** : voir le tableau plus bas.
- **Congelez** le pain, les restes de plats et les herbes fraîches.

### En cuisine

![Une casserole de soupe de légumes sur le feu, à côté de carottes, d’une demi-courgette et d’une pomme de terre](/images/blog/gaspillage-alimentaire-soupe-restes.jpg "Un fond de légumes devient une soupe.")

- **Cuisinez les bonnes quantités** : comptez par exemple 60 à 80 g de riz ou de pâtes crus par adulte.
- **Accommodez les restes** : un fond de légumes devient une soupe, du riz cuit devient un riz sauté.
- **Choisissez des recettes qui partagent des ingrédients**, pour finir les paquets entamés.

## Quelles recettes pour finir les restes ?

Quatre dîners de notre catalogue qui aident à finir un paquet ou un reste. Le temps et le coût par portion s’affichent sur chaque carte.

@recette riz-saute | Du riz cuit, des petits pois surgelés et une carotte, sautés à la poêle. La recette type pour le riz de la veille.

@recette soupe-petits-pois | Petits pois surgelés et pommes de terre. Le sachet surgelé se dose facilement : prenez juste ce qu’il faut.

@cta-court Pour ne plus racheter ce que vous avez déjà : VégéBudget prépare vos dîners de la semaine et la liste de courses adaptée à vos menus, en tenant compte de votre placard, selon les quantités renseignées.

@recette poelee-chou | Chou, pommes de terre et haricots dans une poêle : une façon d’utiliser un chou déjà entamé.

@recette semoule-pois | Elle utilise une demi-conserve de pois chiches : gardez l’autre moitié pour le repas suivant.

## DLC ou DDM : quelle différence ?

| Mention | Ce qu’elle veut dire | Après la date ? |
|---|---|---|
| **À consommer jusqu’au** (DLC) | Limite sanitaire | Ne pas consommer |
| **À consommer de préférence avant** (DDM) | Le goût ou la texture peuvent changer | Encore consommable |

Exemples de produits à DDM : les pâtes, le riz, les conserves.

## Combien de nourriture jette-t-on à la maison ?

D’après l’Ademe, chaque Français jette en moyenne **environ 30 kg de nourriture par an** à la maison, dont **7 kg encore emballés**. Restes de repas, fruits et légumes abîmés, pain sec, produits oubliés au fond du frigo : l’Ademe estime ce gaspillage à **environ 100 € par personne et par an**.

@video msWMjD7_Pjg | Comment limiter le gaspillage alimentaire ? | ConsoMag, Ademe

## Prévoir ses repas pour mieux utiliser ses ingrédients

Prévoir ses repas aide à identifier les ingrédients nécessaires. [VégéBudget](/) prépare la liste de courses en tenant compte des quantités disponibles et du format des produits à acheter.

- **Un exemple de semaine** : notre [menu de la semaine pas cher pour 2](/blog/menu-semaine-pas-cher).
- **Un paquet pour plusieurs dîners** : nos [recettes de lentilles pas chères](/blog/recettes-lentilles-pas-cheres).
- **Des légumes au bon moment** : le [calendrier des fruits et légumes de saison](/blog/fruits-legumes-de-saison).

## D’autres recettes qui finissent les paquets

@recettes salade-lentilles, pates-brocoli, epinards-pois-chiches

@cta Tenez compte de ce que vous avez déjà
`,
    faq: [
      ['Combien de nourriture un Français jette-t-il par an ?', 'Environ 30 kg par an à la maison selon l’Ademe, dont 7 kg de produits encore emballés, soit environ 100 € par personne et par an.'],
      ['Quelle est la différence entre DLC et DDM ?', 'La DLC (« à consommer jusqu’au ») est une limite sanitaire à respecter. La DDM (« à consommer de préférence avant ») indique seulement que le goût ou la texture peuvent changer après la date.'],
      ['Comment éviter d’acheter pour rien ?', 'Prévoir ses repas de la semaine aide à préparer une liste d’achats adaptée. Regardez aussi le placard et le frigo avant de partir, pour ne pas racheter ce que vous avez déjà.'],
      ['Que faire des restes de légumes et de riz ?', 'Un fond de légumes peut devenir une soupe, et du riz cuit un riz sauté. Les restes de plats et le pain se congèlent aussi.'],
    ],
    sources: [
      ['Gaspillage alimentaire : près de 250 foyers ont économisé l’équivalent de 21 400 repas (Ademe)', 'https://www.ademe.fr/presse/communique-national/gaspillage-alimentaire-pres-de-250-foyers-ont-economise-lequivalent-de-21-400-repas-en-1-an'],
      ['Comment traquer le gaspillage alimentaire ? (Ademe)', 'https://librairie.ademe.fr/dechets-economie-circulaire/5795-comment-traquer-le-gaspillage-alimentaire-.html'],
    ],
} satisfies Article;
