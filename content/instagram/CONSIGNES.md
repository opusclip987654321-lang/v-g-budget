# Carrousels Instagram « infos végé » : consignes

Demande de louis (19/10/2026) : chaque jour un carrousel différent pour mieux comprendre le monde végétarien,
**pas sur les menus** : végétarien, végétalien, vegan, souffrance animale, pollution et climat, protéines des
végétaux, légumes de saison, nutrition, idées reçues, etc. Le site publie le suivant de la liste vers 18 h
(`lib/instagram.ts`, `nextInfo`), dans l'ordre de `content/instagram/carrousels/index.ts`.

## Réserve

Une tâche programmée de Claude vérifie chaque semaine la réserve (`reserve` dans
https://vegebudget.fr/api/instagram/bilan, ou les fichiers pas encore publiés). S'il reste moins de 7 carrousels,
elle en écrit 7 nouveaux, lance les contrôles du dépôt, ouvre la pull request et la fusionne.

## Écrire un carrousel

- Un fichier `content/instagram/carrousels/<slug>.ts` (modèle : n'importe quel fichier existant), ajouté à la fin
  de `index.ts`. Le slug est le nom du fichier, différent des articles du blog.
- Un seul sujet, utile tout de suite : une chose qu'on apprend et qu'on a envie d'enregistrer ou d'envoyer.
- Couverture : un titre de 60 caractères au plus, qui promet ce qu'on va apprendre (question, chiffre, « ce que… »).
  Photo facultative (`image`), seulement une vraie photo JPEG de `public/images/blog/` qui montre le sujet ;
  sans photo, la couverture est un grand titre sur fond vert.
- 3 à 6 images d'infos. Chacune : un titre court, puis un grand chiffre, un court texte ou 2 à 4 points.
  Phrases simples, vocabulaire de tous les jours, pas d'émoji dans les images.
- Varier les thèmes d'un jour à l'autre : ne pas publier deux carrousels du même thème (`pill`) à la suite.
- Chaque chiffre a une source fiable et récente (Anses et table Ciqual, Manger Bouger, Santé publique France,
  ADEME, FAO, OMS, Our World in Data, ministère de l'Agriculture, INAO), citée dans `sources`.
  Pas de chiffre militant invérifiable. En cas de doute, une phrase sans chiffre plutôt qu'un chiffre faux.
- Santé : rester sur les repères officiels, et renvoyer vers le médecin pour les compléments.
- Ton : bienveillant, jamais culpabilisant ni moralisateur ; on parle aussi aux flexitariens.
- Légende : `hook` (première ligne, 150 caractères au plus), 5 hashtags au plus. Le reste de la légende
  (les points, « enregistrez », le lien dans la bio, les sources) est ajouté tout seul.
- Contrôles : `pnpm check:instagram`, puis les contrôles de `CLAUDE.md`. Regarder les images avant de fusionner :
  `/api/instagram/image/<slug>/<n>.jpg` sur le site lancé en local.

## Sujets déjà traités

Voir `index.ts`. Idées pour la suite : vitamine D, iode, zinc, tofu et tempeh, seitan, laits végétaux,
fromage et présure, gélatine et additifs d'origine animale, miel, poisson et surpêche, élevage et eau,
méthane, labels bio et équitable, gaspillage, saisons de l'hiver et du printemps, sport et protéines,
enfants et femmes enceintes (repères officiels), restaurants et cantines, histoire du végétarisme,
végétarisme dans le monde, recettes de base (faire son houmous, cuire les légumineuses).
