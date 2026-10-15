import type { Article } from '@/lib/blog-articles';
import { anchor } from '@/lib/anchor';
import { money, packLabel, quantity, type ShopItem } from '@/lib/planner';
import { PRICE_SOURCE } from '@/lib/pricing';
import { findRecipe } from '@/lib/seo';
import { DAYS, DISHES, PANTRY_IDS, usedLabel, weekPlan } from '@/lib/semaine-type';

// Semaine type complète (7 jours, 2 adultes). Tous les montants sont calculés par lib/semaine-type.ts
// avec les prix du catalogue : ils changent tout seuls au prochain relevé de prix.
const w = weekPlan();
const dish = (id: string) => DISHES.find(d => d.id === id)!;
const meal = (id: string) => w.meals.find(m => m.id === id)!;
const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

// « 340 g de lentilles vertes », « 20 ml d’huile », « 1 citron ».
const names: Record<string, string> = {
  'green-lentils': 'lentilles vertes', carrot: 'carottes', onion: 'oignons', potato: 'pommes de terre', tomato: 'tomates concassées',
  oil: 'huile', cumin: 'cumin', salt: 'sel', chickpeas: 'pois chiches cuits', spinach: 'épinards surgelés', rice: 'riz', pasta: 'pâtes',
  garlic: 'ail', kidney: 'haricots rouges cuits', couscous: 'semoule', curry: 'curry', bread: 'pain', peanut: 'beurre de cacahuète', yogurt: 'yaourt de soja',
};
// « d’huile », « d’ail », mais « de haricots » (h aspiré).
const of = (name: string) => /^([aeiouéè]|huile)/i.test(name) ? `d’${name}` : `de ${name}`;
const amount = (id: string, qty: number) => id === 'lemon' ? `${qty} citron${qty > 1 ? 's' : ''}` : `${quantity(qty, id === 'oil' ? 'ml' : 'g')} ${of(names[id])}`;
const recipeOf = (id: string) => dish(id).qty.map(([i, q]) => amount(i, q)).join(', ');

const dinners = DAYS.map(([day, , id]) => ({ day, id, title: `${day} : ${lower(dish(id).title)}` }));

const menuTable = [
  '| Jour | Petit-déjeuner | Midi | Soir |',
  '|---|---|---|---|',
  ...DAYS.map(([day, , dinner, , lunch], n) => `| **${day}** | Tartines, yaourt de soja | ${lunch ? dish(lunch).title : `Reste : ${lower(dish(DAYS[n - 1][2]).short)}`} | [${dish(dinner).title}](#${anchor(dinners[n].title)}) |`),
].join('\n');

const dayBlocks = DAYS.map(([, , id, servings, lunch], n) => {
  const d = dish(id); const m = meal(id);
  const next = DAYS[n + 1]?.[0];
  const lines = [
    lunch ? `- **Midi, pour 2 :** ${lower(dish(lunch).title)}. ${recipeOf(lunch)}.` : `- **Midi :** le reste du dîner de ${DAYS[n - 1][0].toLowerCase()}.`,
    `- **Soir, pour ${servings} portions :** ${recipeOf(id)}.`,
    `- **Coût du dîner :** ${money(m.cost)}, soit ${money(m.perPortion)} la portion.${next && servings === 4 ? ` Gardez 2 portions pour ${next.toLowerCase()} midi.` : ''}`,
    ...(d.recipe ? [`- **La recette :** [${findRecipe(d.recipe)?.title}](/recettes/${d.recipe})${d.note ? `, ${d.note}` : ''}.`] : []),
  ];
  return `### ${dinners[n].title}\n\n${lines.join('\n')}`;
}).join('\n\n');

const costTable = [
  '| Repas | Portions | Coût | La portion |',
  '|---|---|---|---|',
  ...w.meals.map(m => `| ${m.id === 'petit-dejeuner' ? `Petit-déjeuner (× ${m.count})` : m.dish.title} | ${m.portions} | ${money(m.cost)} | ${money(m.perPortion)} |`),
].join('\n');

