import type { Article } from '@/lib/blog-articles';
import { amountPrice, cost, packPrice } from '@/lib/blog-cost';
import { findRecipe, portionCost } from '@/lib/seo';

// Les 4 dîners « à congeler » de l'article. Le texte s'appuie sur leurs étapes et leurs conseils (lib/catalog.ts) :
// ces contrôles arrêtent le build si le catalogue change.
const A_CONGELER = ['soupe-petits-pois', 'minestrone-haricots', 'bolognaise-lentilles', 'chili-haricots'];
const recette = (id: string) => {
  const r = findRecipe(id);
  if (!r) throw new Error(`Recette ${id} absente : revoir /blog/que-peut-on-congeler.`);
  return r;
};
const etapes = (id: string) => recette(id).steps.join(' ');
// Le texte dit : la soupe se sert avec du pain grillé, les petits pois sont surgelés et 300 g suffisent pour 2.
if (!/Griller le pain/.test(etapes('soupe-petits-pois'))) throw new Error('La soupe de petits pois n’a plus de pain grillé : revoir /blog/que-peut-on-congeler.');
const pois = recette('soupe-petits-pois').ingredients.find(i => i.id === 'peas');
const pain = recette('soupe-petits-pois').ingredients.find(i => i.id === 'bread');
if (!pois || pois.qty !== 300 || !pain || pain.qty !== 120) throw new Error('Quantités de la soupe de petits pois changées : revoir /blog/que-peut-on-congeler.');
// Le texte dit : le riz du chili et les pâtes de la bolognaise cuisent à part ; les pâtes du minestrone absorbent le bouillon.
if (!/Cuire le riz/.test(etapes('chili-haricots'))) throw new Error('Le riz du chili ne cuit plus à part : revoir /blog/que-peut-on-congeler.');
if (!/Cuire les pâtes/.test(etapes('bolognaise-lentilles'))) throw new Error('Les pâtes de la bolognaise ne cuisent plus à part : revoir /blog/que-peut-on-congeler.');
if (!JSON.stringify(recette('minestrone-haricots')).includes('absorbent le bouillon')) throw new Error('Conseil du minestrone changé : revoir /blog/que-peut-on-congeler.');
const tries = [...A_CONGELER].sort((a, b) => portionCost(recette(a)) - portionCost(recette(b)));
const moinsCher = cost(tries[0]);
const plusCher = cost(tries[tries.length - 1]);

