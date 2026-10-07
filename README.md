# VégéBudget

Site francophone pour organiser des dîners végétaux avec un petit budget. Préouverture gratuite avec une découverte sans compte ; les organisations enregistrées et les échanges sont liés aux comptes ChatGPT.

## Parcours disponibles

- Personnalisation : parcours guidé en trois étapes, 1 à 8 personnes, choix des jours, budget des dîners, temps, exclusions, équipement et stock de départ.
- Catalogue initial de 24 recettes illustrées, recherche, favoris, ingrédients et instructions ajustés aux portions, mode cuisine avec minuteur adapté à chaque étape.
- Génération de menus, changement de plats, verrouillage par jour, conservation des repas déjà préparés, réutilisation des menus et historique de 52 semaines.
- Liste de courses regroupée, déduction du placard, paquets entiers, prix et formats modifiables, cases propres à chaque semaine, copie, téléchargement et impression.
- Suivi des montants payés, achats restants et budget total, correction selon le ticket, bilans mensuels et export CSV.
- Placard : quantités réellement disponibles, rappel d'utilisation, rangement des achats, déduction des ingrédients cuisinés et annulation avec restauration du stock.
- Connexion ChatGPT native Sites ; profil et activité sauvegardés en D1 avec contrôle des versions concurrentes.
- Club : publications, photos en R2, commentaires, appréciations, signalements et modération.
- Défis hebdomadaires fondés sur les actions du membre et les ingrédients cuisinés, réussites conservées, sujets de discussion proposés, export et suppression de ses données.
- Gestion : catalogue, prix de départ, demandes d'ouverture, membres et signalements réels, informations de l'éditeur et textes commerciaux.

Les prix initiaux sont des simulations, pas des relevés de supermarché. Les visuels des 24 recettes sont des suggestions de présentation générées. Les recettes doivent être cuisinées et relues avant une ouverture commerciale ; elles ne constituent pas un programme nutritionnel.

## État commercial

Toutes les fonctions sont ouvertes pendant la préouverture. L'offre à 4,99 €/mois (`lib/pricing.ts`) est un tarif à tester. Le paiement demeure désactivé sans configuration complète. Les inscriptions sur la liste d'ouverture et préférences de nouvelles sont réellement sauvegardées ; aucun courriel n'est encore envoyé.

La démonstration peut être rendue publique dans le mode d'accès Sites. Le catalogue et les menus d'essai sont accessibles sans compte ; les posts, commentaires et photos de membres demandent une connexion. Seule l'adresse configurée dans le secret runtime `OWNER_EMAIL` peut initialiser l'administration. Le premier visiteur ne reçoit aucun droit de gestion. Les paiements restent bloqués tant que les informations de l'éditeur, le contact, les conditions de vente et les informations sur les données personnelles ne sont pas renseignés dans « Gestion du service > Ouverture ».

## Paiement à connecter

Variables runtime Sites : `BILLING_ENABLED=false` par défaut, `SITE_ORIGIN`, puis secrets `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` et `STRIPE_PRICE_ID`. Le prix Stripe doit être récurrent, mensuel et égal à `PREMIUM_PRICE_CENTS` (499 centimes EUR). Renseigner aussi les informations commerciales dans la gestion. Activer `BILLING_ENABLED=true` uniquement après validation en mode test et préparation des informations commerciales.

Configurer le webhook Stripe sur `/api/billing/webhook` pour les événements `customer.subscription.created`, `.updated`, `.deleted`, `invoice.paid` et `invoice.payment_failed`. Le code vérifie la signature, le prix, le client, l'ordre des événements et leur unicité. Les retours du navigateur ne donnent jamais à eux seuls un accès Premium.

Les plafonds Découverte (une semaine, dix favoris, dix ingrédients) sont appliqués côté client et serveur quand la connexion de paiement et les informations commerciales sont prêtes. Premium ouvre l'historique, la réutilisation des semaines, les bilans mensuels et les plafonds étendus. Le portail Stripe gère l'abonnement et la résiliation ; il doit être configuré dans le compte du commerçant.

## Vérification

```sh
node node_modules/typescript/bin/tsc --noEmit --pretty false
node scripts/check-planner.mjs
node scripts/check-api.mjs
```

Les tests du planificateur couvrent les paquets et formats personnalisés, les portions des ingrédients et instructions, le stock partagé, la préparation et son annulation, les achats enregistrés sans fausse économie, les cases par semaine, les exclusions, l'équipement, les verrous, les jours choisis, les défis et les budgets impossibles. Après construction du site, `check-api` charge le Worker dans un environnement isolé avec D1 et R2 temporaires : comptes distincts, initialisation sécurisée de l'administration, sauvegardes des dépenses et formats, migration des anciens comptes, conflits, confidentialité des photos, modération, catalogue, plafonds, conditions d'ouverture des paiements et signatures de webhook. Il ne contacte aucun compte Stripe réel.

Le parcours invité a été vérifié dans le navigateur sur ordinateur : accueil, configuration guidée, alerte budget, courses, dépenses, stock, annulation, portions, minuteur, réutilisation d'une semaine, club et offre. Les styles comportent des adaptations pour petits écrans ; la validation visuelle sur téléphone, la connexion ChatGPT complète et les outils WebMCP restent à vérifier. Les parcours Stripe avec un vrai compte restent à valider en mode test avant activation.

Schéma D1 dans `db/schema.ts`, migration SQL inspectée dans `drizzle/`. Les données et photos de membres ne sont pas embarquées dans les sources ou archives. Les préférences d'un visiteur sont transitoires ; la sauvegarde durable commence après connexion.

WebMCP optionnel : `read_weekly_menu`, `read_shopping_list`, `start_menu_preferences`. Les outils utilisent le même état que l'interface, valident l'entrée et se désenregistrent à la fermeture. Ils sont ignorés dans les navigateurs sans support.
