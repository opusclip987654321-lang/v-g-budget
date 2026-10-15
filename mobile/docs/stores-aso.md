# Appli VégéBudget : fiches des stores et ASO

Document de travail établi le 15 octobre 2026 en suivant les consignes ASO fournies par louis. Statuts : **réalisé**, **proposé**, **bloqué** (attend un compte ou une décision), **non applicable**.
Aucune position ni aucun nombre d’installations n’est promis : Apple et Google ne publient pas le détail de leurs classements. Les limites de caractères sont à revérifier dans les consoles avant l’envoi.

## 1. Audit de l’existant

| Point | Constat | Statut |
| --- | --- | --- |
| Promesse et action principale | « Vos dîners sans viande selon votre budget, avec la liste de courses ». Première action utile : obtenir ses menus de la semaine. | observé (site) |
| Public, pays, langues | Francophones : France, Belgique, Suisse, Québec, avec les prix de chaque pays. Français seulement. | observé (code `lib/region.ts`) |
| Technologie | Expo 57 / React Native 0.86, iOS et Android, moteur de menus partagé avec le site (`../lib`). | réalisé |
| Comptes App Store Connect / Play Console | Pas encore créés. | bloqué (louis) |
| Suivi des erreurs | Écran d’erreur avec « Réessayer ». Pas encore d’outil de suivi des plantages en production. | proposé : Sentry (compte gratuit à créer) |
| Statistiques | Ouvertures de l’appli comptées sur le site (source `appli-ios` / `appli-android`) ; Umami côté site. | réalisé |
| Parcours | Sans compte : questions → menus → courses. Connexion par lien e-mail qui rouvre l’appli. Paiement : achat intégré Apple/Google (décision du 15/10) à brancher. | réalisé, sauf paiement (bloqué : comptes) |

## 2. Corrections et travaux prioritaires

| Priorité | Travail | Impact attendu | Coût | Statut |
| --- | --- | --- | --- | --- |
| P0 | Pas d’écran blanc : écran d’erreur avec « Réessayer » | Moins d’abandons sur erreur | faible | réalisé |
| P0 | Hors connexion : menus et liste lisibles, cases cochées gardées et renvoyées au retour du réseau (testé) | Utilisable au supermarché | moyen | réalisé |
| P0 | Suivi des plantages en production (Sentry + symboles iOS / fichiers de correspondance Android via EAS) | Voir et corriger les plantages, surveiller Android vitals | faible | proposé, compte à créer |
| P1 | Première utilisation sans compte : menus en 4 réglages | Première action utile rapide | — | réalisé |
| P1 | Fiches App Store et Google Play (ci-dessous) | Être trouvé et compris | faible | proposé |
| P1 | Achat Premium intégré (Apple / Google, via RevenueCat) | Conversion dans l’appli, conforme aux règles des stores | moyen | bloqué : comptes développeur |
| P1 | Page publique « Confidentialité » sur vegebudget.fr (URL exigée par les deux stores) | Condition de publication | faible | proposé |
| P2 | Demande d’avis officielle après le 3e dîner préparé, une seule fois | Plus d’avis, au bon moment | faible | réalisé |
| P2 | Liens universels (vegebudget.fr/app ouvre l’appli si installée) | Navigation web → appli | moyen | proposé (identifiant d’équipe Apple nécessaire) |
| P2 | Tests des captures et icônes (expériences des consoles) | Meilleure conversion de la fiche | faible | proposé, après les premières installations |

## 3. Fiche App Store (iOS)

| Champ | Proposition | Caractères | Justification |
| --- | --- | --- | --- |
| Nom | VégéBudget : menus et courses | 29 / 30 | Marque + les deux usages principaux |
| Sous-titre | Dîners sans viande, petit prix | 30 / 30 | Bénéfice : végétal et économie, sans répéter le nom |
| Mots-clés | vegetarien,recette,planning,liste,economie,pas cher,semaine,famille,legumineuse,anti gaspi,placard | 98 / 100 | Mots absents du nom et du sous-titre, sans espaces après les virgules, aucun concurrent cité |
| Catégorie principale | Cuisine et boissons (Food & Drink) | — | Usage réel : menus et recettes |
| Catégorie secondaire | Style de vie | — | Budget du foyer |
| Description | Même texte que Google Play (`description-google-play.txt`) | 1 344 | Apple ne s’en sert pas pour la recherche : écrite pour convaincre |
| Texte promotionnel | La première semaine de menus est gratuite, sans compte. | 55 / 170 | Modifiable sans nouvelle version ; n’influence pas la recherche |

