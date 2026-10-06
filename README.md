# VégéBudget

Site francophone pour organiser des dîners végétaux avec un petit budget. Première version privée en préouverture.

## Parcours disponibles

- Personnalisation : 1 à 8 personnes, 1 à 7 dîners, budget, temps, exclusions et équipement.
- Catalogue initial de 24 recettes, recherche, favoris, portions et mode cuisine avec minuterie.
- Génération de menus, changement de plats, verrouillage par jour et historique de 52 semaines.
- Liste de courses regroupée, déduction du placard, paquets entiers, prix modifiables, cases d'achat, copie, téléchargement et impression.
- Placard : quantités réellement disponibles, rappel d'utilisation et rangement des achats.
- Connexion ChatGPT native Sites ; profil et activité sauvegardés en D1 avec contrôle des versions concurrentes.
- Club : publications, photos en R2, commentaires, appréciations, signalements et modération.
- Défis fondés sur les actions du membre, export et suppression de ses données.
- Gestion : catalogue, prix de départ, demandes d'ouverture, membres et signalements réels.

Les prix initiaux sont des simulations, pas des relevés de supermarché. Les trois photos sont des illustrations générées. Les recettes doivent être cuisinées et relues avant une ouverture commerciale ; elles ne constituent pas un programme nutritionnel.

## État commercial

Toutes les fonctions sont ouvertes pendant la préouverture. L'offre à 9 €/mois est un tarif à tester. Le paiement demeure désactivé sans configuration complète. Les inscriptions sur la liste d'ouverture et préférences de nouvelles sont réellement sauvegardées ; aucun courriel n'est encore envoyé.

Le site est privé et réservé au propriétaire. Sa première connexion initialise le rôle d'administration. Initialiser ce rôle avec le propriétaire avant toute éventuelle modification d'audience. Les utilisateurs se connectent avec ChatGPT. Une ouverture au grand public demande aussi un choix du mode d'accès, l'identité de l'éditeur, un contact et des conditions de vente.

## Paiement à connecter

Variables runtime Sites : `BILLING_ENABLED=false` par défaut, `SITE_ORIGIN`, puis secrets `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` et `STRIPE_PRICE_ID`. Le prix Stripe doit être récurrent, mensuel et égal à 900 centimes EUR. Activer `BILLING_ENABLED=true` uniquement après validation en mode test et préparation des informations commerciales.

Configurer le webhook Stripe sur `/api/billing/webhook` pour les événements `customer.subscription.created`, `.updated`, `.deleted`, `invoice.paid` et `invoice.payment_failed`. Le code vérifie la signature, le prix, le client, l'ordre des événements et leur unicité. Les retours du navigateur ne donnent jamais à eux seuls un accès Premium.

Les plafonds Découverte (une semaine, dix favoris, dix ingrédients) sont appliqués côté client et serveur quand le paiement est activé. Premium ouvre l'historique et les plafonds étendus. Le portail Stripe gère l'abonnement et la résiliation ; il doit être configuré dans le compte du commerçant.

## Vérification

```sh
node node_modules/typescript/bin/tsc --noEmit --pretty false
node scripts/check-planner.mjs
node scripts/check-api.mjs
```

Les tests couvrent les paquets, les portions, le stock partagé entre repas, les prix personnels, les exclusions, l'équipement, les verrous de dates et les budgets impossibles. Après construction du site, `check-api` charge le Worker dans un environnement isolé avec D1 et R2 temporaires : comptes distincts, sauvegardes, conflits, photos, modération, catalogue, plafonds et signatures de webhook. Il ne contacte aucun compte Stripe réel.

La validation visuelle en navigateur sur téléphone et ordinateur, la connexion ChatGPT complète et les outils WebMCP n'ont pas pu être testés dans le contexte de prévisualisation disponible. Les parcours Stripe avec un vrai compte restent à valider en mode test avant activation.

Schéma D1 dans `db/schema.ts`, migration SQL inspectée dans `drizzle/`. Les données et photos de membres ne sont pas embarquées dans les sources ou archives. Les préférences d'un visiteur sont transitoires ; la sauvegarde durable commence après connexion.

WebMCP optionnel : `read_weekly_menu`, `read_shopping_list`, `start_menu_preferences`. Les outils utilisent le même état que l'interface, valident l'entrée et se désenregistrent à la fermeture. Ils sont ignorés dans les navigateurs sans support.
