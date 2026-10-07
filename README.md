# VégéBudget

Site francophone pour organiser des dîners végétaux avec un petit budget. Application Next.js sur Node.js, prévue pour un VPS OVH (voir [DEPLOIEMENT-OVH.md](DEPLOIEMENT-OVH.md)). Préouverture gratuite avec une découverte sans compte ; les organisations enregistrées et les échanges demandent une connexion par lien envoyé par e-mail.

## Parcours disponibles

- Personnalisation : parcours guidé en trois étapes, 1 à 8 personnes, choix des jours, budget des dîners, temps, exclusions, équipement et stock de départ.
- Catalogue initial de 24 recettes illustrées, recherche, favoris, ingrédients et instructions ajustés aux portions, mode cuisine avec minuteur adapté à chaque étape.
- Génération de menus, changement de plats, verrouillage par jour, conservation des repas déjà préparés, réutilisation des menus et historique de 52 semaines.
- Liste de courses regroupée, déduction du placard, paquets entiers, prix et formats modifiables, cases propres à chaque semaine, copie, téléchargement et impression.
- Suivi des montants payés, achats restants et budget total, correction selon le ticket, bilans mensuels et export CSV.
- Placard : quantités réellement disponibles, rappel d'utilisation, rangement des achats, déduction des ingrédients cuisinés et annulation avec restauration du stock.
- Connexion sans mot de passe : lien à usage unique envoyé par e-mail (valable 20 minutes), session signée de 30 jours ; profil et activité sauvegardés dans SQLite avec contrôle des versions concurrentes.
- Club : publications, photos stockées sur le serveur (`DATA_DIR/uploads`), commentaires, appréciations, signalements et modération.
- Défis hebdomadaires fondés sur les actions du membre et les ingrédients cuisinés, réussites conservées, sujets de discussion proposés, export et suppression de ses données.
- Gestion : catalogue, prix de départ, demandes d'ouverture, membres et signalements réels, informations de l'éditeur et textes commerciaux.

Les prix initiaux sont des simulations, pas des relevés de supermarché. Les visuels des 24 recettes sont des suggestions de présentation générées. Les recettes doivent être cuisinées et relues avant une ouverture commerciale ; elles ne constituent pas un programme nutritionnel.

## État commercial

Toutes les fonctions sont ouvertes pendant la préouverture. L'offre à 4,99 €/mois (`lib/pricing.ts`) est un tarif à tester. Le paiement demeure désactivé sans configuration complète. Les inscriptions sur la liste d'ouverture et préférences de nouvelles sont réellement sauvegardées ; aucun courriel n'est encore envoyé.

Le catalogue et les menus d'essai sont accessibles sans compte ; les posts, commentaires et photos de membres demandent une connexion. Seule l'adresse configurée dans `OWNER_EMAIL` peut initialiser l'administration. Le premier visiteur ne reçoit aucun droit de gestion. Les paiements restent bloqués tant que les informations de l'éditeur, le contact, les conditions de vente et les informations sur les données personnelles ne sont pas renseignés dans « Gestion du service > Ouverture ».

## Paiement à connecter

Variables d'environnement (voir `.env.example`) : `BILLING_ENABLED=false` par défaut, `SITE_ORIGIN`, puis `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` et `STRIPE_PRICE_ID`. Le prix Stripe doit être récurrent, mensuel et égal à `PREMIUM_PRICE_CENTS` (499 centimes EUR, `lib/pricing.ts`). Renseigner aussi les informations commerciales dans la gestion. Activer `BILLING_ENABLED=true` uniquement après validation en mode test et préparation des informations commerciales.

Configurer le webhook Stripe sur `/api/billing/webhook` pour les événements `customer.subscription.created`, `.updated`, `.deleted`, `invoice.paid` et `invoice.payment_failed`. Le code vérifie la signature, le prix, le client, l'ordre des événements et leur unicité. Les retours du navigateur ne donnent jamais à eux seuls un accès Premium.

Les plafonds Découverte (une semaine, dix favoris, dix ingrédients) sont appliqués côté client et serveur quand la connexion de paiement et les informations commerciales sont prêtes. Premium ouvre l'historique, la réutilisation des semaines, les bilans mensuels et les plafonds étendus. Le portail Stripe gère l'abonnement et la résiliation ; il doit être configuré dans le compte du commerçant.

## Développement

```sh
pnpm install
pnpm dev        # http://localhost:3000 ; sans SMTP, le lien de connexion s'affiche dans le terminal
```

## Vérification

```sh
node node_modules/typescript/bin/tsc --noEmit --pretty false
pnpm check:planner
pnpm build && pnpm check:api
```

Les tests du planificateur couvrent les paquets et formats personnalisés, les portions des ingrédients et instructions, le stock partagé, la préparation et son annulation, les achats enregistrés sans fausse économie, les cases par semaine, les exclusions, l'équipement, les verrous, les jours choisis, les défis et les budgets impossibles. Après construction du site (`pnpm build`), `check-api` lance le serveur avec une base et un dossier de photos temporaires : connexion par lien e-mail (envoi, usage unique, session falsifiée refusée, limite de demandes), comptes distincts, initialisation sécurisée de l'administration, sauvegardes des dépenses et formats, migration des anciens comptes, conflits, confidentialité des photos, modération, catalogue, plafonds, conditions d'ouverture des paiements et signatures de webhook. Il ne contacte aucun compte Stripe réel.

Le parcours invité a été vérifié dans le navigateur sur ordinateur : accueil, configuration guidée, alerte budget, courses, dépenses, stock, annulation, portions, minuteur, réutilisation d'une semaine, club et offre. Les styles comportent des adaptations pour petits écrans ; la validation visuelle sur téléphone, l'envoi réel des e-mails par le SMTP d'OVH et les outils WebMCP restent à vérifier. Les parcours Stripe avec un vrai compte restent à valider en mode test avant activation.

Base SQLite (module `node:sqlite` de Node.js 22) dans `DATA_DIR/vegebudget.sqlite`, schéma dans `db/schema.ts`, migrations SQL dans `drizzle/` appliquées automatiquement au démarrage. Les données et photos de membres ne sont pas embarquées dans les sources.

WebMCP optionnel : `read_weekly_menu`, `read_shopping_list`, `start_menu_preferences`. Les outils utilisent le même état que l'interface, valident l'entrée et se désenregistrent à la fermeture. Ils sont ignorés dans les navigateurs sans support.
