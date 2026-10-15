# Blog VégéBudget : consignes de l'article quotidien

Un article par jour : un agent SEO étudie la concurrence et prépare un plan, un rédacteur écrit, puis l'agent SEO et un copywriter relisent (deux agents séparés, voulus par louis le 15/10/2026). Deux objectifs, dans cet ordre :
1. **Amener le plus de lecteurs** : être trouvé sur Google et cité par les assistants IA (ChatGPT, Perplexity, Gemini).
2. **Transformer ces lecteurs en clients** : qu'ils cliquent sur « Créer mes menus gratuitement », puis passent à Premium (4,99 € par mois, ou offre fondateur 19 € par an pour les 100 premiers).

Le site : vegebudget.fr prépare des menus de dîners sans viande selon un budget, la liste de courses et le montant estimé, en tenant compte des ingrédients déjà à la maison. Première semaine gratuite, sans compte ni carte bancaire. Pays : France, Belgique, Suisse, Québec.

## 1. Choisir le sujet

- Prendre le premier sujet « à faire » de `SUJETS.md` dont la période convient à la date du jour, ou un meilleur sujet trouvé en cherchant (voir ci-dessous). Le marquer « publié AAAA-MM-JJ → /blog/slug » dans le même changement.
- Vérifier qu'aucun article existant (`lib/blog-articles.ts` et `content/blog/articles/`) ne traite déjà la même requête. Deux articles ne doivent jamais viser le même mot-clé principal.
- Chercher sur le web la requête principale : ce que les gens tapent vraiment (suggestions, « autres questions posées »), ce que les premiers résultats couvrent, et ce qui leur manque. Viser une requête précise (longue traîne) plutôt qu'un sujet vaste déjà tenu par de gros sites.
- Préférer les sujets qui mènent naturellement au service : budget, menus, courses, recettes pas chères, légumes secs, placard, anti-gaspi, saison. Un sujet sur deux au moins doit être dans la catégorie « Budget » ou « Recettes ».
- Quand `SUJETS.md` a moins de 15 sujets « à faire », en ajouter 10 nouveaux à la fin, trouvés par la recherche.

## 2. Les faits et les prix : rien d'inventé

