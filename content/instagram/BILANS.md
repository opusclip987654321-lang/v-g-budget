# Instagram VégéBudget : bilans des carrousels

Chaque jour vers 18 h, le site publie un carrousel « infos végé » (voir `content/instagram/CONSIGNES.md`) ;
jusqu'au 19/10/2026, c'était le carrousel du dernier article du blog.
Tous les 3 jours, une tâche programmée de Claude fait le bilan (demande de louis, 15/10/2026) :

1. Lire les chiffres : `https://vegebudget.fr/api/instagram/bilan` (portée, enregistrements, partages, j'aime,
   commentaires, abonnés gagnés, visites du profil par carrousel ; visites du site venues d'Instagram par jour).
   Les chiffres d'Instagram arrivent avec jusqu'à 48 h de retard : ne pas juger un carrousel de moins de 2 jours.
2. Comparer aux repères ci-dessous et aux bilans précédents (même format = même ligne de base).
3. Faire une veille rapide : ce que publient en ce moment les comptes qui marchent (cuisine petit budget,
   batch cooking, menus de la semaine, cuisine végétarienne) et les annonces d'Instagram.
4. Si les résultats sont faibles depuis au moins 3 carrousels du même format, changer **une seule chose à la fois**
   (accroche de la couverture, image 2, recettes, légende, heure…) dans `lib/instagram.ts` ou
   `app/api/instagram/image/[slug]/[n]/route.tsx`, avec les contrôles du dépôt, puis fusionner.
5. Ajouter une entrée en haut du journal ci-dessous : date, chiffres, verdict, changement fait (ou pourquoi aucun).

## Repères (compte de moins de 1 000 abonnés)

Repères de départ, sans source solide pour un petit compte : à remplacer par la médiane du compte après 20 carrousels.

| Indicateur | Bon | Faible |
|---|---|---|
| Enregistrements / portée | 2 % ou plus | moins de 0,5 % |
| Partages / portée | 1 % ou plus | moins de 0,2 % |
| Abonnés gagnés / portée | 0,5 % ou plus | moins de 0,1 % |
| Visites du profil / portée | 2 % ou plus | moins de 0,5 % |

Les partages en message privé sont le signal qui compte le plus pour toucher des non-abonnés (Adam Mosseri, Instagram).

## Format actuel (version 3, 19/10/2026, demande de louis)

- Sujet : un carrousel « infos végé » par jour (régimes, nutrition, animaux, planète, saisons, idées reçues),
  plutôt que les menus. Fichiers dans `content/instagram/carrousels/`.
- Image 1 : grand titre sur fond vert (ou photo), pastille du thème. Puis 3 à 6 images : titre, et un grand
  chiffre, un court texte ou des points numérotés. Fin : lien dans la bio, enregistrer et envoyer, sources.
- Légende : accroche, titres des images en points, appel à enregistrer et envoyer, lien dans la bio, sources,
  5 hashtags au plus.
- Ne pas changer de format avant au moins 3 carrousels de la version 3 avec une vraie portée.

## Format version 2 (15/10/2026 au 18/10/2026, après la veille)

- 9 images au plus, 1080 × 1350.
- Image 1 : photo, titre de l'article, pastille « Dès X € la part » (prix le plus bas des recettes montrées).
- Image 2 : chiffres clés et l'essentiel, car Instagram remontre souvent un carrousel non glissé à partir de l'image 2.
- Une image par recette : photo, prix par part, temps, ingrédients avec quantités pour 2 (le contenu qu'on enregistre).
- Image de fin : « Lien dans la bio · 1re semaine gratuite », invitation à enregistrer et à envoyer.
- Légende : titre et prix en première ligne (mots-clés pour la recherche), 3 points, appel à enregistrer et envoyer,
  lien dans la bio, une ligne sur le service, 5 hashtags au plus (limite d'Instagram).
- Publication vers 18 h (heure de Paris), un carrousel par jour.

Pistes pas encore faites : musique sur les carrousels (impossible par l'API, à ajouter à la main si on veut tester),
un carrousel « menu de la semaine » chaque vendredi, transformer de temps en temps un carrousel en Reel.

## Veille du 15/10/2026

- Cuisine Addict (environ 115 000 abonnés) : chaque vendredi, les plats de la semaine avec la liste de courses
  et les durées de conservation ; accroche budget et semaine. Chima (plus de 200 000) : une famille nourrie
  pour moins de 60 € par semaine, ingrédients partagés entre 5 recettes.
- Instagram limite les publications à 5 hashtags ; les mots-clés de la légende et du texte des images comptent plus.
- Les carrousels obtiennent le plus d'enregistrements ; les Reels touchent plus de monde.
- Sources : 24matins.fr (batch cooking), socialmediatoday.com (Mosseri sur les envois et les carrousels),
  blogdumoderateur.com (5 hashtags), socialinsider.io (étude carrousels).

## Journal des bilans

### 19/10/2026 : nouveau sujet

- louis change le sujet des carrousels : des infos sur le monde végétarien, un sujet différent chaque jour,
  plutôt que les menus du blog. 14 carrousels écrits d'avance, réserve complétée chaque semaine par Claude.

### 19/10/2026 (bilan 1)

- Chiffres : 4 carrousels publiés du 15 au 18/10 (saison, repas pour 2, pois chiches, fin de mois), 9 images chacun. Portée 0, vues 0, enregistrements 0, partages 0 sur les 4. Abonnés : 0. Visites du site venues d'Instagram : 3 (le 15/10, tests).
- Lecture : les chiffres sont bien relevés (Instagram renvoie des zéros, pas une erreur). Un compte à 0 abonné n'a personne à qui montrer un carrousel : Instagram pousse surtout les carrousels aux abonnés, et les Reels aux non-abonnés. Le format ne peut donc pas encore être jugé.
- Veille : les carrousels servent aux enregistrements et à l'engagement, les Reels à la portée hors abonnés ([Storrito](https://storrito.com/resources/how-instagram-carousels-beat-reels-for-engagement-in-2026-and-when-to-use-each/), [Contentdrips](https://contentdrips.com/blog/2026/06/instagram-reels-vs-carousels-2026-guide/)). Les envois en message privé pèseraient le plus selon Adam Mosseri (cité par [True Future Media](https://www.truefuturemedia.com/articles/instagram-carousel-strategy-2026), source indirecte).
- Décision : format des carrousels inchangé. Le blocage est la diffusion, pas le format : question posée à louis (Reel quotidien automatique fait à partir des images du carrousel, et premiers abonnés amenés par lui).
