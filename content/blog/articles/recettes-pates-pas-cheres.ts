import type { Article } from '@/lib/blog-articles';
import { amountPrice, cost, kiloPrice, packPrice } from '@/lib/blog-cost';
import { ingredients } from '@/lib/catalog';
import { findRecipe, portionCost } from '@/lib/seo';

// Les 5 recettes du catalogue (lib/catalog.ts) qui contiennent des pâtes, pour 2 personnes.
// Coûts, temps et grammes de pâtes sont lus dans le catalogue : rien n'est écrit en dur.
const PATES = ['pates-brocoli', 'bolognaise-lentilles', 'penne-pois-chiches', 'minestrone-haricots', 'pates-champignons'];
const AVEC: Record<string, string> = {
  'pates-brocoli': 'brocoli, pois chiches',
  'bolognaise-lentilles': 'lentilles corail',
  'penne-pois-chiches': 'pois chiches, tomate',
  'minestrone-haricots': 'haricots blancs, légumes',
  'pates-champignons': 'champignons, petits pois',
};
const recette = (id: string) => {
  const r = findRecipe(id);
  if (!r) throw new Error(`Recette ${id} absente : revoir /blog/recettes-pates-pas-cheres.`);
  return r;
};
const grammes = (id: string, ing = 'pasta') => {
  const x = recette(id).ingredients.find(y => y.id === ing);
  if (!x) throw new Error(`Plus de ${ing} dans ${id} : revoir /blog/recettes-pates-pas-cheres.`);
  return x.qty;
};
const parPortion = (id: string) => portionCost(recette(id));
const tries = [...PATES].sort((a, b) => parPortion(a) - parPortion(b));
const pates = ingredients.find(i => i.id === 'pasta');
if (!pates || pates.unit !== 'g') throw new Error('Pâtes absentes du catalogue : revoir /blog/recettes-pates-pas-cheres.');
// Le texte dit que les pâtes au brocoli sont la recette la moins chère.
if (tries[0] !== 'pates-brocoli') throw new Error('Les pâtes au brocoli ne sont plus les moins chères : revoir /blog/recettes-pates-pas-cheres.');
// Le texte dit que les 4 plats de pâtes utilisent 90 g de pâtes crues par personne (le minestrone moins).
const PLATS = PATES.filter(id => id !== 'minestrone-haricots');
if (!PLATS.every(id => grammes(id) === 180)) throw new Error('Les plats de pâtes n’utilisent plus 180 g pour 2 : revoir /blog/recettes-pates-pas-cheres.');
if (grammes('minestrone-haricots') >= 180) throw new Error('Le minestrone n’utilise plus moins de pâtes : revoir /blog/recettes-pates-pas-cheres.');
// Le texte dit qu'un paquet fait 2 dîners pour 2, avec un reste.
if (pates.pack !== 500) throw new Error('Le paquet de pâtes ne fait plus 500 g : revoir /blog/recettes-pates-pas-cheres.');
if (Math.floor(pates.pack / 180) !== 2) throw new Error('Le paquet de pâtes ne fait plus 2 dîners pour 2 : revoir /blog/recettes-pates-pas-cheres.');
// Le texte donne la légumineuse d'une portion (recette pour 2) : 50 g de lentilles, 120 g de pois chiches, 125 g de haricots.
if (grammes('bolognaise-lentilles', 'red-lentils') !== 100) throw new Error('La bolognaise n’a plus 100 g de lentilles pour 2 : revoir /blog/recettes-pates-pas-cheres.');
if (grammes('penne-pois-chiches', 'chickpeas') !== 240) throw new Error('Les penne n’ont plus 240 g de pois chiches pour 2 : revoir /blog/recettes-pates-pas-cheres.');
if (grammes('minestrone-haricots', 'white-beans') !== 250) throw new Error('Le minestrone n’a plus 250 g de haricots pour 2 : revoir /blog/recettes-pates-pas-cheres.');
const moinsCher = cost(tries[0]);
const plusCher = cost(tries[tries.length - 1]);