export default {
  slug: 'que-peut-on-congeler',
  title: 'Que peut-on congeler ? La liste, les durées et 4 dîners à mettre de côté',
  seoTitle: 'Que peut-on congeler ? Liste, durées et économies',
  description: `Que peut-on congeler ? Soupes, purées, légumes blanchis, pain : la liste, les règles du ministère et 4 dîners sans viande de ${moinsCher} à ${plusCher} la portion.`,
  lead: `Que peut-on congeler ? Les soupes, les purées, les légumes blanchis, les plats faits maison en petites portions et le pain se congèlent bien, à −18 °C. Pour le budget, le congélateur garde le reste des paquets entamés et les dîners cuisinés en double, qui ne finissent plus à la poubelle.`,
  category: 'Budget',
  keywords: ['que peut-on congeler', 'aliments qui se congèlent', 'aliments qui ne se congèlent pas', 'durée de conservation congélateur', 'peut-on recongeler un aliment décongelé', 'comment décongeler', 'congeler pour économiser'],
  date: '2026-11-23',
  coverAlt: 'Que peut-on congeler : boîtes de plats datées, sachet de petits pois et pain rangés dans un congélateur',
  body: `
@essentiel
- **Se congèlent bien** : soupes, purées, sauces, légumes blanchis, légumes secs cuits, pain.
- **À garder au frais** : œufs en coquille, salade, concombre, tomates crues.
- **Les règles** : congélateur à −18 °C, petites portions datées, décongélation au réfrigérateur, jamais de recongélation.
- **Pour le budget** : un dîner congelé coûte de ${moinsCher} à ${plusCher} la portion avec nos 4 recettes.

@chiffres −18 °C | le réglage du congélateur ; 10 mois | au plus pour les légumes ; ${moinsCher} | la portion de dîner congelé

## Que peut-on congeler pour économiser ?

Le congélateur sert à deux choses : garder ce qui reste d’un paquet entamé, et mettre de côté un dîner déjà cuisiné.

| Aliment | Au congélateur ? | Comment |
|---|---|---|
| Soupes et purées | Oui | Refroidies, en portions |
| Sauces et plats mijotés | Oui | Sans le riz ni les pâtes |
| Légumes secs cuits | Oui | En portions, le jour de la cuisson |
| Légumes frais | Oui | Blanchis d’abord pour la plupart |
| Pain | Oui | En tranches, pour n’en sortir que le nécessaire |
| Œufs en coquille | Non | Au réfrigérateur |
| Salade, concombre, tomates crues | Non | À manger frais |

Les paquets entamés sont la première économie. Pour 2, la soupe de petits pois prend 300 g de petits pois surgelés (${packPrice('peas')}), soit ${amountPrice('peas', 300)} : le reste du sachet attend au congélateur, comme l’explique notre article [légumes surgelés moins chers que le frais](/blog/legumes-surgeles-prix). La soupe se sert avec 120 g de pain (${packPrice('bread')}) : congelez le reste en tranches.

@cta-court Un demi-sachet de petits pois au congélateur ? Indiquez-le dans VégéBudget : les dîners de la semaine l’utilisent, et il sort de votre liste de courses.

## Quels aliments ne se congèlent pas ?

Les légumes très riches en eau (salade, concombre, tomates crues) ramollissent à la décongélation : achetez-les pour la semaine. Les œufs en coquille restent au réfrigérateur.

Les légumes frais comme la courgette, l’aubergine ou les pommes de terre se congèlent, mais la plupart doivent d’abord être **blanchis** : quelques minutes dans l’eau bouillante, puis dans l’eau froide, indique le ministère de l’Agriculture. Un plat resté plusieurs jours au réfrigérateur ne doit pas partir au congélateur.

## Combien de temps se gardent les aliments au congélateur ?

- **Légumes congelés à la maison** : 10 mois au plus, selon le ministère de l’Agriculture.
- **Surgelés du commerce** : jusqu’à la date du paquet, dans un compartiment à −18 °C.
- **Plats faits maison** : écrivez le nom du plat et la date sur la boîte, et mangez d’abord les plus anciens.

> Pour congeler vous-même, il faut un congélateur 4 étoiles réglé à −18 °C. Un compartiment à 2 étoiles (−12 °C) garde les surgelés 3 semaines au plus.

## Comment congeler un plat fait maison sans risque ?

![Minestrone aux haricots blancs servi dans une assiette creuse](/images/recettes/minestrone-haricots.jpg "Une soupe-repas se congèle bien, en portions d’un dîner.")

- **Laissez refroidir** 2 heures au plus à température ambiante, puis mettez au froid.
- **Faites de petites portions peu épaisses** : elles refroidissent et décongèlent plus vite.
- **Fermez bien la boîte** et notez le plat et la date.
- **Congelez le jour même** : au réfrigérateur, un plat fait maison se garde 48 heures au plus.

## Comment décongeler, et peut-on recongeler ?

Décongelez au réfrigérateur, la veille du dîner, ou faites cuire directement : jamais sur le plan de travail. Les légumes congelés peuvent aller dans la poêle ou la casserole sans décongélation.

Ne recongelez jamais un aliment décongelé : les bactéries se multiplient pendant la décongélation, rappellent le ministère de l’Agriculture et la DGCCRF. Réchauffez bien le plat, jusqu’au cœur.

## Quels dîners végétariens congeler, et combien coûtent-ils ?

Ces 4 dîners se cuisinent en double : une moitié pour ce soir, l’autre au congélateur pour un soir pressé.

@recette soupe-petits-pois | Congelez la soupe mixée, en portions. Le soir venu, il ne reste qu’à griller le pain.

@recette minestrone-haricots | Les pâtes absorbent le bouillon : congelez la soupe avant de les ajouter, puis faites-les cuire dedans en la réchauffant.

@recette bolognaise-lentilles | Congelez la sauce seule. Les pâtes cuisent le soir même, pendant qu’elle se réchauffe.

@recette chili-haricots | Même principe : le chili au congélateur, le riz cuit le jour du dîner.

Coût estimé des ingrédients, prix relevés le 7 octobre 2026 sur carrefour.fr, marques distributeur, hors promotions. Pour organiser plusieurs plats en une fois, voyez notre [batch cooking pas cher](/blog/batch-cooking-pas-cher) ; pour les fonds de plats, [que faire avec des restes](/blog/que-faire-avec-des-restes) ; pour les soupes à congeler, nos [soupes maison pas chères](/blog/soupe-maison-pas-chere).

@recettes soupe-petits-pois, bolognaise-lentilles, chili-haricots

@cta Tenez compte de ce que vous avez déjà
`,
  faq: [
    ['Peut-on recongeler un plat décongelé ?', 'Non. Le ministère de l’Agriculture et la DGCCRF demandent de ne jamais recongeler un produit décongelé : les bactéries se multiplient pendant la décongélation. Mangez-le, bien réchauffé, dans la journée.'],
    ['Comment décongeler une soupe ?', 'Au réfrigérateur, la veille, ou directement dans la casserole à feu doux. Jamais à température ambiante sur le plan de travail.'],
    ['Peut-on congeler des légumes secs cuits ?', 'Oui, comme les autres plats faits maison : refroidis, en petites portions datées, le jour de la cuisson.'],
    ['À quelle température régler son congélateur ?', 'À −18 °C. Pour congeler vous-même des aliments frais, il faut un congélateur 4 étoiles.'],
    ['Combien de temps garder des légumes congelés ?', 'Le ministère de l’Agriculture indique 10 mois au plus pour des légumes congelés à la maison, blanchis au préalable pour la plupart.'],
  ],
  sources: [
    ['Les bonnes pratiques de la congélation (ministère de l’Agriculture)', 'https://agriculture.gouv.fr/les-bonnes-pratiques-de-la-congelation'],
    ['Comment bien conserver ses légumes ? (ministère de l’Agriculture)', 'https://agriculture.gouv.fr/comment-bien-conserver-ses-legumes'],
    ['Pourquoi ne faut-il pas recongeler un produit décongelé ? (ministère de l’Agriculture)', 'https://agriculture.gouv.fr/pourquoi-ne-faut-il-pas-recongeler-un-produit-decongele'],
    ['Sécurité sanitaire des aliments : tout sur la chaîne du froid (ministère de l’Agriculture)', 'https://agriculture.gouv.fr/securite-sanitaire-des-aliments-tout-sur-la-chaine-du-froid'],
    ['Cuisiner fait-maison : comment éviter les intoxications alimentaires ? (ministère de l’Agriculture)', 'https://agriculture.gouv.fr/cuisiner-fait-maison-comment-eviter-les-intoxications-alimentaires'],
    ['Le froid, mode d’emploi (DGCCRF)', 'https://www.economie.gouv.fr/files/directions_services/dgccrf/documentation/publications/depliants/froid.pdf'],
  ],
} satisfies Article;
