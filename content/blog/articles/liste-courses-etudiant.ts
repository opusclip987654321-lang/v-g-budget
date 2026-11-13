import type { Article } from '@/lib/blog-articles';
import { cost, kiloPrice } from '@/lib/blog-cost';
import { ingredients, recipes } from '@/lib/catalog';
import { money, packLabel, quantity, roundMoney, shopping, totals, type Entry } from '@/lib/planner';

// Semaine type d'un étudiant seul : 5 dîners du catalogue (lib/catalog.ts), sans four ni mixeur,
// chacun cuisiné en 2 portions (le soir + une deuxième fois, le lendemain ou en boîte), soit 10 repas.
// La liste de courses, les paquets entiers et les montants viennent du même calcul que l'appli
// (lib/planner.ts, shopping) : rien n'est écrit en dur.
const DINERS = ['riz-saute', 'semoule-pois', 'pates-brocoli', 'bolognaise-lentilles', 'epinards-pois-chiches'];
const PORTIONS = 2;
DINERS.forEach(id => {
  const r = recipes.find(x => x.id === id);
  if (!r) throw new Error(`Recette ${id} absente : revoir /blog/liste-courses-etudiant.`);
  if (r.category === 'Au four' || r.steps.some(s => /mixe|four\b/i.test(s))) throw new Error(`${id} demande un four ou un mixeur : revoir /blog/liste-courses-etudiant.`);
});
// Dates internes du calcul (une semaine fixe), jamais affichées.
const jour = (n: number) => `2026-11-${16 + n}`;
const entries: Entry[] = DINERS.map((id, n) => { const date = jour(n); return { id: `etudiant-${n}`, recipeId: id, date, servings: PORTIONS, cooked: false, locked: false }; });
const semaine1 = shopping(entries, [], {}, recipes, ingredients).filter(i => i.packages > 0);
const t1 = totals(semaine1);
const repas = DINERS.length * PORTIONS;
const parPortion = roundMoney(t1.used / repas);

// Semaine 2 : les mêmes dîners, avec ce qui reste des paquets de la semaine 1 (le citron entamé est racheté).
const reste = semaine1.filter(i => i.id !== 'lemon').map(i => ({ id: i.id, qty: i.packages * i.ingredient.pack - i.required }));
const semaine2 = shopping(entries, reste, {}, recipes, ingredients).filter(i => i.packages > 0);
const t2 = totals(semaine2);
const aRacheter = semaine2.map(i => i.ingredient.name.toLowerCase().replace(/, égouttés$/, '')).join(', ');

// Garde-fous : le texte parle d'un budget serré et d'une deuxième semaine nettement moins chère.
if (t1.purchase > 30) throw new Error(`Courses étudiant à ${t1.purchase} € : revoir /blog/liste-courses-etudiant.`);
if (t2.purchase > t1.purchase / 3) throw new Error(`Semaine 2 à ${t2.purchase} € : revoir /blog/liste-courses-etudiant.`);
['rice', 'pasta', 'couscous'].forEach(id => { if (!semaine1.some(i => i.id === id)) throw new Error(`Plus de ${id} dans la liste : revoir /blog/liste-courses-etudiant.`); });

const paquet = (id: string) => { const i = ingredients.find(x => x.id === id); if (!i) throw new Error(`${id} absent du catalogue : revoir /blog/liste-courses-etudiant.`); return quantity(i.pack, i.unit); };
// Ordre des rayons dans le tableau (un rayon inconnu passe en premier : à ajouter ici).
const RAYONS = ['Féculents', 'Légumineuses', 'Fruits et légumes', 'Épicerie'];
const tableau = [...semaine1]
  .sort((a, b) => RAYONS.indexOf(a.ingredient.category) - RAYONS.indexOf(b.ingredient.category) || b.purchaseCost - a.purchaseCost)
  .map(i => `| ${i.ingredient.name} | ${packLabel(i.packages, i.ingredient.pack, i.ingredient.unit, i.ingredient.name)} | ${money(i.purchaseCost)} |`)
  .join('\n');

