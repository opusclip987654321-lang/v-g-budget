# Prospects du programme d'affiliation : consignes de la tâche quotidienne

Demande de Walid du 22/10/2026 : trouver chaque jour des centaines de sites (blogs, sites perso) qui pourraient
recommander VégéBudget avec un lien qui leur est propre, une réduction pour leurs lecteurs et une commission.
**Aucun mail n'est envoyé avant le lancement de l'appli mobile** (décision de Walid). Cette tâche ne fait que remplir
la liste.

## Ce que fait la tâche, chaque jour

1. Partir d'une branche fraîche depuis `origin/main`. Lire `content/affiliation/sites.ts` (domaines déjà présents) et
   le bilan public `GET https://vegebudget.fr/api/affiliation` (combien ont été retenus ou écartés).
2. Chercher avec la recherche web, en variant les requêtes d'un jour à l'autre (noter les requêtes du jour dans
   `content/affiliation/JOURNAL.md`) : blogs de cuisine végétarienne ou vegan, cuisine petit budget, cuisine
   étudiante, anti-gaspi, cuisine en famille ou pour enfants, batch cooking et menus de la semaine, en France,
   Belgique, Suisse et Québec. Sources utiles : classements de blogs (« meilleurs blogs cuisine végétarienne »),
   annuaires de blogs culinaires, blogrolls, articles « mes blogs préférés ».
3. Ne garder que des **sites de cuisine en français qui existent** : le résultat de recherche montre des recettes ou
   des articles de cuisine. Écarter : grands portails (Marmiton, 750g, Cuisine AZ, Journal des Femmes, Elle,
   Doctissimo…), marques et enseignes, réseaux sociaux (Instagram, Facebook, TikTok, Pinterest, YouTube), sites
   déjà dans la liste (même domaine), pages d'agrégateurs.
4. Ajouter chaque site à la fin de `sites.ts`, une ligne par site :
   `{ site: 'https://domaine.fr/', nom: 'Nom du blog', theme: 'vegetarien', ajoute: 'AAAA-MM-JJ' },`
   - `site` : la page d'accueil en https (pas une page d'article).
   - `nom` : le nom du blog ou du site, **jamais un nom de personne seul ni une adresse mail** (dépôt public).
   - `theme` : un de `vegetarien`, `budget`, `etudiant`, `anti-gaspi`, `famille`, `batch-cooking`, `cuisine`.
5. Objectif : 30 à 80 sites nouveaux par jour par la recherche web (elle donne surtout des médias : il faut des
   requêtes précises). Le gros du volume vient du site lui-même, qui suit les liens des blogs retenus (voir plus
   bas) : la tâche sert surtout à semer des sites variés (nouveaux thèmes, Belgique, Suisse, Québec) et à garder la
   liste propre. Lire le bilan : si `retenusAujourdhui` passe sous 100, semer davantage ; si la liste se remplit de
   sites sans intérêt (grands médias, marques, boutiques, sites d'un autre sujet qui parlent un peu de cuisine),
   ajouter leurs domaines à `exclus` dans `sites.ts`.
6. `pnpm check:affiliation`, puis PR « Affiliation : N nouveaux sites (date) », fusion une fois les vérifications
   vertes. Ajouter une ligne au journal : date, sites ajoutés, requêtes, remarques.

## Ce que fait le site ensuite

Chaque heure (`POST /api/diffusion`), le site visite au plus 40 sites de sa file (`lib/affiliation.ts`), d'abord
ceux de `sites.ts`, puis ceux vers lesquels pointent les sites déjà retenus (blogrolls, blogs amis, liens dans les
pages d'accueil), sauf les domaines `exclus`. Il écarte ceux qui ne répondent pas, ne sont pas en français ou ne
parlent pas de cuisine, et garde l'adresse mail publiée (sur le domaine du site ou une boîte grand public) ou la page
contact. La liste vérifiée est sur `/affiliation` (propriétaire seulement), avec un export CSV. Le bilan public
`GET /api/affiliation` ne donne que des nombres (dont les raisons d'écart).

Le rythme de visite (40 par heure, soit 960 par jour) se règle avec `AFFILIATION_PAR_HEURE` dans le `.env`.

## Quand l'appli mobile sera lancée

Prospection par mail en respectant le RGPD : seulement les adresses publiées pour être contacté, un message
personnalisé (le nom du site et un article précis), un lien pour ne plus être contacté, et d'abord un petit lot test
(20 à 30 mails) pour mesurer les réponses et protéger la réputation de bonjour@vegebudget.fr. Rien ne part sans
l'accord de Walid.
