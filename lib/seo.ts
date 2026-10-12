import { headers } from 'next/headers';
import { ingredients, recipes, type Recipe } from './catalog';
import { blankState, generatePlan, money, monday, portionStep, quantity, recipeCost, shopping, totals } from './planner';
import { FOUNDER_PRICE_LABEL, FOUNDER_SEATS, PREMIUM_PRICE_LABEL, PRICE_SOURCE } from './pricing';

export const SITE_NAME = 'VégéBudget';
// Une version par pays francophone : Google montre à chacun la page de son pays.
export const HREFLANG = { 'fr-FR': '/', 'fr-BE': '/belgique', 'fr-CH': '/suisse', 'fr-CA': '/quebec', 'x-default': '/' };
export const PUBLISHED = '2026-10-07';
export const HOME_TITLE = 'Menus sans viande et liste de courses à petit budget · VégéBudget';
export const HOME_DESCRIPTION = 'Organisez vos repas du soir selon votre budget. VégéBudget prépare vos menus et votre liste de courses. Première semaine gratuite.';

// Adresse publique du site : SITE_ORIGIN en production, sinon l'hôte de la requête.
export async function publicOrigin() {
  const configured = process.env.SITE_ORIGIN;
  if (configured) return configured.replace(/\/$/, '');
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  return `${h.get('x-forwarded-proto') ?? (host.startsWith('localhost') || host.startsWith('127.') ? 'http' : 'https')}://${host}`;
}

export const recipeImage = (recipe: Recipe) => `/images/recettes/${recipe.id}.jpg`;
export const recipePath = (recipe: Recipe) => `/recettes/${recipe.id}`;
export const portionCost = (recipe: Recipe) => recipeCost(recipe, 2) / 2;
export const findRecipe = (id: string) => recipes.find(r => r.id === id);

export function recipeIngredients(recipe: Recipe) {
  return recipe.ingredients.map(x => {
    const ingredient = ingredients.find(i => i.id === x.id)!;
    return { name: ingredient.name, amount: quantity(x.qty, ingredient.unit) };
  });
}
export const recipeSteps = (recipe: Recipe) => recipe.steps.map(s => portionStep(s, 2));

// Exemple de l'accueil : la semaine proposée par défaut (5 dîners pour 2), aux prix de référence.
// Les montants de la FAQ en sont tirés pour rester identiques à ceux affichés sur l'accueil.
export function homeExample() {
  const plan = generatePlan(blankState(), monday(), 42).plan;
  const t = totals(shopping(plan?.entries ?? [], []));
  const portions = (plan?.entries.length ?? 0) * 2;
  return { dinners: plan?.entries.length ?? 0, recipeIds: plan?.entries.map(e => e.recipeId) ?? [], purchase: t.purchase, used: t.used, perPortion: portions ? t.used / portions : 0 };
}
const example = homeExample();