export default {
  slug: 'liste-courses-etudiant',
  title: `Liste de courses étudiant pas chère : 10 repas pour ${money(t1.purchase)}`,
  seoTitle: 'Liste de courses étudiant pas chère : 10 repas chiffrés',
  description: `Liste de courses étudiant pas chère, prix ligne par ligne : ${money(t1.purchase)} pour 10 repas sans viande, avec une casserole et une poêle. Et le Crous à 1 €.`,
  lead: `Voici une liste de courses étudiant pas chère : ${money(t1.purchase)} de courses pour 5 dîners sans viande cuisinés en double, soit 10 repas pour une personne, avec une casserole et une poêle. La semaine suivante, le placard est rempli : refaire ces dîners ne demande plus que ${money(t2.purchase)} d’achats.`,
  category: 'Budget',
  keywords: ['liste de courses étudiant pas cher', 'courses étudiant pas cher', 'budget courses étudiant', 'manger pas cher étudiant', 'recettes étudiant pas cher', 'repas Crous 1 euro'],
  date: '2026-11-13',
  coverAlt: 'Liste de courses étudiant pas chère : un sac de courses avec du riz, des pâtes, des lentilles et des légumes surgelés, une casserole et une poêle',
  body: `
@essentiel
- **${money(t1.purchase)} de courses** pour 5 dîners cuisinés en 2 portions : 10 repas pour une personne.
- **${money(parPortion)} la portion** en moyenne, pour les ingrédients réellement utilisés.
- **La semaine suivante**, il ne manque que ${money(t2.purchase)} : riz, huile et surgelés sont déjà là.
- **Le midi**, le repas Crous à 1 € est ouvert à tous les étudiants depuis le 4 mai 2026.

@chiffres ${money(t1.purchase)} | de courses pour 10 repas ; ${money(parPortion)} | la portion en moyenne ; 1 € | le repas au Crous, pour tous

## Quelle liste de courses étudiant pas chère pour la semaine ?

Cette liste prépare les 5 dîners ci-dessous, chacun en 2 portions. Les quantités sont celles des paquets à acheter, pas celles qu’on utilise.

| Produit | À acheter | Prix |
|---|---|---|
${tableau}
| **Total** | | **${money(t1.purchase)}** |

Coût estimé des ingrédients : prix relevés le 7 octobre 2026 sur carrefour.fr, marques distributeur, hors promotions.

## Quels dîners cuisiner avec une casserole et une poêle ?

Aucun de ces plats ne demande de four ni de mixeur. Cuisinez-les en 2 portions : une pour le soir, l’autre pour le lendemain.

@recette riz-saute | Riz, petits pois surgelés, carotte et sauce soja, sautés à la poêle. Le moins cher de la liste. Le riz de la veille fait l’affaire.

@recette bolognaise-lentilles | Des lentilles corail mijotées dans la sauce tomate, sur des pâtes. Une casserole pour les pâtes, une pour la sauce.

@recette pates-brocoli | Pâtes, brocoli surgelé et pois chiches, avec de l’ail et du citron. Le brocoli cuit dans l’eau des pâtes.

@recette semoule-pois | Carottes et petits pois cuits à l’eau, semoule préparée selon le paquet, pois chiches et cumin.

@recette epinards-pois-chiches | Épinards surgelés et pois chiches au cumin, servis avec du riz. Le reste du paquet attend au congélateur.

@cta-court Donnez votre budget et ce qui reste dans vos placards : VégéBudget choisit vos dîners de la semaine, retire de la liste ce que vous avez déjà et chiffre le reste.

## Combien coûtent les courses d’un étudiant par semaine ?

Le premier passage en caisse coûte le plus cher : on achète des paquets entiers (${paquet('rice')} de riz, ${paquet('oil')} d’huile, ${paquet('onion')} d’oignons). Sur les ${money(t1.purchase)} de la liste, ${money(t1.used)} d’ingrédients servent vraiment cette semaine. Le reste attend dans le placard ou le congélateur.

| | Semaine 1 | Semaine 2, mêmes dîners |
|---|---|---|
| Courses à faire | ${money(t1.purchase)} | ${money(t2.purchase)} |
| Repas | ${repas} | ${repas} |

En semaine 2, il ne reste à racheter que : ${aRacheter}. Le riz, la semoule, l’huile, les épices et les surgelés servent aussi à d’autres dîners.

![Pâtes au brocoli et au citron dans une assiette creuse](/images/recettes/pates-brocoli.jpg "Les pâtes au brocoli, un des 5 dîners de la liste.")

## Le repas Crous à 1 €, ça change quoi pour le budget ?

Depuis le 4 mai 2026, le repas à 1 € des restaurants universitaires est ouvert à tous les étudiants, et plus seulement aux boursiers. Il faut un compte Izly actif. Le repas comprend un plat principal et jusqu’à deux accompagnements.

- **Le midi au Crous** : 1 €, avec un plat végétarien proposé chaque jour dans tous les Crous.
- **Le soir à la maison** : un dîner de cette liste, ${money(parPortion)} la portion en moyenne.
- **La deuxième portion** : le lendemain soir, ou un midi sans Crous, le week-end par exemple.

## Comment manger pas cher quand on est étudiant ?

- **Comparer le prix au kilo** plutôt que le prix du paquet : voir [comment comparer les prix au kilo](/blog/comparer-prix-au-kilo).
- **Acheter des légumes surgelés** : les épinards, le brocoli et les petits pois de la liste le sont. Voir [légumes surgelés ou frais](/blog/legumes-surgeles-prix).
- **Miser sur les légumes secs** : les lentilles corail coûtent ${kiloPrice('red-lentils')}. Manger Bouger conseille d’en manger au moins 2 fois par semaine. Nos [recettes de lentilles pas chères](/blog/recettes-lentilles-pas-cheres) en donnent d’autres.
- **Cuisiner en double** : une seule vaisselle pour 2 repas, comme dans notre [batch cooking pas cher](/blog/batch-cooking-pas-cher).
- **Finir le placard** avant de racheter : voir [que manger en fin de mois](/blog/que-manger-fin-de-mois).

> Vous vivez seul ? Notre [menu végétarien de la semaine pour 1 personne](/menu-vegetarien-semaine/1-personne) donne 5 autres dîners avec leur liste de courses. À deux, voyez notre [panier de courses de la semaine pour 2](/blog/courses-50-euros-par-semaine).

## Quelles autres recettes pas chères pour étudiant ?

@recettes soupe-petits-pois, salade-lentilles, curry-corail

@cta Tenez compte de ce que vous avez déjà
`,
  faq: [
    ['Quelle liste de courses pour un étudiant avec un petit budget ?', `Des féculents (riz, pâtes, semoule), des légumineuses (lentilles corail, pois chiches), des légumes surgelés, des carottes, des oignons, de la tomate en conserve, de l’huile et quelques épices. Dans notre exemple, cela fait ${money(t1.purchase)} pour 10 repas sans viande.`],
    ['Combien coûtent les courses d’un étudiant par semaine ?', `La première semaine coûte le plus cher, car on achète des paquets entiers : ${money(t1.purchase)} dans notre exemple de 10 repas. Une fois le placard rempli, refaire les mêmes dîners ne demande que ${money(t2.purchase)} d’achats.`],
    ['Le repas Crous à 1 € est-il pour tous les étudiants ?', 'Oui, depuis le 4 mai 2026, tous les étudiants y ont droit dans les restaurants universitaires du Crous, et plus seulement les boursiers. Il faut un compte Izly actif pour obtenir ce tarif en caisse.'],
    ['Que manger le soir quand on est étudiant et fauché ?', `Un riz sauté aux petits pois (${cost('riz-saute')} la portion en ingrédients), une semoule aux petits pois et aux carottes (${cost('semoule-pois')}) ou des pâtes au brocoli (${cost('pates-brocoli')}). Ces plats se font avec une casserole et une poêle.`],
    ['Comment manger sans viande avec un petit budget ?', 'Remplacez la viande par des légumineuses : lentilles, pois chiches, haricots. Elles sont peu chères et riches en protéines végétales, selon Manger Bouger, qui conseille d’en manger au moins 2 fois par semaine.'],
  ],
  sources: [
    ['Repas à 1 euro : une mesure étendue à tous les étudiants (info.gouv.fr)', 'https://www.info.gouv.fr/actualite/repas-a-1-euro-une-mesure-etendue-a-tous-les-etudiants'],
    ['Comment bénéficier du repas Crous à 1 € ? (etudiant.gouv.fr)', 'https://www.etudiant.gouv.fr/fr/comment-beneficier-du-repas-crous-1-eu-3123'],
    ['Un plat végétarien tous les jours, dans tous les Crous (etudiant.gouv.fr)', 'https://www.etudiant.gouv.fr/fr/un-plat-vegetarien-tous-les-jours-dans-tous-les-crous-1432'],
    ['Augmenter les légumes secs (Manger Bouger, Santé publique France)', 'https://www.mangerbouger.fr/manger-mieux/a-tout-age-et-a-chaque-etape-de-la-vie/les-recommandations-alimentaires-pour-les-adultes/augmenter/augmenter-les-legumes-secs'],
  ],
} satisfies Article;
