# Nouvelles recettes de l'appli : consignes

Choix de louis (15/10/2026) : **2 nouvelles recettes chaque semaine** dans l'appli, ajoutées par une tâche programmée de Claude (le lundi matin). Le but : que les menus ne se répètent pas pour les clients qui paient, et que chaque recette ait sa page publique `/recettes/<id>` pour Google.

Le catalogue est dans `lib/catalog.ts`. Le planificateur pioche dedans tout seul : une recette ajoutée au catalogue apparaît dans les menus, la page Recettes, le plan du site et `llms.txt` sans autre changement.

## 1. Choisir les 2 recettes

- Lire tout `lib/catalog.ts` et le journal `content/recettes/JOURNAL.md` : pas de doublon (même plat principal avec les mêmes ingrédients clés, ou titre proche).
- **De saison en France** au moment de l'ajout. D'octobre à mars : courge, chou, poireau, carotte, pomme de terre, navet, céleri, oignon, épinards et légumes surgelés. D'avril à septembre : courgette, tomate, poivron, concombre, haricots verts, petits pois.
- **Équilibrer le catalogue** : préférer les catégories qui ont le moins de recettes (compter dans `lib/catalog.ts`). Les deux recettes de la semaine sont de catégories différentes et d'une légumineuse principale différente (lentilles, pois chiches, haricots, tofu).
- Des plats que les Français connaissent et ont envie de manger un soir de semaine (version végétale d'un classique, plat du monde courant). Pas de plat de fête, pas d'ingrédient introuvable en supermarché.
- 100 % végétal : ni viande, ni poisson, ni œuf, ni produit laitier, ni miel.

## 2. Écrire la recette

Format : une ligne `r(...)` ajoutée **à la fin** de la liste `recipes` (avant `];`), comme les autres, avec le 10e argument `'/images/recettes/<id>.jpg'`. Ne pas toucher aux recettes existantes ni à `photoGroups`.

- `id` : court, en minuscules avec tirets, jamais réutilisé (il sert d'adresse à la page publique).
- `title` : nom simple du plat, sans majuscule à chaque mot. `description` : une phrase de 20 à 90 caractères qui donne envie.
- `minutes` : 10 à 40, temps réel de préparation et de cuisson. `category` : une de `Express`, `Bols`, `Mijotés`, `Pâtes`, `Salades`, `Poêlées`, `Soupes`, `Au four`.
- Ingrédients : **quantités pour 2 portions**, en g, ml ou pièces comme l'ingrédient. Une vraie assiette de dîner (environ 70 à 90 g de féculent sec et 100 à 150 g de légumineuse cuite par personne). Sel, huile et épices comptés.
- **Ingrédients existants d'abord.** Au plus un nouvel ingrédient par semaine, seulement si son prix est relevé sur carrefour.fr (produit standard le moins cher, marque distributeur, hors promotion), ajouté à la liste `ingredients` avec ses allergènes et la date du relevé dans le message de commit. Si le prix ne peut pas être vérifié, changer de recette.
- **Coût : au plus 2 € par portion** (le contrôle le vérifie). Viser moins de 1,30 €.
- `steps` : 3 à 5 étapes, phrases courtes à l'infinitif, avec les durées (« 8 minutes ») pour le minuteur. Toute quantité d'eau ou de liquide écrite entre accolades pour s'adapter aux portions : `{250 ml}`, `{2 cuillères à soupe}`. Le four se dit « Préchauffer le four à 200 °C ».
- `tip` : une astuce utile (réutiliser le reste d'un paquet, remplacer un légume, conserver).
- `tags` : parmi `Rapide`, `Moins de 25 min` (seulement si 25 min ou moins), `Sans gluten` (seulement si aucun ingrédient n'en contient), `Une casserole`, `À préparer en avance`, `Au four` (obligatoire pour la catégorie Au four).

## 3. La photo

`node scripts/recette-photo.mjs <id> "description précise du plat servi"` crée `public/images/recettes/<id>.jpg`. **Regarder la photo** : elle doit montrer ce plat-là, avec les bons ingrédients, appétissante, sans texte ni œuf ni fromage. Sinon, régénérer avec une description plus précise (3 essais au plus). Sans photo correcte, la recette n'est pas ajoutée.

## 4. Relectures (agents séparés, l'un après l'autre)

1. **Le cuisinier** : refait la recette de tête comme un cuisinier amateur. Les quantités font-elles une vraie assiette pour 2 ? Les temps sont-ils réalistes ? Une étape manque-t-elle (égoutter, rincer, préchauffer) ? Le goût tient-il (assez d'assaisonnement) ? Il corrige le fichier et rend une note de 1 à 10.
2. **Le relecteur de français** (même rôle que `content/blog/CONSIGNES.md` §7 bis) : titre, description, étapes, astuce. Français naturel, orthographe, typographie (espace avant `:`, apostrophe ’, « 200 °C »). Note de 1 à 10.

Une note sous 8 : reprendre les points signalés et faire relire (2 tours au plus). Toujours sous 8 : ne pas ajouter cette recette.

## 5. Contrôles et publication

- Contrôles du dépôt (voir `CLAUDE.md`) : `npx tsc --noEmit -p .`, `pnpm check:blog`, `pnpm check:planner` (vérifie les règles ci-dessus : catégorie, temps, étapes, coût, étiquettes, photo), puis `rm -rf .next && pnpm build && pnpm check:api`.
- Ajouter une ligne par recette en haut du journal `content/recettes/JOURNAL.md`.
- Ne modifier que `lib/catalog.ts`, les photos `public/images/recettes/<id>.jpg` et le journal.
- Pull request « Recettes : <titre 1> et <titre 2> », fusionnée en squash une fois les vérifications vertes. Le serveur met le site à jour seul dans l'heure.
