import { headers } from 'next/headers';
import { ingredients, recipes, type Recipe } from './catalog';
import { money, portionStep, quantity, recipeCost } from './planner';
import { FOUNDER_PRICE_LABEL, FOUNDER_SEATS, PREMIUM_PRICE_LABEL, PRICE_SOURCE } from './pricing';

export const SITE_NAME = 'VégéBudget';
export const PUBLISHED = '2026-10-07';
export const HOME_TITLE = 'Menu de la semaine pas cher et sans viande, avec la liste de courses | VégéBudget';
export const HOME_DESCRIPTION = 'Composez vos dîners sans viande de la semaine selon votre budget : liste de courses exacte en paquets entiers, placard déduit, environ 0,70 € par portion. Première semaine gratuite.';

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

export const faq = [
  { q: 'Combien coûte une semaine de dîners avec VégéBudget ?', a: `L’exemple de semaine (5 dîners pour 2 personnes) revient à environ 21 € de courses, soit autour de 0,70 € par portion. ${PRICE_SOURCE}. Le total dépend de votre foyer, de vos jours et de ce que vous avez déjà au placard.` },
  { q: 'Est-ce que VégéBudget est gratuit ?', a: `La première semaine est gratuite, sans compte ni carte bancaire. Ensuite, l’offre Premium coûte ${PREMIUM_PRICE_LABEL} par mois, sans engagement. Les ${FOUNDER_SEATS} premiers membres peuvent réserver l’offre fondateur à ${FOUNDER_PRICE_LABEL} par an.` },
  { q: 'Qu’est-ce qui change par rapport à une appli de recettes ?', a: 'Une appli de recettes donne des idées. VégéBudget part de votre budget : il choisit les dîners, déduit ce que vous avez au placard, donne la liste de courses en paquets entiers comme en magasin et suit ce que vous dépensez vraiment.' },
  { q: 'Les recettes sont-elles difficiles ?', a: 'Non. Les 24 recettes sont faciles, prêtes en 15 à 40 minutes, avec des ingrédients de supermarché : lentilles, pois chiches, riz, pâtes, légumes surgelés et conserves.' },
  { q: 'Faut-il être végétarien pour l’utiliser ?', a: 'Non. Les dîners sont sans viande parce que c’est le moyen le plus simple de manger mieux pour moins cher. Vous pouvez aussi vous en servir pour quelques soirs par semaine seulement.' },
  { q: 'Les prix correspondent-ils à mon magasin ?', a: `${PRICE_SOURCE}. Dans la liste de courses, vous pouvez ajuster chaque prix et chaque format à votre magasin ; le budget est recalculé tout de suite.` },
  { q: 'Peut-on tenir compte des allergies ?', a: 'Oui. Vous pouvez exclure le gluten, le soja, les arachides, le sésame, la moutarde ou les fruits à coque, ainsi que les ingrédients que vous n’aimez pas.' },
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
        '@type': 'Recipe', name: recipe.title, description: `${recipe.description} Environ ${money(portionCost(recipe))} par portion.`,
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
