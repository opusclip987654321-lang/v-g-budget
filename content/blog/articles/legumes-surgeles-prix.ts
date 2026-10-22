import type { Article } from '@/lib/blog-articles';
import { kiloPrice } from '@/lib/blog-cost';
import { ingredients } from '@/lib/catalog';

// Comparaison des prix au kilo : uniquement les légumes du catalogue (relevés carrefour.fr).
// Le catalogue n'a ni épinards, ni petits pois, ni brocoli frais : on compare par familles, pas légume par légume.
const ligne = (nom: string, forme: string, id: string) => `| ${nom} | ${forme} | ${kiloPrice(id)} |`;
const tableau = [
  '| Légume | Rayon | Prix |',
  '|---|---|---|',
  ligne('Épinards', 'surgelé', 'spinach'),
  ligne('Petits pois', 'surgelé', 'peas'),
  ligne('Brocoli', 'surgelé', 'broccoli'),
  ligne('Tomates', 'frais fragile', 'fresh-tomato'),
  ligne('Courgettes', 'frais fragile', 'zucchini'),
  ligne('Courge', 'frais fragile', 'squash'),
  ligne('Champignons', 'frais fragile', 'mushroom'),
  ligne('Pommes de terre', 'frais de garde', 'potato'),
  ligne('Oignons', 'frais de garde', 'onion'),
  ligne('Chou blanc', 'frais de garde', 'cabbage'),
  ligne('Carottes', 'frais de garde', 'carrot'),
].join('\n');
// Le texte compare ces prix en toutes lettres : si un relevé inverse une comparaison, la construction échoue.
const kg = (id: string) => { const i = ingredients.find(x => x.id === id); if (!i) throw new Error(`Ingrédient inconnu : ${id}`); return i.price / i.pack; };
const surgelesBas = Math.max(kg('spinach'), kg('peas'));
if (!(Math.max(kg('potato'), kg('onion')) < Math.min(kg('spinach'), kg('peas'), kg('broccoli')) && Math.min(kg('cabbage'), kg('carrot')) > surgelesBas && Math.min(kg('zucchini'), kg('fresh-tomato'), kg('squash'), kg('mushroom')) > Math.max(surgelesBas, kg('broccoli'))))
  throw new Error('Les prix du catalogue ont changé : revoir les comparaisons de /blog/legumes-surgeles-prix.');

