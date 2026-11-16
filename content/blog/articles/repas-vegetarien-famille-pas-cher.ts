import type { Article } from '@/lib/blog-articles';
import { cost, kiloPrice } from '@/lib/blog-cost';
import { ingredients, recipes } from '@/lib/catalog';
import { money, recipeCost, roundMoney, shopping, totals, type Entry } from '@/lib/planner';

// Dîners familiers pour 4 personnes, tirés du catalogue (lib/catalog.ts).
// Coût pour 4 = ingrédients utilisés pour 4 portions ; la semaine type et sa liste de courses
// viennent du même calcul que l'appli (lib/planner.ts, shopping) : rien n'est écrit en dur.
const PERSONNES = 4;
const pourQuatre = (id: string) => {
  const r = recipes.find(x => x.id === id);
  if (!r) throw new Error(`Recette ${id} absente : revoir /blog/repas-vegetarien-famille-pas-cher.`);
  return money(recipeCost(r, PERSONNES));
};

// Semaine type : 5 dîners pour 4, soit 20 portions.
const DINERS = ['riz-saute', 'bolognaise-lentilles', 'hachis-lentilles', 'wrap-haricots', 'chili-haricots'];
DINERS.forEach(id => { if (!recipes.some(r => r.id === id)) throw new Error(`Recette ${id} absente : revoir /blog/repas-vegetarien-famille-pas-cher.`); });
// Dates internes du calcul (une semaine fixe), jamais affichées.
const entries: Entry[] = DINERS.map((id, n) => { const jour = `2026-11-${16 + n}`; return { id: `famille-${n}`, recipeId: id, date: jour, servings: PERSONNES, cooked: false, locked: false }; });
const liste = shopping(entries, [], {}, recipes, ingredients).filter(i => i.packages > 0);
const t = totals(liste);
const parPortion = roundMoney(t.used / (DINERS.length * PERSONNES));

// « Le placard d'abord » : un paquet de riz, de pâtes, d'huile, de sel, de cumin et de paprika déjà à la maison.
const PLACARD = ['rice', 'pasta', 'oil', 'salt', 'cumin', 'paprika'];
const placard = PLACARD.map(id => { const i = ingredients.find(x => x.id === id); if (!i) throw new Error(`${id} absent du catalogue : revoir /blog/repas-vegetarien-famille-pas-cher.`); return { id, qty: i.pack }; });
const avecPlacard = shopping(entries, placard, {}, recipes, ingredients).filter(i => i.packages > 0);
const tp = totals(avecPlacard);

// Garde-fous : le texte parle d'une semaine pour 4 sous 40 €, que le placard fait baisser,
// et d'un riz sauté qui reste le dîner le moins cher de la sélection.
if (t.purchase > 40) throw new Error(`Semaine famille à ${t.purchase} € : revoir /blog/repas-vegetarien-famille-pas-cher.`);
if (tp.purchase >= t.purchase) throw new Error('Le placard ne fait plus baisser la liste : revoir /blog/repas-vegetarien-famille-pas-cher.');
const SELECTION = ['riz-saute', 'bolognaise-lentilles', 'hachis-lentilles', 'wrap-haricots', 'chili-haricots', 'galettes-lentilles'];
const couts = SELECTION.map(id => recipeCost(recipes.find(r => r.id === id)!, PERSONNES));
if (Math.min(...couts) !== couts[0]) throw new Error('Le riz sauté n’est plus le moins cher : revoir /blog/repas-vegetarien-famille-pas-cher.');
if (Math.max(...couts) > 6) throw new Error('Un dîner de la sélection dépasse 6 € pour 4 : revoir /blog/repas-vegetarien-famille-pas-cher.');

