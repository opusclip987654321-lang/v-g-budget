# VégéBudget : règles pour travailler sur ce dépôt

- Le site tourne sur le VPS Nūr, dans `/opt/vegebudget`, qui est une copie git de ce dépôt (branche `main`). **Ne jamais modifier de fichier directement sur le serveur** : une modification locale bloque `git pull` et la mise à jour du site. Tout changement (y compris une ligne de suivi, une balise de vérification, un script) passe par une pull request ici.
- Mise à jour du serveur : `cd /opt/vegebudget && git pull && docker compose up -d --build`. Les réglages secrets sont dans `/opt/vegebudget/.env` (jamais dans le dépôt).
- Le VPS est partagé avec Nūr Meet, Leviaro et le cerveau (Caddy commun) : ne rien changer à leurs dossiers depuis ce projet.
- Vérifications avant de fusionner : `npx tsc --noEmit -p .`, `pnpm check:blog`, `pnpm check:planner`, puis `rm -rf .next && pnpm build && pnpm check:api`.
- Recettes de l’appli : 2 nouvelles recettes chaque semaine, ajoutées par une tâche programmée de Claude. Consignes dans `content/recettes/CONSIGNES.md`, journal dans `content/recettes/JOURNAL.md`, catalogue dans `lib/catalog.ts`.
- Blog : un article par jour est écrit par une tâche programmée de Claude. Consignes dans `content/blog/CONSIGNES.md`, sujets dans `content/blog/SUJETS.md`, un fichier par article dans `content/blog/articles/`.
- Appli mobile (iPhone, Android) : dossier `mobile/` (Expo, React Native), avec ses propres règles dans `mobile/CLAUDE.md` et `mobile/README.md`. Vérifications : `cd mobile && npm run check`. Les vérifications du site et de l’appli tournent aussi sur GitHub à chaque pull request.
- Loop VégéBudget (demande de louis du 19/10/2026) : chaque lundi, une revue lit les chiffres et les avis des visiteurs dans le cerveau, décide seule et modifie le site. Méthode dans `content/loop/CONSIGNES.md` ; version du site, questions posées aux visiteurs et journal des changements dans `content/loop/loop.ts` (toute modification décidée par la loop y ajoute une entrée et passe la version à +1).
