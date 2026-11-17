import type { Article } from '@/lib/blog-articles';
import { amountPrice, cost, kiloPrice, packPrice } from '@/lib/blog-cost';
import { ingredients, recipes } from '@/lib/catalog';

// Prix du tofu et des légumes secs tirés du catalogue (lib/catalog.ts) : rien n'est écrit en dur.
// Garde-fous : le texte dit que le tofu est plus cher au kilo que les légumes secs du tableau,
// et que la recette tofu-cacahuete utilise un bloc de 200 g pour 2 portions.
const kg = (id: string) => { const i = ingredients.find(x => x.id === id); if (!i) throw new Error(`${id} absent du catalogue : revoir /blog/comment-cuisiner-le-tofu.`); return i.price / i.pack * 1000; };
const COMPARES = ['green-lentils', 'red-lentils', 'chickpeas', 'kidney', 'white-beans'];
if (!COMPARES.every(id => kg('tofu') > kg(id))) throw new Error('Le tofu n’est plus le plus cher au kilo : revoir /blog/comment-cuisiner-le-tofu.');
const tofuRecette = recipes.find(r => r.id === 'tofu-cacahuete');
const tofuQty = tofuRecette?.ingredients.find(x => x.id === 'tofu')?.qty;
// Les recettes du catalogue sont toutes données pour 2 portions.
if (!tofuRecette || tofuQty !== 200) throw new Error('La recette tofu-cacahuete a changé (200 g pour 2) : revoir /blog/comment-cuisiner-le-tofu.');
['riz-saute', 'nouilles-legumes', 'bowl-arc-en-ciel'].forEach(id => { if (!recipes.some(r => r.id === id)) throw new Error(`Recette ${id} absente : revoir /blog/comment-cuisiner-le-tofu.`); });