- **Prix** : uniquement ceux du site. Dans le corps, écrire `${cost('id-recette')}` pour le coût par portion d'une recette (recalculé avec les prix du catalogue). Les identifiants des recettes sont dans `lib/catalog.ts` (`r('curry-corail', …)`). Pour un ingrédient (identifiants `i('green-lentils', …)` dans le même fichier) : `${packPrice('green-lentils')}` (« 1,35 € les 500 g »), `${kiloPrice('green-lentils')}` (prix au kilo), `${amountPrice('green-lentils', 70)}` (prix de 70 g). Ces fonctions viennent de `@/lib/blog-cost`. N'écrire aucun prix en dur. Mentionner la provenance comme le site : « coût estimé des ingrédients, prix relevés le 7 octobre 2026 sur carrefour.fr, marques distributeur, hors promotions » (voir `PRICE_SOURCE` dans `lib/pricing.ts`, et la date si elle a changé).
- Ne jamais présenter le coût par portion comme le montant à payer en caisse : les courses comprennent des paquets entiers. Pas de « menu à X € la semaine » sans calcul réel.
- **Chiffres et affirmations externes** (statistiques, réglementation, nutrition, conservation) : seulement depuis une source officielle ou reconnue, lue pendant la recherche (Ademe, Anses, Manger Bouger, Insee, Agence Bio, ministère de l'Agriculture, Santé publique France, FAO…). Chaque source utilisée va dans `sources`. Pas de chiffre sans source. En cas de doute, ne pas l'écrire.
- Pas de promesse santé ou médicale. Pas de dénigrement des concurrents. Pas de garantie d'économie chiffrée (« vous économiserez 100 € ») : on montre des exemples et on laisse le lecteur comparer.
- Ne pas inventer de témoignage, de nombre d'utilisateurs ou d'avis.

## 3. Le style (cahier de réécriture, règles G01 à G17)

- Vouvoiement, ton chaleureux, concret, simple, adulte. Phrases courtes. Pas de jargon.
- « VégéBudget » toujours avec les accents. « sans viande » pour la promesse ; « 100 % végétal » seulement si la recette l'est.
- Le service planifie les **dîners** (« repas du soir ») : ne pas promettre toute l'alimentation de la semaine.
- Montants : « 4,99 € par mois », « 0,70 € », virgule décimale, espace avant €. Mesures : « 250 g », « 20 min ».
- Pas d'adjectifs gratuits (« croustillant », « fondant », « crémeux », « rassasiant », « équilibré ») ni de durée non mesurée (« en 3 minutes »).
- Pas de tiret long (—) pour couper les phrases.

## 4. La structure d'un article

- **Longueur** : 900 à 1 600 mots dans le corps.
- **Introduction (`lead`)** : répond à la question du lecteur dès les deux premières phrases. C'est souvent ce passage que Google et les IA reprennent.
- **Intertitres `##`** formulés comme les questions que les gens tapent. Paragraphes de 2 à 4 phrases. Au moins un tableau ou une liste utile (comparatif de prix, liste de courses, calendrier).
- **Liens internes** : au moins 3, vers des recettes (`/recettes/id`), d'autres articles du blog (`/blog/slug`) et, si utile, `/recettes`. Les pays : `/belgique`, `/suisse`, `/quebec`.
- **Recettes** : un bloc `@recettes id1, id2, id3` (3 ou 4 recettes du catalogue qui collent au sujet).
- **Conversion** : un encadré `> ` au milieu de l'article qui montre comment VégéBudget règle le problème concret de l'article (sans exagérer), et le bloc final `@cta <titre>` (une seule fois, à la fin). Titres de CTA dans l'esprit : « Préparez vos menus en fonction de votre budget », « Organisez vos dîners de la semaine », « Tenez compte de ce que vous avez déjà ». Pas de question racoleuse.
- **FAQ** : 3 à 5 questions réellement posées (vues pendant la recherche), réponses de 1 à 3 phrases, autonomes (elles deviennent des données structurées pour Google).
- Une vidéo YouTube (`@video ID | titre exact | chaîne`) seulement si elle a été trouvée et vérifiée (organisme officiel ou chaîne sérieuse).

## 5. Les champs du fichier

Fichier `content/blog/articles/<slug>.ts`, ajouté à la fin de la liste dans `content/blog/index.ts` :

```ts
import type { Article } from '@/lib/blog-articles';
import { cost } from '@/lib/blog-cost'; // et packPrice, kiloPrice, amountPrice si besoin

export default {
  slug: 'lentilles-recettes-pas-cheres',            // court, sans accents, mots-clés principaux, = nom du fichier
  title: 'Titre affiché (H1), clair et utile',
  seoTitle: 'Titre pour Google, 60 caractères maximum, mot-clé au début',
  description: 'Résumé de 120 à 160 caractères qui donne envie de cliquer, avec le mot-clé principal.',
  lead: 'Introduction qui répond tout de suite.',
  category: 'Budget',                                // Budget, Recettes, Bio et local, Nutrition, Bien-être animal, Saisons
  keywords: ['mot-clé principal', 'variante', 'question fréquente'],
  date: 'AAAA-MM-JJ',                                // date du jour de publication (heure de Paris)
  coverAlt: 'Description de l’illustration',
  body: `
## Premier intertitre
…
@cta Préparez vos menus en fonction de votre budget
`,
  faq: [['Question ?', 'Réponse.']],
  sources: [['Nom de la source (organisme)', 'https://…']],
} satisfies Article;
```

Dans le corps (gabarit entre accents graves), écrire les apostrophes typographiques ’ et ne jamais mettre d'accent grave `.

## 6. L'illustration

**Photo réaliste (choix de louis, 15/10/2026), si la clé `OPENAI_API_KEY` est disponible** :
- `node scripts/blog-photo.mjs <slug> "scène"` : décrire en une phrase une scène concrète liée au sujet (le plat ou les ingrédients de l'article, posés sur une table du quotidien). Le script ajoute le style commun (réaliste, lumière naturelle, sans texte, sans marque, sans visage, sans viande) et enregistre `public/images/blog/<slug>.jpg` en 1200 × 675.
- Mettre `photo: true` dans l'article. Pas de SVG dans ce cas.
- Regarder la photo avant de la garder : rien d'étrange (mains, texte, ustensiles déformés, aliments qui ne sont pas dans la recette). Sinon, relancer avec une scène plus simple (3 essais au plus).

**Sinon (pas de clé ou génération en échec)** : dessin SVG.
- `public/images/blog/<slug>.svg`, 1200 × 675, dans le style des autres (dessin à plat, formes simples, aucun texte sauf la pastille de catégorie en haut à gauche). Couleurs : fond `#e8f0e9` ou `#f1f6ee`, vert foncé `#174c38`, vert citron `#d7f369`, rouge `#eb5757`, orange `#f2994a`, verts `#27ae60` `#8fd18f` `#b8d9b0`, brun `#c98a4b`. S'inspirer de `public/images/blog/recettes-lentilles-pas-cheres.svg`.
- Puis `node scripts/blog-illustration.mjs <slug>` crée la version `.jpg` (aperçu Google et réseaux sociaux). Regarder le JPG pour vérifier qu'il est propre.

## 7. La relecture copywriter (agent séparé, après l'agent SEO)

Le copywriter relit l'article comme un expert du référencement et de la conversion, et **corrige directement le fichier** :
- **Lecteurs** : le mot-clé principal est dans le seoTitle, la description, le lead, un intertitre et le slug ; les intertitres reprennent les questions réelles ; la réponse est donnée tôt ; le titre donne envie de cliquer face aux résultats concurrents ; la FAQ couvre les questions restantes.
- **Clients** : le lien entre le problème du lecteur et VégéBudget est naturel et concret ; l'encadré du milieu et le CTA final sont présents et clairs ; les recettes proposées collent au sujet ; aucune promesse que le service ne tient pas.
- **Confiance** : chaque chiffre a sa source ; les prix viennent du site ; aucun fait douteux ; style conforme à la section 3 ; pas de remplissage ni de phrase creuse ; orthographe et typographie françaises.
- Il rend un court compte rendu : ce qu'il a changé et pourquoi, et une note de 1 à 10 pour « trouvé sur Google » et « donne envie d'essayer ». En dessous de 7, le rédacteur reprend l'article et le copywriter relit à nouveau.

## 8. L'agent SEO (agent séparé, deux passages)

**Avant la rédaction : étude de la concurrence.** Il cherche la requête visée et ses variantes sur le web, ouvre les 5 premiers résultats et rend un plan au rédacteur :
- la requête principale retenue et 3 à 6 requêtes secondaires (suggestions, « autres questions posées ») ;
- pour chaque concurrent : titre, longueur approximative, intertitres, ce qu'il couvre bien, ce qui lui manque (prix réels, coût par portion, liste de courses, réponse directe, mise à jour récente) ;
- l'angle qui permet de faire mieux qu'eux, le plan d'intertitres conseillé, la longueur visée, les questions à mettre en FAQ, les liens internes à placer (articles et recettes existants).
Si la requête est déjà tenue par de très gros sites sans faille visible, il propose une requête plus précise.

**Après la rédaction : contrôle des balises.** Il corrige directement le fichier et vérifie :
- `seoTitle` de 60 caractères au plus, mot-clé au début ; `description` de 120 à 160 caractères avec le mot-clé ; slug court avec le mot-clé ;
- un seul H1 (le titre), des H2 qui reprennent les requêtes secondaires, des H3 seulement sous un H2 ;
- mot-clé principal dans le lead (les 100 premiers mots), dans un H2 et dans `coverAlt` ; variantes naturelles dans le texte, sans répétition forcée ;
- au moins 3 liens internes avec des textes de lien descriptifs (pas « cliquez ici ») ; sources externes officielles ;
- FAQ de 3 à 5 questions (données structurées FAQPage), `keywords` cohérents, date du jour ;
- un passage court et autonome qui répond à la question principale, facile à citer par Google et les assistants IA ;
- pas de cannibalisation : aucun autre article du blog ne vise la même requête (sinon il change l'angle ou relie les deux articles).
Le rendu (balise title, meta description, canonical, image d'aperçu, un seul H1, données structurées BlogPosting, FAQPage et fil d'Ariane, textes alternatifs, liens internes) est vérifié automatiquement par `pnpm check:api`.
Il rend ce qu'il a changé et une note de 1 à 10 « SEO ». En dessous de 7, le rédacteur reprend l'article.

## 9. Avant de publier

`npx tsc --noEmit -p .`, `pnpm check:blog`, `pnpm check:planner`, puis `rm -rf .next && pnpm build && pnpm check:api`. Tout doit passer. Ensuite pull request, puis fusion dans `main` : le serveur met le site à jour tout seul.