export default {
  slug: 'repas-vegetarien-famille-pas-cher',
  title: 'Repas végétarien pas cher pour une famille de 4 : 6 dîners chiffrés',
  seoTitle: 'Repas végétarien famille pas cher : 6 dîners pour 4',
  description: 'Repas végétarien famille pas cher : 6 dîners que les enfants connaissent déjà, leur coût pour 4 et à la portion, et une semaine de courses chiffrée.',
  lead: `Un repas végétarien pas cher pour une famille de 4 reprend les plats que les enfants connaissent déjà : bolognaise, hachis parmentier, wraps, riz sauté. Dans notre catalogue, ces dîners coûtent de ${pourQuatre('riz-saute')} à ${money(Math.max(...couts))} d’ingrédients pour quatre.`,
  category: 'Budget',
  keywords: ['repas végétarien famille pas cher', 'repas pas cher pour 4 personnes', 'repas végétarien enfant', 'idée repas du soir en famille pas cher', 'recette végétarienne qui plaît à toute la famille'],
  date: '2026-11-16',
  coverAlt: 'Repas végétarien pas cher pour une famille de 4 : une marmite au centre de la table et quatre assiettes',
  body: `
@essentiel
- **6 dîners familiers** pour 4, de ${pourQuatre('riz-saute')} à ${money(Math.max(...couts))} d’ingrédients.
- **Les légumes secs** remplacent la viande dans les plats que les enfants connaissent.
- **Une semaine de 5 dîners pour 4** : ${money(t.purchase)} de courses en paquets entiers, ${money(tp.purchase)} avec un placard de base.
- **Le reste des paquets** sert la semaine suivante.

@chiffres ${pourQuatre('riz-saute')} | le riz sauté pour 4 ; ${money(parPortion)} | la portion, semaine type ; 2 fois | de légumes secs par semaine, conseil Manger Bouger

## Quel repas végétarien pas cher pour une famille de 4 ?

Pour trouver une idée de repas du soir en famille pas cher, le plus simple est de garder la forme d’un plat connu et de changer ce qu’il y a dedans. Les lentilles prennent la place de la viande hachée, les haricots rouges garnissent les wraps et le chili.

@recette bolognaise-lentilles | Lentilles corail, carotte râpée et tomates mijotent ensemble 20 min : dans l’assiette, on voit des pâtes à la sauce rouge.

@recette hachis-lentilles | Une purée de pommes de terre sur des lentilles vertes à la tomate et aux carottes, dorée au four. Il se prépare la veille.

@recette riz-saute | Riz, petits pois, carottes et sauce soja dans une seule poêle. Le moins cher de la sélection.

@cta-court À quatre, la note grimpe vite : VégéBudget choisit vos dîners de la semaine selon votre budget, le nombre de personnes et ce que vous avez déjà, puis calcule la liste de courses.

@recette wrap-haricots | Haricots rouges, maïs et tomate au cumin, avec un peu de yaourt de soja dans une tortilla : chacun peut garnir la sienne à table.

@recette chili-haricots | Un chili doux, sans piment : haricots rouges, poivron, maïs, cumin et paprika, servis avec du riz. Il se prépare à l’avance.

@recette galettes-lentilles | Lentilles vertes, carotte râpée et flocons d’avoine en petites galettes cuites à la poêle, avec une salade de concombre au citron. Les enfants peuvent aider à les former.

## Combien coûte un repas végétarien pour 4 personnes ?

| Dîner | Pour 4 | La portion |
|---|---|---|
| [Riz sauté aux petits pois](/recettes/riz-saute) | ${pourQuatre('riz-saute')} | ${cost('riz-saute')} |
| [Bolognaise de lentilles](/recettes/bolognaise-lentilles) | ${pourQuatre('bolognaise-lentilles')} | ${cost('bolognaise-lentilles')} |
| [Hachis parmentier de lentilles](/recettes/hachis-lentilles) | ${pourQuatre('hachis-lentilles')} | ${cost('hachis-lentilles')} |
| [Galettes de lentilles](/recettes/galettes-lentilles) | ${pourQuatre('galettes-lentilles')} | ${cost('galettes-lentilles')} |
| [Wraps aux haricots](/recettes/wrap-haricots) | ${pourQuatre('wrap-haricots')} | ${cost('wrap-haricots')} |
| [Chili doux](/recettes/chili-haricots) | ${pourQuatre('chili-haricots')} | ${cost('chili-haricots')} |

Coût estimé des ingrédients utilisés : prix relevés le 7 octobre 2026 sur carrefour.fr, marques distributeur, hors promotions. En magasin, vous achetez des paquets entiers : le reste sert pour d’autres dîners.

## Quelles recettes végétariennes plaisent à toute la famille ?

![Hachis parmentier de lentilles dans un plat à gratin](/images/recettes/hachis-lentilles.jpg "Le hachis parmentier de lentilles : la purée sur le dessus, comme dans la version classique.")

Aucune recette ne plaît à tous les enfants. Les plats qui passent le mieux sont souvent ceux qui ressemblent à ce qu’ils mangent déjà.

- **Gardez le nom du plat** : « bolognaise », « hachis », « wraps ».
- **Glissez les légumes secs dans la sauce** : les lentilles corail cuisent avec les tomates de la bolognaise.
- **Laissez-les garnir** : wraps et galettes se composent à table.
- **Un seul plat nouveau par semaine**, à côté de plats déjà aimés.

## Combien coûtent les courses d’une semaine pour 4 ?

Exemple avec 5 dîners de la liste : riz sauté, bolognaise, hachis, wraps et chili, pour 4 personnes, soit 20 portions.

| Ce qu’on achète | Montant |
|---|---|
| Tout, en paquets entiers (${liste.length} produits) | ${money(t.purchase)} |
| Avec riz, pâtes, huile, sel, cumin et paprika déjà au placard | ${money(tp.purchase)} |
| Ingrédients vraiment utilisés | ${money(t.used)}, soit ${money(parPortion)} la portion |

L’écart vient des paquets entamés : sauce soja, huile, oignons, lentilles, épices. Ils servent les semaines suivantes. Pour un menu complet avec la liste produit par produit, voyez notre [menu végétarien de la semaine pour 4 avec liste de courses](/menu-vegetarien-semaine/4-personnes).

## Comment payer moins cher les courses d’une famille de 4 ?

- **Les lentilles sèches** : ${kiloPrice('green-lentils')} pour les vertes. Voyez comment [comparer les prix au kilo](/blog/comparer-prix-au-kilo).
- **Deux dîners, les mêmes paquets** : la bolognaise et le hachis partagent tomates, carottes, oignons et ail.
- **Cuisinez en double** le hachis ou le chili, puis congelez une part, comme dans notre [batch cooking pas cher](/blog/batch-cooking-pas-cher).
- **Regardez le placard avant la liste** : c’est ce qui fait la différence dans le tableau ci-dessus.

> Pour un budget fixe, voyez aussi comment [faire ses courses avec 50 € par semaine](/blog/courses-50-euros-par-semaine).

@recettes soupe-petits-pois, pates-brocoli, semoule-pois

@cta Préparez les dîners de la famille selon votre budget
`,
  faq: [
    ['Quel est le repas végétarien le moins cher pour 4 personnes ?', `Dans notre catalogue, le riz sauté aux petits pois, avec ${pourQuatre('riz-saute')} d’ingrédients pour quatre (${cost('riz-saute')} la portion). Prix relevés le 7 octobre 2026 sur carrefour.fr, marques distributeur.`],
    ['Combien coûte une semaine de dîners végétariens pour une famille de 4 ?', `Pour 5 dîners de notre exemple (20 portions), les courses coûtent ${money(t.purchase)} en paquets entiers, ou ${money(tp.purchase)} si le riz, les pâtes, l’huile et les épices sont déjà au placard. Les quantités vraiment utilisées reviennent à ${money(parPortion)} la portion.`],
    ['Un enfant peut-il manger végétarien ?', 'Les cantines scolaires doivent proposer au moins un menu végétarien par semaine, avec des légumes secs, des céréales, des œufs ou des laitages. Pour une alimentation sans aucun produit animal, demandez conseil à votre médecin ou à votre pédiatre.'],
    ['Combien de fois par semaine manger des légumes secs ?', 'Manger Bouger conseille des légumes secs (lentilles, haricots, pois chiches) au moins 2 fois par semaine.'],
  ],
  sources: [
    ['Augmenter les légumes secs (Santé publique France, Manger Bouger)', 'https://www.sante.fr/node/1869507'],
    ['Un menu végétarien par semaine en restauration scolaire (ministère de l’Agriculture)', 'https://agriculture.gouv.fr/telecharger/116169'],
  ],
} satisfies Article;
