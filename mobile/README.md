# VégéBudget : l’appli iPhone et Android

L’appli des stores, en React Native (Expo). Elle utilise le site vegebudget.fr comme serveur (mêmes comptes, mêmes menus) et reprend tel quel son moteur de menus (`../lib` : générateur, prix, liste de courses).

## Lancer l’appli

```bash
cd mobile
npm install
npx expo start            # QR code à scanner avec l’appli Expo Go, ou « w » pour la version web
```

Pour viser un site local : `EXPO_PUBLIC_API_URL=http://<ip-de-l-ordinateur>:3000 npx expo start`. Sinon l’appli parle à https://vegebudget.fr (réglé dans `app.json` → `extra.apiUrl`).

## Vérifications (avant chaque pull request)

```bash
npm run check   # types, règles du code, tests, construction du code Android
```

Les mêmes vérifications tournent sur GitHub à chaque pull request (`.github/workflows/verifications.yml`), avec celles du site.

## Organisation du code

```
src/
  app/        routes (Expo Router) : un fichier par écran, qui ré-exporte l’écran de src/features
  features/   une partie de l’appli par dossier : semaine, menus, courses, recettes, compte, preferences, shell
  store/      état de l’appli (Zustand) et sélecteurs ; tests dans store/__tests__
  api/        appels au site (client.ts) et stockage sur le téléphone (storage.ts)
  domain/     le moteur du site (../lib), ré-exporté
  i18n/       tous les textes (fr.ts)
  ui/         briques d’interface sans logique : Button, Card, Screen, RecipePhoto, couleurs
```

## Règles du code

1. **Une route = une ligne.** `src/app/...` ré-exporte l’écran ; l’écran vit dans `src/features/<partie>/`. (Vérifié par ESLint.)
2. **L’état passe par le store** (`src/store`). Un écran lit seulement ce qu’il affiche, avec un sélecteur : `useStore(s => s.x)` ou `useStore(useShallow(s => ({ a: s.a, b: s.b })))`. Jamais `useStore()` sans sélecteur (tout l’écran se redessinerait à chaque case cochée). Les valeurs calculées partagées sont dans `store/selectors.ts` (`usePlan`, `useItems`, `useChecked`, `usePremium`).
3. **Les règles métier restent dans `../lib`**, partagées avec le site. Une règle qui change (offre gratuite, calcul des prix…) change aux deux endroits d’un coup.
4. **`src/ui` ne lit pas le store** : tout passe par les props. (Vérifié par ESLint.)
5. **Aucun texte en dur** dans les écrans : tout est dans `src/i18n/fr.ts`.
6. **Listes longues en `FlashList`**, lignes en composants `memo` (`MealRow`, `ShoppingRow`, `RecipeCard`). Le compilateur React (`app.json` → `experiments.reactCompiler`) évite le reste des calculs inutiles.
7. **Photos avec `expo-image`** (gardées sur le téléphone, visibles hors connexion).
8. **Styles en `StyleSheet.create`** en bas de chaque fichier ; couleurs dans `ui/theme.ts`.
9. **Tout changement de règle du store a son test** dans `store/__tests__`.
10. **Bibliothèques** : `npx expo install <paquet>` (versions compatibles avec Expo), jamais une version au hasard.

## Comment ça marche

- **Sans compte** : les menus sont gardés sur le téléphone. À la connexion, ils deviennent ceux du compte (comme sur le site).
- **Connexion** : l’appli demande un lien (`POST /api/auth/request` avec `appli: true`). Le lien de l’e-mail ouvre une page du site qui rouvre l’appli (`vegebudget://connexion?session=…`). La session est gardée dans le trousseau du téléphone et envoyée dans l’en-tête `Authorization: Bearer`.
- **Enregistrement** : chaque changement envoie l’état complet (`POST /api/app`, action `state`) dans une file, un par un. Sans réseau, le changement reste sur le téléphone et repart au retour dans l’appli ou au rechargement ; il n’est jamais écrasé par la copie hors connexion.
- **Statistiques** : chaque ouverture compte comme une visite de source `appli-ios` / `appli-android` dans les statistiques du site.
- **Avis** : la demande officielle d’Apple et Google est faite une fois, après le 3e dîner préparé.

## Publier sur les stores (à faire)

| Étape | Qui | Statut |
| --- | --- | --- |
| Compte Apple Developer (99 $/an) et Google Play Console (25 $ une fois) | louis | à faire |
| Compte Expo (gratuit) pour construire l’appli dans le cloud (`npx eas-cli build`) | louis | à faire |
| Achat Premium intégré (Apple / Google, via RevenueCat), écran `features/compte/PremiumScreen.tsx` | Claude, après les comptes | à faire |
| Page publique « Confidentialité » sur vegebudget.fr (exigée par les stores) | Claude | à faire |
| Suivi des plantages (Sentry, compte gratuit) | louis crée le compte, Claude branche | proposé |
| Fiches des stores, mots-clés, captures | Claude | prêt : `docs/stores-aso.md` |

Construire : `npx eas-cli build --profile preview` (appli de test à installer) puis `--profile production` et `npx eas-cli submit`.