// Liste de courses : un rayon par ligne ; huile, sel et épices à part, à vérifier dans le placard.
const aisles: [string, (id: string, category: string) => boolean][] = [
  ['Fruits et légumes', (id, c) => c === 'Fruits et légumes' && id !== 'spinach'],
  ['Surgelés', id => id === 'spinach'],
  ['Féculents', (id, c) => c === 'Féculents' && !PANTRY_IDS.includes(id)],
  ['Légumes secs', (id, c) => c === 'Légumineuses' && !PANTRY_IDS.includes(id)],
  ['Épicerie', (id, c) => c === 'Épicerie' && !PANTRY_IDS.includes(id)],
  ['À vérifier dans votre placard', id => PANTRY_IDS.includes(id)],
];
const listTable = [
  '| Rayon | À acheter | Utilisé dans la semaine | En caisse |',
  '|---|---|---|---|',
  ...aisles.map(([label, keep]) => {
    const list = w.items.filter(i => keep(i.id, i.ingredient.category));
    const name = (i: ShopItem) => lower(i.ingredient.name.replace(/, égouttés$/, ''));
    // L'ail est vendu à la tête (50 g estimés dans le catalogue), le citron à la pièce.
    const buy = list.map(i => i.id === 'garlic' ? `${i.packages} tête${i.packages > 1 ? 's' : ''} d’ail` : i.ingredient.unit === 'pièce' && i.ingredient.pack === 1 ? packLabel(i.packages, 1, 'pièce', i.ingredient.name) : `${name(i)} ${packLabel(i.packages, i.ingredient.pack, i.ingredient.unit, i.ingredient.name)}`).join(' ; ');
    const used = list.map(i => i.ingredient.unit === 'pièce' ? `${i.required} ${lower(i.ingredient.name)}${i.required > 1 ? 's' : ''}` : `${name(i)} ${usedLabel(i)}`).join(' ; ');
    return `| **${label}** | ${buy} | ${used} | ${money(list.reduce((s, i) => s + i.purchaseCost, 0))} |`;
  }),
].join('\n');

// Les restes les plus utiles (en valeur), hors huile, sel et épices.
const leftovers = w.items.filter(i => i.surplus > 0 && !PANTRY_IDS.includes(i.id))
  .sort((a, b) => b.surplus * b.ingredient.price / b.ingredient.pack - a.surplus * a.ingredient.price / a.ingredient.pack).slice(0, 6)
  .map(i => `${quantity(i.surplus, i.ingredient.unit)} ${of(names[i.id] ?? lower(i.ingredient.name))}`).join(', ');

const source = `${PRICE_SOURCE.charAt(0).toLowerCase()}${PRICE_SOURCE.slice(1)}`;

