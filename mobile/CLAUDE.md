# Appli mobile VégéBudget (dossier mobile/)

- Lire `README.md` (organisation et **règles du code**) avant de modifier l’appli, et les respecter.
- Expo change à chaque version : vérifier l’API dans le paquet installé (`node_modules/<paquet>`) ou la documentation de la version d’`expo` du `package.json`, pas de mémoire.
- Ajouter une bibliothèque : `npx expo install <paquet>`.
- Avant une pull request : `npm run check` dans `mobile/`, et les vérifications du site si `../lib` ou l’API changent (voir le CLAUDE.md à la racine).
- Le moteur de menus est dans `../lib`, partagé avec le site : ne pas le copier dans l’appli.
- Fiches des stores et ASO : `docs/stores-aso.md`.
