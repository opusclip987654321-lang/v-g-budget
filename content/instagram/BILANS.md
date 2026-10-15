# Instagram VégéBudget : bilans des carrousels

Chaque jour vers 18 h, le site publie le carrousel du dernier article du blog (voir `lib/instagram.ts`).
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

## Format actuel (version 2, 15/10/2026, après la veille)

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

(aucun bilan pour l'instant : le compte n'est pas encore connecté)