export default {
    slug: 'menu-semaine-pas-cher',
    title: 'Menu de la semaine végétarien pas cher pour 2 : 7 jours et la liste de courses',
    description: `Une semaine sans viande pour 2 : 7 dîners, les midis avec les restes, les petits-déjeuners, la liste de courses par rayon. ${money(w.used)} consommés, ${money(w.purchase)} en caisse.`,
    lead: 'Voici une semaine complète pour deux adultes : sept dîners, les midis avec les restes et des petits-déjeuners simples, le tout 100 % végétal. Vous avez la liste de courses par rayon et deux montants : ce que vous mangez, et ce que vous payez en caisse.',
    category: 'Budget', keywords: ['menu de la semaine pas cher', 'menu semaine végétarien', 'menu sans viande pour 2', 'menu semaine petit budget', 'liste de courses semaine', 'repas de la semaine avec les restes'],
    date: '2026-10-07',
    updated: '2026-10-15',
    coverAlt: 'Menu de la semaine pas cher : une assiette de curry de lentilles corail avec du riz et une assiette de pâtes au brocoli',
    photo: true,
    itemList: { name: 'Les 7 dîners de la semaine', items: dinners.map(d => ({ name: d.title, anchor: anchor(d.title) })) },
    body: `
@essentiel
- 7 jours, 3 repas, 2 personnes : ${w.portions} portions.
- **${money(w.used)}** pour ce que vous mangez, soit ${money(w.perPortion)} la portion.
- **${money(w.purchase)}** en caisse pour les paquets entiers, ou ${money(w.withoutPantry)} si vous avez déjà l’huile, le sel et les épices.
- Une seule règle : chaque dîner est cuisiné pour 4. Deux portions le soir, deux le lendemain midi.

@chiffres ${money(w.used)} | ce que vous mangez ; ${money(w.purchase)} | ce que vous payez en caisse ; ${money(w.perPortion)} | la portion

## Le menu de la semaine

${menuTable}

Petit-déjeuner, par personne : un quart de baguette, 20 g de beurre de cacahuète et 150 g de yaourt de soja nature. Nous n’avons pas encore de prix relevé pour les fruits : ajoutez-en un si votre budget le permet.

${dayBlocks}

@cta-court VégéBudget fait ce calcul pour vos propres dîners : il part de votre budget et de ce que vous avez déjà.

## Ce que coûte la semaine

${costTable}

- **Ce que vous mangez : ${money(w.used)}** pour la semaine, soit ${money(w.perPersonDay)} par personne et par jour.
- **Ce que vous payez en caisse : ${money(w.purchase)},** car on achète des paquets entiers.
- **Si vous avez déjà l’huile, le sel, le cumin et le curry : ${money(w.withoutPantry)}.**
- **La différence, ${money(w.leftoverValue)},** reste dans vos placards pour la semaine suivante : ${leftovers}, et presque toute l’huile et les épices.

## La liste de courses, rayon par rayon

${listTable}

Les pois chiches et les haricots rouges sont en conserve : pas besoin de trempage. Congelez deux baguettes en rentrant des courses.

## D’où viennent les prix

Nous utilisons les prix de VégéBudget : ${source}. Ce sont les mêmes que dans l’appli et sur nos fiches recettes.

Ce ne sont pas forcément les prix de votre magasin. Dans votre liste de courses VégéBudget, vous pouvez changer le prix et le format de chaque produit. Le détail du calcul est sur la page [Comment ça marche](/comment-ca-marche).

## Comment garder la note basse

![Trois bols de petits pois, d’épinards et de brocoli surgelés sur un plan de travail](/images/blog/menu-semaine-pas-cher-surgeles.jpg "Les légumes surgelés se dosent facilement : on prend juste ce qu’il faut.")

- **Cuisinez pour 4 le soir :** le repas du midi est déjà prêt.
- **Reprenez les mêmes produits** d’un jour à l’autre : riz, pois chiches, lentilles, tomates.
- **Prenez les épinards surgelés :** le reste du sachet sert la semaine suivante.
- **Regardez votre placard d’abord :** l’huile, le sel et les épices font vite monter la note.
- **Pour comparer le prix des protéines,** lisez [notre comparatif des protéines végétales](/blog/proteines-vegetales).

Moins de paquets entamés, c’est aussi moins de gaspillage : voyez nos [10 habitudes pour moins gaspiller](/blog/gaspillage-alimentaire), [nos recettes de lentilles pas chères](/blog/recettes-lentilles-pas-cheres) et [le calendrier des fruits et légumes de saison](/blog/fruits-legumes-de-saison).

## En vidéo

@video CiuMLpBsqss | Ça suffit le gâchis : la liste de courses | ministère de la Transition écologique

## D’autres dîners pour varier

@recettes mijote-lentilles, epinards-pois-chiches, chili-haricots

@cta Organisez vos dîners de la semaine
`,
    faq: [
      ['Combien coûte une semaine de repas végétariens pour 2 ?', `Dans cet exemple, ce que vous mangez coûte ${money(w.used)}, et vous payez ${money(w.purchase)} en caisse, car on achète des paquets entiers. Le reste sert la semaine suivante.`],
      ['Pourquoi deux montants différents ?', 'Le premier compte seulement les quantités utilisées dans les recettes. Le second compte les paquets que vous achetez en entier. C’est le second que vous verrez sur votre ticket.'],
      ['Est-ce que les midis sont prévus ?', 'Oui. Chaque dîner est cuisiné pour 4 portions. Deux sont mangées le soir, deux le lendemain midi. Seul le lundi midi demande un plat à part.'],
      ['Les prix sont-ils ceux de mon magasin ?', `Non. Ce sont des ${source}. Votre magasin peut être plus cher ou moins cher.`],
      ['Faut-il acheter l’huile et les épices ?', `Regardez d’abord votre placard. Sans l’huile, le sel, le cumin et le curry, les courses de la semaine coûtent ${money(w.withoutPantry)}.`],
    ],
    sources: [
      ['Augmenter les légumes secs (Manger Bouger)', 'https://www.mangerbouger.fr/l-essentiel/les-recommandations-sur-l-alimentation-l-activite-physique-et-la-sedentarite/augmenter/augmenter-les-legumes-secs'],
    ],
} satisfies Article;