## 4. Fiche Google Play (Android)

| Champ | Proposition | Caractères |
| --- | --- | --- |
| Titre | VégéBudget : menus et courses | 29 / 30 |
| Description courte | Menus végé de la semaine + liste de courses au prix réel. Petit budget. | 71 / 80 |
| Description complète | `docs/description-google-play.txt` | 1 344 / 4 000 |
| Catégorie | Cuisine et boissons | — |

Expressions intégrées naturellement à la description : « dîners sans viande », « liste de courses », « budget », « recettes », « menus de la semaine », « placard ».

## 5. Mots-clés à suivre

Aucun volume de recherche n’est mesuré pour l’instant : à vérifier avec les suggestions des stores et les consoles une fois l’appli publiée.

| Expression | Intention | Fonction correspondante | Pays / langue | Preuve ou hypothèse | Priorité |
| --- | --- | --- | --- | --- | --- |
| menu de la semaine | Ne plus chercher quoi cuisiner | Menus générés | FR, BE, CH, QC / fr | hypothèse, non mesuré | haute |
| liste de courses | Faire ses courses plus vite | Liste par rayon, hors connexion | tous / fr | hypothèse, non mesuré | haute |
| recette végétarienne | Cuisiner sans viande | 24 recettes végétales | tous / fr | hypothèse, non mesuré | haute |
| repas pas cher | Dépenser moins | Budget et prix réels | FR, BE / fr | proche des articles du blog, non mesuré | haute |
| anti gaspi | Utiliser ce qu’on a | Placard pris en compte | FR / fr | hypothèse, non mesuré | moyenne |
| souper végé | Repas du soir (Québec) | Menus du soir | QC / fr | vocabulaire québécois déjà sur le site, non mesuré | moyenne |

## 6. Captures d’écran (ordre et contenu)

Captures de l’interface réelle, sur iPhone 6,9" et téléphone Android, aux textes de la version livrée.

| Ordre | Écran | Bénéfice affiché (bandeau) | Rôle |
| --- | --- | --- | --- |
| 1 | Mes menus (semaine composée, photos) | « Vos dîners de la semaine, composés pour vous » | Bénéfice principal |
| 2 | Ma liste de courses (cases cochées, total) | « La liste de courses, même sans réseau » | Démonstration concrète |
| 3 | Semaine (budget estimé vs budget) | « Votre budget, avant d’aller en magasin » | Aide à décider |
| 4 | Recette (étapes, quantités) | « Des recettes simples, pas à pas » | Rassure |
| 5 | Préférences (4 réglages) | « Adapté à votre foyer et à votre budget » | Personnalisation |

## 7. Plan de mesure

| Étape | Indicateur | Outil | Statut |
| --- | --- | --- | --- |
| Découverte | Impressions, sources | App Store Connect, Play Console | bloqué (comptes) |
| Fiche | Taux de conversion de la fiche (définition propre à chaque console) | consoles | bloqué (comptes) |
| Activation | Menus composés (événement « semaine » déjà mesuré sur le site) | statistiques du site | à brancher dans l’appli |
| Fidélisation | Retour à J1 / J7 / J30 (ouvertures « appli-… » par visiteur) | statistiques du site | réalisé (ouvertures) |
| Qualité | Plantages, ANR, problèmes fréquents | Sentry + Android vitals | proposé |
| Objectif | Abonnements Premium | RevenueCat + Stripe | bloqué (comptes) |

Ne pas additionner les chiffres des deux stores sans vérifier leurs définitions.

## 8. Vérifications avant publication

- [x] Promesse, public, pays et langues définis.
- [ ] Parcours principal testé sur vrais iPhone et Android (testé pour l’instant en version web et par tests automatiques).
- [ ] Tests sur téléphone modeste et réseau lent.
- [ ] Plantages suivis en production (Sentry).
- [ ] Performances mesurées : démarrage à froid et temps avant les menus (objectif interne proposé : menus visibles en moins de 3 s sur un Android d’entrée de gamme, à confirmer).
- [x] Erreurs réseau gérées (hors connexion, écran d’erreur).
- [x] Textes centralisés (`src/i18n/fr.ts`).
- [x] Fiches et mots-clés préparés séparément pour chaque store.
- [ ] Captures faites sur la version livrée.
- [x] Demande d’avis officielle et contact support.
- [ ] Déclarations de confidentialité (App Privacy, Data safety) : e-mail, menus, statistiques d’ouverture sans cookie ; pas de publicité ni de suivi entre applis.
- [ ] Règles et limites revérifiées dans les consoles au moment de l’envoi.