export const faq = [
  { q: 'Combien faut-il prévoir pour les courses ?', a: `Dans l’exemple de l’accueil, ${example.dinners} dîners pour 2 personnes demandent environ ${Math.round(example.purchase)} € de courses : c’est le prix des produits à acheter en entier. Les quantités utilisées dans les recettes coûtent environ ${Math.round(example.used)} €, soit ${money(example.perPortion)} par portion ; le reste des produits sert pour d’autres repas. Le montant varie selon vos menus, ce que vous avez déjà et les prix de votre magasin. ${PRICE_SOURCE}.` },
  { q: 'Est-ce que VégéBudget est gratuit ?', a: `Votre première semaine de menus est gratuite, sans compte ni carte bancaire. Pour préparer les semaines suivantes, Premium coûte ${PREMIUM_PRICE_LABEL} par mois. Une offre de lancement à ${FOUNDER_PRICE_LABEL} par an est réservée aux ${FOUNDER_SEATS} premiers abonnés, avec un tarif conservé tant que l’abonnement n’est pas interrompu.` },
  { q: 'Qu’apporte VégéBudget en plus des recettes ?', a: 'VégéBudget réunit vos menus, les ingrédients que vous avez déjà et votre liste de courses. Vous connaissez le montant des courses avant de partir au magasin, puis vous notez ce que vous payez.' },
  { q: 'Faut-il savoir bien cuisiner ?', a: 'Non. Les étapes sont simples et les ingrédients courants : riz, pâtes, légumes secs, conserves et légumes surgelés. Vous choisissez le temps à consacrer au dîner.' },
  { q: 'Faut-il être végétarien ?', a: 'Non. Vous pouvez utiliser VégéBudget pour quelques soirs ou pour tous vos dîners de la semaine. Les recettes sont 100 % végétales : ni viande, ni poisson, ni œufs, ni produits laitiers.' },
  { q: 'Les prix correspondent-ils à ceux de mon magasin ?', a: `Ce sont des estimations : ${PRICE_SOURCE.charAt(0).toLowerCase()}${PRICE_SOURCE.slice(1)}. Ils peuvent varier selon le magasin. Dans votre liste de courses, vous pouvez modifier les prix et les formats des produits.` },
  { q: 'Puis-je exclure certains ingrédients ?', a: 'Oui : le gluten, le soja, les arachides, le sésame, la moutarde, les fruits à coque et les ingrédients que vous ne souhaitez pas manger. Les filtres portent sur les ingrédients des recettes : vérifiez toujours les étiquettes et les traces éventuelles.' },
  { q: 'Les petits-déjeuners et les déjeuners sont-ils inclus ?', a: 'Non. VégéBudget organise les dîners des soirs que vous choisissez. Le budget affiché ne couvre pas les autres repas ni le prix de l’abonnement.' },
  { q: 'Pourquoi indiquer les quantités de mon placard ?', a: 'Elles permettent de calculer ce qu’il vous reste à acheter. Plus elles sont justes, plus votre liste de courses est précise.' },
  { q: 'Comment arrêter mon abonnement ?', a: 'Depuis Mon compte, dans la gestion de l’abonnement, vous désactivez le renouvellement. Premium reste actif jusqu’à la fin de la période payée.' },
];

export function organizationLd(origin: string) {
  return { '@type': 'Organization', '@id': `${origin}/#organisation`, name: SITE_NAME, url: `${origin}/`, logo: `${origin}/favicon.svg` };
}

export function homeLd(origin: string) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organizationLd(origin),
      { '@type': 'WebSite', '@id': `${origin}/#site`, name: SITE_NAME, url: `${origin}/`, inLanguage: 'fr-FR', publisher: { '@id': `${origin}/#organisation` } },
      {
        '@type': 'WebApplication', name: SITE_NAME, url: `${origin}/`, applicationCategory: 'LifestyleApplication', operatingSystem: 'Web', inLanguage: 'fr-FR',
        description: HOME_DESCRIPTION,
        offers: [
          { '@type': 'Offer', name: 'Première semaine', price: '0', priceCurrency: 'EUR' },
          { '@type': 'Offer', name: 'Premium', price: PREMIUM_PRICE_LABEL.replace(/[^\d,]/g, '').replace(',', '.'), priceCurrency: 'EUR' },
        ],
      },
      { '@type': 'FAQPage', mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    ],
  };
}

export function recipeLd(origin: string, recipe: Recipe) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Recipe', name: recipe.title, description: `${recipe.description} Coût estimé des ingrédients : environ ${money(portionCost(recipe))} par portion.`,
        image: [`${origin}${recipeImage(recipe)}`], author: { '@id': `${origin}/#organisation` }, datePublished: PUBLISHED,
        totalTime: `PT${recipe.minutes}M`, recipeYield: '2 portions', recipeCategory: 'Plat principal', recipeCuisine: 'Française',
        keywords: ['recette sans viande', 'pas cher', 'végétarien', 'vegan', recipe.category, ...recipe.tags].join(', '),
        suitableForDiet: ['https://schema.org/VegetarianDiet', 'https://schema.org/VeganDiet'],
        recipeIngredient: recipeIngredients(recipe).map(i => `${i.name} : ${i.amount}`),
        recipeInstructions: recipeSteps(recipe).map((text, n) => ({ '@type': 'HowToStep', position: n + 1, text })),
        url: `${origin}${recipePath(recipe)}`,
      },
      organizationLd(origin),
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${origin}/` },
        { '@type': 'ListItem', position: 2, name: 'Recettes', item: `${origin}/recettes` },
        { '@type': 'ListItem', position: 3, name: recipe.title, item: `${origin}${recipePath(recipe)}` },
      ] },
    ],
  };
}

// Le JSON-LD est inséré tel quel dans la page : on échappe « < » pour qu'aucun texte ne ferme la balise script.
export const ldScript = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, '\\u003c') });