const rapide = Math.min(...PATES.map(id => recette(id).minutes));

const tableau = tries.map(id => `| [${recette(id).title}](/recettes/${id}) | ${AVEC[id]} | ${recette(id).minutes} min | ${cost(id)} |`).join('\n');

export default {
  slug: 'recettes-pates-pas-cheres',
  title: 'Recettes de pâtes pas chères : 5 dîners sans viande et leur coût',
  seoTitle: 'Recettes de pâtes pas chères : 5 dîners sans viande chiffrés',
  description: 'Recettes de pâtes pas chères sans viande : bolognaise de lentilles, pâtes au brocoli, penne aux pois chiches… Coût par portion et grammes par personne.',
  lead: `Nos 5 recettes de pâtes pas chères sans viande coûtent de ${moinsCher} à ${plusCher} la portion, et la moins chère, ce sont les pâtes au brocoli et au citron. Comptez 90 g de pâtes crues par personne : un paquet de pâtes (${packPrice('pasta')}) fait 2 dîners pour 2.`,
  category: 'Recettes',
  keywords: ['recettes de pâtes pas chères', 'recette pâtes pas chère sans viande', 'idée pâtes du soir', 'quantité de pâtes par personne', 'bolognaise sans viande lentilles', 'pâtes complètes ou blanches'],
  date: '2026-11-19',
  coverAlt: 'Recettes de pâtes pas chères : une assiette de pâtes à la sauce tomate, du brocoli et des pois chiches',
  body: `
@essentiel
- **5 recettes de pâtes sans viande**, de ${moinsCher} à ${plusCher} la portion.
- **90 g de pâtes crues** par personne dans nos plats de pâtes.
- **Lentilles, pois chiches ou haricots** remplacent la viande dans la sauce.
- **Un paquet de 500 g** suffit pour 2 dîners à deux.

@chiffres ${moinsCher} | la portion la moins chère ; ${packPrice('pasta')} | le paquet de pâtes ; ${rapide} min | pour les recettes les plus rapides

## Quelles recettes de pâtes pas chères faire le soir ?

@recette pates-brocoli | Le brocoli surgelé cuit avec les pâtes, puis on ajoute l’ail, les pois chiches et le citron. Une seule casserole d’eau.

@recette bolognaise-lentilles | Les lentilles corail et une carotte râpée cuisent dans la sauce tomate en 20 min. La sauce peut se préparer la veille.

@recette penne-pois-chiches | Une sauce tomate à l’oignon et à l’ail, des pois chiches et du basilic.

@cta-court Un paquet de pâtes et une conserve de pois chiches au placard ? Notez-les dans VégéBudget : il en tient compte pour choisir vos dîners et les retire de la liste de courses.

@recette pates-champignons | Des champignons dorés, des petits pois et une sauce au yaourt de soja ajoutée hors du feu.

@recette minestrone-haricots | Une soupe-repas avec des pâtes, des haricots blancs, du chou, des carottes et des pommes de terre. Le lendemain, ajoutez un peu d’eau en réchauffant : les pâtes boivent le bouillon.

## Combien coûte une assiette de pâtes sans viande ?

| Recette | Avec | Temps | Coût par portion |
|---|---|---|---|
${tableau}

Coût estimé des ingrédients, prix relevés le 7 octobre 2026 sur carrefour.fr, marques distributeur, hors promotions. Ce n’est pas le montant payé en caisse : vous achetez des paquets entiers, dont une partie reste pour d’autres repas.

Les pâtes elles-mêmes pèsent peu dans le prix : ${kiloPrice('pasta')}, soit ${amountPrice('pasta', 90)} pour une portion de 90 g. C’est la sauce qui fait le prix. Pour lire les étiquettes, voyez comment [comparer les prix au kilo](/blog/comparer-prix-au-kilo).

## Quelle quantité de pâtes prévoir par personne ?

Nos plats de pâtes comptent **180 g de pâtes crues pour 2**, soit 90 g par personne. Le minestrone en met moins, car les haricots et les légumes complètent la soupe.

![Pâtes au brocoli, pois chiches et citron dans une assiette](/images/recettes/pates-brocoli.jpg "Pâtes au brocoli et au citron : la recette la moins chère de la liste.")

- **Cuisinez pour deux** : un paquet de 500 g fait 2 dîners, avec un petit reste.
- **Il en reste ?** Gardez les pâtes cuites au frais. Des idées pour les finir : [que faire avec des restes](/blog/que-faire-avec-des-restes).
- **Seul à table ?** Préparez la sauce pour 2 et gardez-en la moitié pour le lendemain.

## Quoi mettre dans les pâtes à la place de la viande ?

Une légumineuse dans la sauce suffit, et la portion coûte peu :

- **Lentilles corail** : 50 g par personne dans la bolognaise, soit ${amountPrice('red-lentils', 50)}. Plus d’idées dans nos [recettes de lentilles pas chères](/blog/recettes-lentilles-pas-cheres).
- **Pois chiches** : 120 g par personne dans les penne, soit ${amountPrice('chickpeas', 120)}, à égoutter. D’autres idées dans nos [recettes de pois chiches](/blog/recettes-pois-chiches).
- **Haricots blancs** : 125 g par personne dans le minestrone, soit ${amountPrice('white-beans', 125)}.

Pour d’autres plats que les pâtes, lisez comment [remplacer la viande sans dépenser plus](/blog/remplacer-la-viande-pas-cher).

## Pâtes complètes ou blanches : lesquelles choisir ?

> Les pâtes complètes font partie des féculents complets : Santé publique France conseille d’en manger au moins un par jour, en commençant par du semi-complet si besoin.

Nos recettes se font avec les unes comme avec les autres. Vérifiez seulement le temps de cuisson sur le paquet : il change d’une sorte à l’autre.

@recettes pates-brocoli, bolognaise-lentilles, penne-pois-chiches

@cta Organisez les dîners de la semaine selon votre budget
`,
  faq: [
    ['Quelle quantité de pâtes par personne ?', 'Nos recettes de pâtes comptent 90 g de pâtes crues par personne, soit 180 g pour 2. Dans une soupe comme le minestrone, on en met moins, car les haricots et les légumes complètent le plat.'],
    ['Quelle est la recette de pâtes la moins chère ?', `Dans notre catalogue, ce sont les pâtes au brocoli et au citron : ${cost('pates-brocoli')} la portion, coût estimé des ingrédients avec les prix relevés le 7 octobre 2026 sur carrefour.fr.`],
    ['Comment faire une bolognaise sans viande ?', 'Remplacez la viande hachée par des lentilles corail : faites revenir un oignon et de l’ail, ajoutez des tomates en conserve et les lentilles, et laissez-les cuire dans la sauce. Les pois chiches ou les haricots blancs marchent aussi dans une sauce tomate.'],
    ['Combien coûte un paquet de pâtes ?', `Dans notre catalogue, le paquet de pâtes de 500 g coûte ${packPrice('pasta')}, soit ${kiloPrice('pasta')}. Prix relevé le 7 octobre 2026 sur carrefour.fr, marque distributeur, hors promotions.`],
    ['Faut-il choisir des pâtes complètes ?', 'Santé publique France conseille de manger au moins un féculent complet par jour, comme des pâtes complètes, et de commencer par du semi-complet si besoin. Nos recettes se font avec les unes comme avec les autres.'],
  ],
  sources: [
    ['Privilégier les féculents complets pour une alimentation saine (Santé publique France, sante.fr)', 'https://www.sante.fr/privilegier-les-feculents-complets-pour-une-alimentation-saine'],
  ],
} satisfies Article;
