# VégéBudget : règles pour travailler sur ce dépôt

- Le site tourne sur le VPS Nūr, dans `/opt/vegebudget`, qui est une copie git de ce dépôt (branche `main`). **Ne jamais modifier de fichier directement sur le serveur** : une modification locale bloque `git pull` et la mise à jour du site. Tout changement (y compris une ligne de suivi, une balise de vérification, un script) passe par une pull request ici.
- Mise à jour du serveur : `cd /opt/vegebudget && git pull && docker compose up -d --build`. Les réglages secrets sont dans `/opt/vegebudget/.env` (jamais dans le dépôt).
- Le VPS est partagé avec Nūr Meet, Leviaro et le cerveau (Caddy commun) : ne rien changer à leurs dossiers depuis ce projet.
- Vérifications avant de fusionner : `npx tsc --noEmit -p .`, `pnpm check:planner`, puis `rm -rf .next && pnpm build && pnpm check:api`.