export default {
  slug: 'legumes-surgeles-prix',
  title: 'Légumes surgelés : sont-ils vraiment moins chers que le frais ?',
  seoTitle: 'Légumes surgelés moins chers que le frais ? Prix au kilo',
  description: 'Légumes surgelés moins chers que le frais ? Les prix au kilo comparés, ce que dit Manger Bouger des vitamines et 8 dîners pas chers avec leur coût par portion.',
  lead: `Les légumes surgelés sont souvent moins chers que le frais : les épinards surgelés coûtent ${kiloPrice('spinach')}, les courgettes fraîches ${kiloPrice('zucchini')}. Seuls les oignons et les pommes de terre coûtent encore moins cher en frais.`,
  category: 'Budget',
  keywords: ['légumes surgelés moins cher que frais', 'légumes surgelés ou frais', 'prix légumes surgelés', 'légumes surgelés bon pour la santé', 'légumes surgelés vitamines', 'recette légumes surgelés pas cher', 'légumes surgelés 5 fruits et légumes'],
  date: '2026-10-22',
  coverAlt: 'Légumes surgelés moins chers que le frais : sachets d’épinards, de petits pois et de brocoli dans un tiroir de congélateur',
  body: `
@essentiel
- **Épinards, petits pois, brocoli surgelés** coûtent moins cher au kilo que les légumes frais fragiles (courgettes, tomates, champignons).
- **Pommes de terre et oignons** frais coûtent encore moins cher : inutile de les prendre surgelés.
- **Pas d’épluchures ni de perte** : vous prenez la quantité de la recette, le reste du sachet attend au congélateur.
- **Ils comptent dans les 5 fruits et légumes par jour**, selon Manger Bouger.

@chiffres ${kiloPrice('spinach')} | épinards surgelés ; ${kiloPrice('zucchini')} | courgettes fraîches ; 80 à 100 g | une portion de légumes, Manger Bouger

## Les légumes surgelés sont-ils moins chers que les frais ?

**Oui pour les légumes fragiles, non pour les pommes de terre et les oignons.** Les épinards surgelés (${kiloPrice('spinach')}) coûtent moins cher que les courgettes (${kiloPrice('zucchini')}) ou les tomates fraîches (${kiloPrice('fresh-tomato')}). Les légumes de nos recettes, au kilo :

${tableau}

- **Pommes de terre et oignons frais** : moins chers que tous les surgelés, inutile de les prendre surgelés.
- **Chou et carottes frais** : plus chers que les épinards et les petits pois surgelés.
- **Le prix du frais s’entend avant épluchage** : Manger Bouger conseille de comparer le prix au kilo une fois épluché, et rappelle que surgelés et conserves sont souvent moins chers que le frais.

> Prix relevés le 7 octobre 2026 sur carrefour.fr, marques distributeur, hors promotions.

## Quelles recettes pas chères avec des légumes surgelés ?

![Petits pois, épinards et brocoli surgelés dans trois bols en verre](/images/blog/menu-semaine-pas-cher-surgeles.jpg "Petits pois, épinards et brocoli : les trois surgelés de nos recettes.")

Cinq dîners qui partent d’un sachet du congélateur et de quelques produits du placard. Le montant affiché est le coût estimé des ingrédients par portion.

@recette epinards-pois-chiches | Épinards surgelés, pois chiches en boîte et riz : un dîner de placard, sans rien éplucher.

@recette curry-corail | Les épinards surgelés vont directement dans la sauce, en fin de cuisson.

@recette pates-brocoli | Le brocoli cuit dans l’eau des pâtes : une casserole suffit.

@recette soupe-petits-pois | Petits pois surgelés et pomme de terre fraîche : le surgelé et le frais dans la même casserole.

@recette riz-saute | Petits pois surgelés et carottes fraîches dans une seule poêle.

@cta-court Indiquez à VégéBudget votre budget et le demi-sachet qui reste au congélateur : il planifie vos dîners de la semaine et vous donne la liste de courses avec son montant estimé. Première semaine gratuite, sans compte.

## Les légumes surgelés gardent-ils leurs vitamines ?

**Oui.** Selon Manger Bouger, les fruits et légumes surgelés conservent toutes leurs qualités nutritionnelles et se gardent longtemps. Le site les range parmi les produits à avoir chez soi.

> Choisissez-les **bruts**, sans sauce ni assaisonnement : ils sont moins chers et vous dosez vous-même le sel et la matière grasse.

## Les légumes surgelés comptent-ils dans les 5 fruits et légumes par jour ?

Oui. Manger Bouger précise que les fruits et légumes comptent qu’ils soient frais, surgelés ou en conserve, cuits ou crus. Une portion pour un adulte pèse 80 à 100 g.

## Légumes surgelés ou frais : lequel choisir ?

- **Hors saison** : le surgelé remplace les légumes d’été en hiver (voir nos [fruits et légumes de saison](/blog/fruits-legumes-de-saison)).
- **En fin de mois** : un sachet au congélateur et un fond de placard font un dîner (nos idées pour [manger en fin de mois](/blog/que-manger-fin-de-mois)).
- **Pour une petite quantité** : vous prenez 150 g sans entamer un légume entier, et rien ne finit à la poubelle (voir [gaspillage alimentaire](/blog/gaspillage-alimentaire)).
- **Les soirs pressés** : pas d’épluchage ni de découpe.
- **En frais** pour les pommes de terre et les oignons, moins chers que tous les surgelés de nos relevés.

Le plus simple est souvent de mélanger les deux, comme dans la [soupe de petits pois](/recettes/soupe-petits-pois). C’est ce que fait VégéBudget : il part de ce que vous avez déjà, puis complète la liste de courses selon votre budget.

## D’autres recettes avec des légumes surgelés

@recettes semoule-pois, pates-champignons, tofu-cacahuete

Pour organiser toute une semaine, voyez aussi notre [menu de la semaine pas cher](/blog/menu-semaine-pas-cher) ou toutes nos [recettes](/recettes).

@cta Tenez compte de ce que vous avez déjà
`,
  faq: [
    ['Les légumes surgelés perdent-ils leurs vitamines ?', 'Selon Manger Bouger (Santé publique France), les fruits et légumes surgelés conservent toutes leurs qualités nutritionnelles. Choisissez-les bruts, sans sauce, pour doser vous-même le sel et la matière grasse.'],
    ['Les légumes surgelés comptent-ils dans les 5 fruits et légumes par jour ?', 'Oui. Manger Bouger indique que les fruits et légumes comptent qu’ils soient frais, surgelés ou en conserve. Une portion pour un adulte pèse 80 à 100 g.'],
    ['Quels légumes surgelés sont les moins chers ?', `Dans nos relevés, les épinards surgelés coûtent ${kiloPrice('spinach')} et les petits pois surgelés ${kiloPrice('peas')}, prix carrefour.fr du 7 octobre 2026, marques distributeur. Le brocoli surgelé revient à ${kiloPrice('broccoli')}.`],
    ['Faut-il acheter les pommes de terre ou les oignons surgelés ?', `Non, pas pour économiser : en frais, ils coûtent moins cher que tous les surgelés de nos relevés, ${kiloPrice('potato')} pour les pommes de terre et ${kiloPrice('onion')} pour les oignons (carrefour.fr, 7 octobre 2026).`],
  ],
  sources: [
    ['Les aliments économiques (Manger Bouger, Santé publique France)', 'https://www.mangerbouger.fr/manger-mieux/bien-manger-sans-se-ruiner/bien-manger-en-preservant-la-planete-sans-se-ruiner-c-est-possible/les-aliments-economiques'],
    ['Les indispensables à avoir chez soi pour varier ses repas (Manger Bouger)', 'https://www.mangerbouger.fr/manger-mieux/se-faire-plaisir-en-mangeant-equilibre/manger-equilibre-ca-veut-dire-quoi-et-comment-y-arriver/les-indispensables-a-avoir-chez-soi-pour-varier-ses-repas'],
    ['Augmenter les fruits et légumes (Manger Bouger)', 'https://www.mangerbouger.fr/l-essentiel/les-recommandations-sur-l-alimentation-l-activite-physique-et-la-sedentarite/augmenter/augmenter-les-fruits-et-legumes'],
  ],
} satisfies Article;