export default {
  slug: 'comment-cuisiner-le-tofu',
  title: 'Comment cuisiner le tofu : la méthode, le prix au kilo et 3 recettes du soir',
  seoTitle: 'Comment cuisiner le tofu : méthode, prix au kilo, recettes',
  description: 'Comment cuisiner le tofu : séchez-le, faites-le dorer, ajoutez la sauce. Son prix au kilo face aux lentilles et 3 recettes du soir pas chères.',
  lead: `Pour cuisiner le tofu, séchez-le, coupez-le en dés, faites-le dorer 6 à 8 min dans un peu d’huile, puis ajoutez une sauce : c’est elle qui lui donne du goût. Le bloc coûte ${packPrice('tofu')}, de quoi faire 2 portions.`,
  category: 'Recettes',
  keywords: ['comment cuisiner le tofu', 'tofu prix au kilo', 'comment rendre le tofu bon', 'tofu croustillant', 'recette tofu pas cher', 'tofu ferme ou soyeux', 'conservation tofu ouvert'],
  date: '2026-11-17',
  coverAlt: 'Comment cuisiner le tofu : un bloc de tofu coupé en dés sur une planche et des dés dorés dans une poêle',
  body: `
@essentiel
- **Séchez le tofu** avec un linge propre avant de le cuire : il dore au lieu de bouillir.
- **Faites-le dorer 6 à 8 min** à la poêle, puis ajoutez la sauce à la fin.
- **Un bloc de tofu** coûte ${packPrice('tofu')} et suffit pour 2 portions.
- **Plus cher que les légumes secs** au kilo : gardez-le pour un ou deux soirs par semaine.

@chiffres ${packPrice('tofu')} | le bloc de tofu nature ; 6 à 8 min | pour le faire dorer ; ${cost('tofu-cacahuete')} | la portion de tofu à la cacahuète

## Comment cuisiner le tofu pour qu’il soit bon ?

Le tofu nature a un goût très discret. Il prend celui de ce qu’on lui ajoute, à condition d’avoir d’abord retiré son eau.

- **Égouttez** le bloc, puis séchez-le dans un linge propre en appuyant doucement.
- **Coupez-le en dés** de 2 cm environ : plus de surface, plus de parties dorées.
- **Faites dorer** les dés dans un peu d’huile bien chaude, 6 à 8 min, en les retournant de temps en temps.
- **Ajoutez la sauce à la fin** : sauce soja, beurre de cacahuète, jus de citron. Il suffit de 2 min pour bien enrober le tofu.

![Dés de tofu dorés avec du riz, du brocoli et une sauce à la cacahuète](/images/recettes/tofu-cacahuete.jpg "Les dés de tofu dorés, puis enrobés de sauce à la cacahuète.")

> Pour des dés plus dorés, ne les remuez pas pendant les premières minutes et ne remplissez pas trop la poêle.

## Quelles recettes de tofu pas chères faire le soir ?

@recette tofu-cacahuete | Le tofu doré, une sauce au beurre de cacahuète et au citron, du riz et du brocoli. Un bloc de 200 g pour 2 portions.

Le tofu s’ajoute aussi à des recettes qui n’en prévoient pas. Comptez 100 g par personne, comme dans le [tofu à la cacahuète](/recettes/tofu-cacahuete), soit ${amountPrice('tofu', 100)} de plus par portion.

@recette riz-saute | Riz, petits pois et carottes à la sauce soja, sans tofu dans la recette. Faites dorer les dés à part, puis ajoutez-les avec le riz.

@recette nouilles-legumes | Pas de tofu dans la recette, mais la même sauce à la cacahuète : ajoutez les dés dorés avec les nouilles.

@cta-court Il vous reste un demi-bloc de tofu ? Notez-le dans votre placard VégéBudget : il en tient compte pour choisir vos dîners de la semaine et calculer la liste de courses.

## Tofu : quel prix au kilo ?

Le tofu nature revient à ${kiloPrice('tofu')}. C’est plus cher que les légumes secs, qui jouent le même rôle dans un dîner sans viande.

| Produit | Prix au kilo |
|---|---|
| Tofu nature | ${kiloPrice('tofu')} |
| Lentilles vertes sèches | ${kiloPrice('green-lentils')} |
| Lentilles corail sèches | ${kiloPrice('red-lentils')} |
| Pois chiches cuits, égouttés | ${kiloPrice('chickpeas')} |
| Haricots rouges cuits, égouttés | ${kiloPrice('kidney')} |

Prix relevés le 7 octobre 2026 sur carrefour.fr, marques distributeur, hors promotions. Les lentilles sèches gonflent à la cuisson : leur prix au kilo cuit est encore plus bas. Pour comparer le coût des protéines, voyez notre article sur les [protéines végétales](/blog/proteines-vegetales), et, pour lire les étiquettes, celui qui explique comment [comparer les prix au kilo](/blog/comparer-prix-au-kilo).

## Tofu ferme ou soyeux : lequel choisir ?

| Tofu | Texture | Pour quoi faire |
|---|---|---|
| Ferme (nature) | Se coupe en dés | Poêlées, riz sauté, curry |
| Soyeux | Comme une crème | Sauces, soupes, desserts |

Pour un dîner à la poêle, prenez du tofu ferme : le soyeux se défait à la cuisson. Le tofu fumé ou mariné a déjà du goût : comparez son prix au kilo avec celui du nature avant de choisir.

## Combien de temps se conserve le tofu ouvert ?

- **Au réfrigérateur**, dans une boîte fermée.
- **Respectez la durée** indiquée sur l’emballage après ouverture.
- **Seul à table ?** Prévoyez un second dîner au tofu dans la semaine pour finir le bloc.

Le tofu est à base de soja, l’un des 14 allergènes que les emballages doivent signaler.

> Envie d’alterner avec des légumes secs ? Voyez nos [recettes de lentilles pas chères](/blog/recettes-lentilles-pas-cheres) et comment [remplacer la viande sans dépenser plus](/blog/remplacer-la-viande-pas-cher).

@recettes tofu-cacahuete, bowl-arc-en-ciel, nouilles-legumes

@cta Organisez vos dîners de la semaine selon votre budget
`,
  faq: [
    ['Comment rendre le tofu croustillant ?', 'Séchez bien le tofu dans un linge propre, coupez-le en dés et faites-le dorer dans une poêle bien chaude, sans trop la remplir et sans y toucher pendant les premières minutes. Ajoutez la sauce seulement à la fin.'],
    ['Combien coûte le tofu au kilo ?', `Le tofu nature de notre catalogue revient à ${kiloPrice('tofu')} (${packPrice('tofu')}), contre ${kiloPrice('green-lentils')} pour les lentilles vertes sèches. Prix relevés le 7 octobre 2026 sur carrefour.fr, marques distributeur.`],
    ['Tofu ferme ou soyeux : lequel choisir ?', 'Prenez du tofu ferme pour les poêlées, le riz sauté ou un curry : il se coupe en dés et tient à la cuisson. Le tofu soyeux, qui a la texture d’une crème, sert plutôt pour les sauces, les soupes et les desserts.'],
    ['Combien de temps se conserve un tofu ouvert ?', 'Gardez-le au réfrigérateur dans une boîte fermée et respectez la durée indiquée sur l’emballage après ouverture : elle varie selon les fabricants.'],
    ['Combien de tofu par personne ?', `Comptez environ 100 g par personne pour un dîner : la recette du tofu à la cacahuète utilise un bloc de 200 g pour 2 portions, soit ${amountPrice('tofu', 100)} de tofu par portion.`],
  ],
  sources: [
    ['Règlement (UE) n° 1169/2011, annexe II : substances provoquant des allergies, dont le soja (EUR-Lex)', 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32011R1169'],
  ],
} satisfies Article;
