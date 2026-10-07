import { money } from './planner';
import { findRecipe, portionCost } from './seo';

// Articles du blog. Le corps est en markdown simple (voir components/blog-content.tsx pour ce qui est reconnu).
// Chaque article a une illustration public/images/blog/<slug>.svg et sa version .jpg (aperçu réseaux sociaux).
export type Article = {
  slug: string; title: string; seoTitle?: string; description: string; lead: string; category: string; keywords: string[];
  date: string; updated?: string; coverAlt: string; body: string; faq: [string, string][]; sources: [string, string][];
};

// Coût par portion d'une recette du catalogue, recalculé avec les prix du moment.
const cost = (id: string) => money(portionCost(findRecipe(id)!));

export const articles: Article[] = [
  {
    slug: 'manger-bio-pas-cher',
    title: 'Manger bio pas cher : 12 astuces qui marchent vraiment',
    seoTitle: 'Manger bio pas cher : 12 astuces simples pour un petit budget',
    description: 'Le bio coûte plus cher, mais pas partout. Les 12 astuces qui font vraiment baisser la note : légumes secs, vrac, saison, marques distributeur, moins de viande.',
    lead: 'Le bio coûte en moyenne plus cher. Mais l’écart dépend énormément de ce que vous achetez : sur les légumes secs, les céréales ou les légumes de saison, il est faible. Voici comment manger bio sans exploser votre budget.',
    category: 'Bio et local', keywords: ['manger bio pas cher', 'bio petit budget', 'bio moins cher', 'astuces bio', 'alimentation bio'],
    date: '2026-10-07', coverAlt: 'Un panier de légumes bio et une tirelire',
    body: `
## Pourquoi le bio coûte plus cher

En bio, l’agriculteur n’utilise ni pesticides chimiques de synthèse, ni la plupart des engrais chimiques, ni OGM. Fin 2025, environ 10 % des surfaces agricoles françaises étaient cultivées en bio, selon l’Agence Bio. Il désherbe davantage à la main ou à la machine, ses rendements sont souvent plus bas et ses animaux ont plus de place. Tout cela a un coût, qui se retrouve sur l’étiquette.

Mais l’écart n’est pas le même partout. Il est **important sur la viande, les produits laitiers et les plats préparés**, et **faible sur les produits bruts et secs** : lentilles, riz, pâtes, flocons d’avoine, pommes de terre, carottes. C’est là que se joue toute la stratégie.

## Les 12 astuces

### 1. Commencer par les légumes secs et les céréales

Un kilo de lentilles bio reste l’une des protéines les moins chères qui existent. Riz, pâtes, semoule, flocons d’avoine : en bio, ils coûtent quelques dizaines de centimes de plus par portion, pas des euros. C’est la base la plus rentable.

### 2. Manger moins de viande

C’est l’astuce qui libère le plus d’argent. La viande bio est chère ; en la remplaçant deux à cinq soirs par semaine par des lentilles, des pois chiches ou des haricots, vous financez largement le passage au bio du reste du panier. Nos [recettes sans viande](/recettes) coûtent de ${cost('riz-saute')} à ${cost('tofu-cacahuete')} la portion avec des produits classiques.

### 3. Acheter de saison

Une tomate bio en janvier vient de loin ou d’une serre chauffée, et elle est chère. Une courge, un chou ou des carottes bio en octobre sont abondants et bon marché. Gardez notre [calendrier des fruits et légumes de saison](/blog/fruits-legumes-de-saison) sous la main.

### 4. Choisir les marques distributeur bio

Tous les supermarchés ont désormais leur gamme bio à leur marque. Elle respecte le même cahier des charges européen que les marques connues, et coûte souvent nettement moins cher.

### 5. Passer au vrac

Légumes secs, céréales, fruits secs, épices : le vrac évite de payer l’emballage et permet d’acheter la quantité exacte. Comparez toujours le **prix au kilo**, pas le prix du paquet.

### 6. Prioriser selon ce que vous mangez le plus

Inutile de tout passer en bio d’un coup. Commencez par ce que vous consommez souvent et en grande quantité : le pain, les pommes de terre, les pommes, les produits pour les enfants.

### 7. Cuisiner des produits bruts

Un plat préparé bio coûte cher. Les mêmes ingrédients achetés bruts coûtent souvent trois fois moins. Une soupe, un curry de lentilles ou une poêlée se préparent en 20 à 30 minutes.

### 8. Prévoir ses menus

Le gaspillage annule toutes les économies. En prévoyant les dîners de la semaine, on achète juste ce qu’il faut. C’est exactement ce que fait [VégéBudget](/) : il compose les dîners selon votre budget et calcule la liste de courses en paquets entiers.

### 9. Utiliser le surgelé

Épinards, petits pois, haricots verts, brocoli : le surgelé bio est souvent moins cher que le frais hors saison, sans perte ni épluchage.

### 10. Acheter en direct au producteur

Marchés, AMAP, vente à la ferme : en supprimant les intermédiaires, on trouve du bio de saison à des prix proches, voire en dessous, de ceux du supermarché. Notre guide du [circuit court](/blog/circuit-court) explique où chercher.

### 11. Surveiller les fins de marché et les produits « moches »

En fin de marché, beaucoup de producteurs baissent leurs prix. Les fruits et légumes abîmés ou hors calibre sont aussi vendus moins cher, en magasin comme en ligne.

### 12. Cultiver un peu

Un pot d’herbes aromatiques sur le rebord de la fenêtre : un bouquet de basilic ou de persil coûte environ 1 € en magasin, et une plante en donne pendant des semaines.

> **Le bon ordre :** d’abord moins de viande, ensuite les légumes secs et céréales en bio, puis les fruits et légumes de saison. C’est là que le bio coûte le moins cher pour le plus d’effet.

## En vidéo

@video woUsnBEMNzA | Du bio moins cher ? - Tout compte fait | France 2

## Un exemple de dîners bio à petit prix

Ces recettes reposent toutes sur des légumes secs, des céréales et des légumes faciles à trouver en bio :

@recettes curry-corail, mijote-lentilles, soupe-petits-pois, poelee-chou

@cta Envie de dîners simples qui respectent votre budget ?
`,
    faq: [
      ['Le bio est-il vraiment plus cher ?', 'En moyenne oui, mais l’écart varie beaucoup : il est faible sur les légumes secs, les céréales et les légumes de saison, et élevé sur la viande, les produits laitiers et les plats préparés.'],
      ['Par quoi commencer pour manger bio avec un petit budget ?', 'Par les produits bruts que vous consommez le plus : légumes secs, riz, pâtes, pommes de terre, carottes. Réduire la viande permet ensuite de financer le reste.'],
      ['Les marques distributeur bio sont-elles vraiment bio ?', 'Oui. Elles portent le logo bio européen et sont contrôlées selon le même cahier des charges que les autres marques.'],
    ],
    sources: [
      ['Labels bios : comment vous y retrouver ? (economie.gouv.fr)', 'https://www.economie.gouv.fr/particuliers/mes-droits-conso/alimentation/labels-bios-comment-vous-y-retrouver'],
      ['Agence Bio : chiffres du marché et de la production bio 2025', 'https://www.agencebio.org/wp-content/uploads/2026/06/CP-Agence-BIO-Observatoire-2025-16-juin-2026.pdf'],
    ],
  },
  {
    slug: 'circuit-court',
    title: 'Circuit court : définition, où acheter et est-ce vraiment plus cher ?',
    seoTitle: 'Circuit court : définition, où acheter près de chez soi, prix',
    description: 'Ce qu’est vraiment un circuit court (au plus un intermédiaire), les 7 façons d’acheter en direct au producteur, et comment éviter de payer plus cher.',
    lead: 'Un circuit court, c’est acheter avec au plus un intermédiaire entre le producteur et vous. Ce n’est pas forcément local, ni forcément bio, ni forcément plus cher. Voici comment en profiter.',
    category: 'Bio et local', keywords: ['circuit court', 'circuit court définition', 'acheter local', 'AMAP', 'vente directe producteur', 'manger local'],
    date: '2026-10-07', coverAlt: 'Un producteur tend une cagette de légumes à une cliente',
    body: `
## La définition officielle

En France, la définition officielle, reprise par la répression des fraudes (DGCCRF), décrit le circuit court comme un mode de vente où il y a **au maximum un intermédiaire** entre le producteur et le consommateur. Il y a donc deux cas :

- **la vente directe** : vous achetez au producteur lui-même, à la ferme, au marché ou en AMAP ;
- **la vente avec un seul intermédiaire** : un magasin, un restaurant ou une plateforme qui achète directement au producteur.

C’est loin d’être marginal : en 2020, environ **23 % des exploitations agricoles** vendaient au moins une partie de leur production en circuit court, d’après le recensement agricole publié par l’Insee.

## Circuit court, local, bio : ce n’est pas la même chose

C’est la confusion la plus fréquente. La définition du circuit court **ne fixe aucune distance**. Un producteur peut vendre sans intermédiaire à l’autre bout de la France. On parle plutôt de « produit local » quand il vient de moins de 100 à 150 km environ, mais il n’existe pas de définition légale.

Et un produit en circuit court n’est **pas forcément bio**. Beaucoup de petits producteurs travaillent sans pesticides sans avoir le label, d’autres pas du tout. Le plus simple : demander directement au producteur comment il travaille. C’est justement l’avantage du circuit court.

| | Circuit court | Local | Bio |
|---|---|---|---|
| Ce qui est garanti | Au plus 1 intermédiaire | Rien de légal | Cahier des charges contrôlé |
| Distance | Non | Oui, en général | Non |
| Méthode de culture | Non | Non | Oui |

## 7 façons d’acheter en circuit court

1. **Le marché**, en choisissant les stands de producteurs plutôt que de revendeurs. Indice : peu de variétés, des produits de saison, parfois des légumes « pas parfaits ».
2. **L’AMAP** (association pour le maintien d’une agriculture paysanne) : vous vous engagez sur une saison et recevez un panier chaque semaine. Le prix est fixé à l’avance avec le producteur.
3. **La vente à la ferme**, souvent la moins chère, surtout pour les pommes de terre, les pommes ou les œufs.
4. **Les magasins de producteurs**, tenus par plusieurs fermes qui se relaient.
5. **Les plateformes en ligne** qui regroupent des producteurs locaux, avec un retrait chaque semaine dans un point de distribution.
6. **La cueillette à la ferme** : vous ramassez vous-même, c’est souvent moins cher et les enfants adorent.
7. **Certains rayons de supermarché** qui achètent directement aux producteurs de la région (un seul intermédiaire : le magasin).

## Est-ce plus cher ?

Pas forcément. Sur les **légumes de saison**, les prix du marché ou de l’AMAP sont souvent comparables à ceux du supermarché, parfois plus bas, car le producteur garde la marge des intermédiaires. Sur les produits transformés (fromages, charcuterie, jus), le circuit court est en général plus cher, mais la qualité n’est pas la même.

Pour ne pas se faire piéger :

- achetez **de saison**, c’est là que les prix sont les plus bas ;
- comparez au **prix au kilo** ;
- prévoyez vos repas avant d’y aller, pour ne pas craquer sur ce qui ne sera pas cuisiné ;
- utilisez les légumes moins nobles (chou, courge, poireaux, carottes) qui sont abondants et bon marché.

> **Notre conseil :** gardez les légumes de saison en direct du producteur, et le riz, les pâtes et les légumes secs au supermarché. Vous avez le meilleur des deux.

## Pourquoi c’est bon pour tout le monde

Le producteur est mieux payé : il fixe son prix et ne partage pas sa marge. Vous savez d’où vient ce que vous mangez et pouvez poser vos questions. Les produits sont cueillis plus mûrs, car ils voyagent moins. Et l’argent reste dans l’économie de votre région.

## En vidéo

@video uWFeuI6NsHw | Du producteur au consommateur : la vente directe cartonne ! | La Quotidienne, France 5

## Cuisiner les paniers de légumes

Le piège de l’AMAP, c’est le chou ou la courge qu’on ne sait pas cuisiner. Quelques idées simples et économiques :

@recettes poelee-chou, courge-lentilles, mijote-lentilles, galettes-lentilles

@cta Un panier de légumes et pas d’idée pour le dîner ?
`,
    faq: [
      ['Quelle est la définition d’un circuit court ?', 'Un mode de vente avec au maximum un intermédiaire entre le producteur et le consommateur, selon la définition officielle reprise par la DGCCRF. Il n’y a pas de critère de distance.'],
      ['Un produit en circuit court est-il forcément local ?', 'Non. La définition ne fixe aucune distance. Dans les faits, la plupart des circuits courts sont locaux, mais ce n’est pas garanti.'],
      ['Où trouver une AMAP près de chez moi ?', 'Les réseaux régionaux d’AMAP publient des annuaires (par exemple amap-idf.org en Île-de-France). Pour la vente à la ferme, le site Bienvenue à la ferme permet de chercher un producteur par produit et par commune.'],
    ],
    sources: [
      ['Produits alimentaires commercialisés en circuits courts (DGCCRF)', 'https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/produits-alimentaires-commercialises-en-circuits-courts'],
      ['Diversification des activités des exploitations agricoles (Insee)', 'https://www.insee.fr/fr/statistiques/7728853'],
      ['Bienvenue à la ferme : trouver un producteur', 'https://www.bienvenue-a-la-ferme.com/'],
    ],
  },
  {
    slug: 'code-oeufs',
    title: 'Code des œufs 0, 1, 2, 3 : ce que veut dire le chiffre sur la coquille',
    seoTitle: 'Code œuf 0, 1, 2, 3 : signification et comment bien choisir',
    description: 'Le premier chiffre imprimé sur l’œuf indique comment la poule a été élevée : 0 bio, 1 plein air, 2 au sol, 3 en cage. Comment lire tout le code et choisir sans payer trop cher.',
    lead: 'Sur chaque œuf vendu en magasin, un code est imprimé. Le premier chiffre est le plus important : il dit comment la poule a vécu. Voici comment le lire en deux secondes.',
    category: 'Bien-être animal', keywords: ['code oeuf', 'code oeuf 0 1 2 3', 'oeuf code 0', 'oeuf plein air', 'oeuf poule en cage', 'signification code oeuf'],
    date: '2026-10-07', coverAlt: 'Quatre œufs marqués 0, 1, 2 et 3',
    body: `
## Lire le code en 2 secondes

![Schéma d’un code imprimé sur un œuf : 0 pour le mode d’élevage, FR pour le pays, puis le code de l’élevage](/images/blog/code-oeuf-schema.svg "Le code d’un œuf : le mode d’élevage, le pays, puis l’élevage et le bâtiment.")

Le code ressemble à **0 FR ABC 01**. Il se lit de gauche à droite :

- **le premier chiffre** : le mode d’élevage de la poule (de 0 à 3) ;
- **les deux lettres** : le pays où l’œuf a été pondu (FR pour la France) ;
- **la suite** : l’identifiant de l’élevage et du bâtiment, qui permet de retrouver l’origine exacte.

Ce marquage est obligatoire sur les œufs vendus en magasin dans toute l’Union européenne.

## Ce que veut dire chaque chiffre

| Code | Mode d’élevage | Ce que ça veut dire pour la poule |
|---|---|---|
| **0** | Biologique | Accès à l’extérieur, alimentation bio, moins de poules par bâtiment |
| **1** | Plein air | Accès à un parcours en plein air, au moins 4 m² par poule |
| **2** | Au sol | Pas de cage, mais enfermée dans un bâtiment, sans accès dehors |
| **3** | En cage | Cage dite « aménagée », sans accès dehors |

Plus le chiffre est bas, plus la poule a de place et d’accès à l’extérieur.

### Et le Label Rouge ?

Les œufs Label Rouge viennent de poules élevées en plein air, avec des exigences supplémentaires (taille des bâtiments, alimentation). Leur code commence donc par **1**.

## Œufs en cage : où en est-on en France ?

La loi EGalim de 2018 interdit de construire ou d’aménager de nouveaux bâtiments pour des poules en cage. La plupart des grandes enseignes se sont aussi engagées à ne plus vendre d’œufs coquille de code 3 en marque distributeur. La part des œufs de cage a donc fortement baissé, mais ils existent toujours, et surtout **dans les produits transformés** : pâtes aux œufs, biscuits, mayonnaise, plats préparés. Sur ces produits, le code n’apparaît pas ; seule la mention « œufs de poules élevées en plein air » ou « bio » vous renseigne.

## Choisir sans payer trop cher

L’écart de prix entre un œuf de code 3 et un œuf de code 1 est en général de quelques centimes par œuf. Rapporté à une omelette, c’est très peu. Quelques réflexes :

- **le code 1 est le meilleur rapport qualité-prix** pour le bien-être animal ;
- **le code 0** ajoute l’alimentation bio des poules, pour un prix plus élevé ;
- achetez plutôt des **boîtes de 12 ou de 30** : le prix à l’œuf baisse ;
- dans les **produits transformés**, cherchez la mention du mode d’élevage sur l’emballage.

> **Bon à savoir :** la couleur de la coquille (blanche ou rousse) dépend de la race de la poule. Elle ne dit rien de la qualité ni du mode d’élevage.

## En vidéo

@video LaC473KDnaM | Apprendre à déchiffrer le marquage sur les oeufs | ConsoMag

## Et si on s’en passait le soir ?

Toutes nos recettes sont 100 % végétales : pas d’œufs, pas de lait. Pour remplacer l’œuf dans des galettes, une cuillère de farine et un peu d’eau suffisent souvent.

@recettes galettes-lentilles, epinards-pois-chiches, pates-brocoli

@cta Des dîners sans viande ni œufs, à moins d’1 € la portion ?
`,
    faq: [
      ['Que veut dire le code 0 sur un œuf ?', 'Le 0 signifie que la poule a été élevée en agriculture biologique : accès à l’extérieur, alimentation bio et moins de poules par bâtiment.'],
      ['Quelle est la différence entre un œuf code 1 et code 2 ?', 'Avec le code 1, la poule a accès à un parcours en plein air. Avec le code 2, elle n’est pas en cage mais reste enfermée dans un bâtiment.'],
      ['Où trouver le code sur une boîte d’œufs ?', 'Le code est imprimé sur la coquille de chaque œuf. Le mode d’élevage est aussi écrit en toutes lettres sur la boîte.'],
      ['Les œufs roux sont-ils meilleurs que les blancs ?', 'Non. La couleur de la coquille dépend seulement de la race de la poule.'],
    ],
    sources: [
      ['Étiquetage des œufs (DGCCRF)', 'https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/etiquetage-des-oeufs'],
      ['Poules pondeuses en cage : où en est la réglementation ? (WebLex)', 'https://www.weblex.fr/weblex-actualite/poules-pondeuses-en-cages-ou-en-est-la-reglementation'],
    ],
  },
  {
    slug: 'fruits-legumes-de-saison',
    title: 'Fruits et légumes de saison : le calendrier mois par mois',
    seoTitle: 'Calendrier des fruits et légumes de saison mois par mois (France)',
    description: 'Quels fruits et légumes acheter chaque mois en France : le calendrier complet, de janvier à décembre, pour manger meilleur et moins cher.',
    lead: 'Un légume de saison est plus savoureux, souvent moins cher et n’a pas poussé dans une serre chauffée. Voici ce qu’on trouve chaque mois en France métropolitaine.',
    category: 'Bio et local', keywords: ['fruits et légumes de saison', 'calendrier fruits et légumes', 'légumes de saison', 'fruits de saison', 'légumes d’octobre', 'légumes d’hiver'],
    date: '2026-10-07', coverAlt: 'Une roue des saisons avec des courges, des tomates, des fraises et des choux',
    body: `
## Pourquoi acheter de saison

- **C’est moins cher.** Quand un légume arrive en pleine saison, il est abondant et son prix baisse.
- **C’est meilleur.** Il est cueilli plus mûr et voyage moins.
- **C’est mieux pour le climat.** Une tomate cultivée en France en hiver pousse sous une serre chauffée, qui émet beaucoup plus de gaz à effet de serre qu’une tomate d’été en plein champ.

## Le calendrier mois par mois

Ce calendrier concerne la France métropolitaine ; selon les régions, les saisons peuvent avancer ou reculer de quelques semaines. Les légumes de conservation (pommes de terre, oignons, carottes, courges) se trouvent bien au-delà de leur récolte.

| Mois | Légumes | Fruits |
|---|---|---|
| **Janvier** | Poireau, chou, carotte, céleri, endive, betterave, courge, panais, mâche | Pomme, poire, kiwi, orange, clémentine |
| **Février** | Poireau, chou, carotte, endive, betterave, panais, topinambour | Pomme, poire, kiwi, orange, pamplemousse |
| **Mars** | Poireau, chou, carotte, endive, épinard, radis | Pomme, poire, kiwi |
| **Avril** | Asperge, épinard, radis, petits pois, laitue, blette | Pomme, rhubarbe |
| **Mai** | Asperge, petits pois, radis, laitue, artichaut, fève, concombre | Fraise, rhubarbe, cerise |
| **Juin** | Courgette, concombre, haricot vert, petits pois, tomate, artichaut | Fraise, cerise, abricot, framboise, melon |
| **Juillet** | Tomate, courgette, aubergine, poivron, haricot vert, concombre, maïs | Abricot, pêche, nectarine, melon, framboise, cassis |
| **Août** | Tomate, courgette, aubergine, poivron, haricot vert, maïs | Pêche, prune, melon, pastèque, figue, mûre |
| **Septembre** | Tomate, courgette, poivron, aubergine, brocoli, potiron, champignons | Raisin, prune, figue, poire, pomme |
| **Octobre** | Courge, potiron, brocoli, chou-fleur, épinard, poireau, céleri, champignons | Pomme, poire, raisin, coing, châtaigne |
| **Novembre** | Courge, chou, poireau, carotte, céleri, endive, panais, topinambour | Pomme, poire, kiwi, clémentine, châtaigne |
| **Décembre** | Chou, poireau, carotte, endive, courge, panais, mâche, céleri | Pomme, poire, kiwi, clémentine, orange |

> **Toute l’année :** pommes de terre, oignons, ail, carottes et choux se conservent ou se récoltent presque toute l’année. Ce sont aussi les légumes les moins chers au kilo.

## Ce qu’on cuisine en octobre

C’est la saison des **courges**, des **choux** et des **champignons**, et la fin des tomates. Un potiron ou une butternut coûte souvent moins de 3 € le kilo et donne une soupe pour plusieurs soirs.

@recettes courge-lentilles, poelee-chou, pates-champignons, pates-brocoli

## En vidéo

@video 2D6Pq0aK2Xs | Goût, pollution : stop aux tomates en hiver ! | Tout compte fait, France 2

## Et hors saison ? Pensez au surgelé et aux conserves

Les épinards, petits pois, haricots verts ou le brocoli surgelés sont cueillis et congelés en pleine saison. Ils gardent bien leurs vitamines, coûtent souvent moins cher que le frais hors saison et ne se gaspillent pas. Même chose pour les tomates en conserve, idéales en hiver pour les sauces.

@cta Des menus de la semaine avec des produits de saison et pas chers ?
`,
    faq: [
      ['Quels légumes sont de saison en octobre ?', 'En octobre : courges et potirons, brocoli, chou-fleur, épinards, poireaux, céleri, champignons, ainsi que les pommes de terre, carottes et oignons.'],
      ['Quels fruits sont de saison en hiver ?', 'Pommes, poires, kiwis et agrumes (oranges, clémentines, pamplemousses).'],
      ['Les légumes surgelés sont-ils aussi bons que les frais ?', 'Oui, sur le plan nutritionnel ils sont proches : ils sont congelés juste après la récolte. Ils sont souvent moins chers que les légumes frais hors saison.'],
    ],
    sources: [
      ['Fruits et légumes de saison, mois par mois (Impact CO₂, Ademe)', 'https://impactco2.fr/outils/fruitsetlegumes'],
      ['Les fruits et légumes d’octobre (Manger Bouger)', 'https://www.mangerbouger.fr/manger-mieux/bien-manger-sans-se-ruiner/calendrier-de-saison/les-fruits-et-legumes-d-octobre'],
    ],
  },
  {
    slug: 'label-bio-ab',
    title: 'Label bio AB et logo européen : ce qu’ils garantissent vraiment',
    description: 'Ce que garantissent le logo AB et l’Eurofeuille : pas de pesticides de synthèse, pas d’OGM, 95 % d’ingrédients bio, contrôles chaque année. Et ce qu’ils ne garantissent pas.',
    lead: 'Le logo AB vert et blanc et la petite feuille étoilée européenne disent la même chose : le produit respecte le règlement bio européen. Voici ce que ça change, concrètement.',
    category: 'Bio et local', keywords: ['label bio', 'label AB', 'logo bio européen', 'eurofeuille', 'que garantit le bio', 'agriculture biologique'],
    date: '2026-10-07', coverAlt: 'Une feuille verte formée d’étoiles à côté d’un épi de blé',
    body: `
## Deux logos, une même règle

- **La feuille européenne** (l’Eurofeuille), faite d’étoiles en forme de feuille sur fond vert, est **obligatoire** sur tous les produits bio préemballés vendus dans l’Union européenne.
- **Le logo AB**, vert et blanc, appartient au ministère de l’Agriculture. Il est **facultatif** et garantit exactement les mêmes règles. Il est surtout présent parce que les Français le connaissent bien.

À côté du logo européen, on trouve aussi le code de l’organisme qui a contrôlé le produit (par exemple FR-BIO-01) et l’origine des ingrédients : « Agriculture UE », « Agriculture non UE » ou « Agriculture UE/non UE ».

## Ce que le bio garantit

1. **Pas de pesticides chimiques de synthèse**, et la plupart des engrais chimiques sont interdits. Seuls quelques produits d’origine naturelle sont autorisés.
2. **Pas d’OGM.**
3. **Au moins 95 % d’ingrédients agricoles bio** dans un produit transformé.
4. **Des animaux mieux traités** : accès à l’extérieur, plus d’espace, alimentation bio, antibiotiques très limités.
5. **Peu d’additifs** : la liste des additifs autorisés est beaucoup plus courte qu’en conventionnel.
6. **Des contrôles au moins une fois par an** de chaque producteur et transformateur par un organisme certificateur agréé.

## Ce que le bio ne garantit pas

- **Que le produit soit local.** Un produit bio peut venir de l’autre bout du monde. Regardez la mention d’origine.
- **Que le produit soit bon pour la santé.** Des biscuits bio restent des biscuits : sucre, gras et sel ne sont pas limités par le label.
- **Zéro trace de pesticide.** Le bio interdit d’en utiliser, mais un champ voisin peut contaminer légèrement une culture.
- **Un bien-être animal parfait.** Les règles sont meilleures que le minimum légal, mais varient selon les espèces.

> **Pour un produit vraiment local et bio**, combinez le logo bio avec un achat en [circuit court](/blog/circuit-court) ou la mention « Agriculture France ».

## Les autres labels à connaître

| Label | Ce qu’il garantit |
|---|---|
| **AB / Eurofeuille** | Règlement bio européen |
| **Bio Cohérence**, **Demeter**, **Nature & Progrès** | Règles bio plus exigeantes (produits 100 % bio, origine, biodiversité) |
| **Label Rouge** | Qualité gustative supérieure, pas forcément bio |
| **HVE** (Haute Valeur Environnementale) | Démarche environnementale, mais pesticides de synthèse autorisés |

## En vidéo

@video RUWa-wxOsW4 | Qu’est-ce que l’agriculture biologique ? | INAO

## Le bio à petit prix

Le bio est le plus abordable sur les produits bruts : légumes secs, céréales, légumes de saison. Toutes nos astuces sont dans [Manger bio pas cher](/blog/manger-bio-pas-cher).

@recettes bolognaise-lentilles, curry-corail, salade-lentilles

@cta Des dîners simples à base de légumes secs, à moins d’1 € la portion ?
`,
    faq: [
      ['Quelle est la différence entre le logo AB et le logo bio européen ?', 'Aucune sur le fond : les deux garantissent le respect du règlement bio européen. Le logo européen est obligatoire, le logo AB est facultatif.'],
      ['Un produit bio contient-il des pesticides ?', 'Les pesticides chimiques de synthèse sont interdits en bio. Seuls quelques produits d’origine naturelle sont autorisés. Des traces dues à des contaminations extérieures restent possibles.'],
      ['Le bio est-il forcément français ?', 'Non. La mention « Agriculture UE », « non UE » ou « France » à côté du logo indique l’origine des ingrédients.'],
    ],
    sources: [
      ['Labels bios : comment vous y retrouver ? (economie.gouv.fr)', 'https://www.economie.gouv.fr/particuliers/mes-droits-conso/alimentation/labels-bios-comment-vous-y-retrouver'],
      ['Aliments et boissons issus de l’agriculture biologique (Ademe)', 'https://agirpourlatransition.ademe.fr/particuliers/mieux-consommer/mieux-choisir/labels-environnementaux/alimentation/aliments-boissons-agriculture-biologique'],
    ],
  },
  {
    slug: 'bien-etre-animal-etiquettes',
    title: 'Bien-être animal : comment lire les étiquettes au supermarché',
    seoTitle: 'Bien-être animal : lire les étiquettes (poulet, œufs, lait, porc)',
    description: 'Plein air, Label Rouge, bio, étiquette bien-être animal de A à E : ce que disent vraiment les mentions sur la viande, les œufs et le lait, et ce qu’elles ne disent pas.',
    lead: 'Les emballages montrent des prés verts et des fermes heureuses. Mais seules quelques mentions sont encadrées par la loi. Voici celles qui veulent dire quelque chose.',
    category: 'Bien-être animal', keywords: ['bien-être animal', 'étiquette bien-être animal', 'poulet label rouge', 'élevage intensif', 'poulet plein air', 'lire les étiquettes'],
    date: '2026-10-07', coverAlt: 'Une poule dans un pré devant une étiquette notée A',
    body: `
## Les mentions qui comptent vraiment

Les dessins de fermes et les mots comme « tradition », « nos éleveurs » ou « élevé avec soin » ne garantissent rien. Ce qui compte, ce sont les **signes officiels** et les **mentions encadrées** :

| Mention | Ce qu’elle garantit |
|---|---|
| **Bio (AB / Eurofeuille)** | Accès à l’extérieur, plus d’espace, alimentation bio, antibiotiques limités |
| **Label Rouge** | Pour les volailles : souches à croissance lente, accès au plein air, abattage plus tardif |
| **Plein air** | Accès à un parcours extérieur, avec une surface minimale par animal |
| **Fermier** | Élevage de taille limitée, accès au plein air (pour les volailles) |
| **Étiquette bien-être animal** | Note de A (supérieur) à E (minimum légal), sur tout le cycle de vie |

## Le poulet : la plus grosse différence

Un poulet standard grandit très vite : il est abattu en général **vers 35 à 40 jours**, dans un bâtiment sans accès à l’extérieur. Un poulet Label Rouge est d’une souche à croissance lente, a accès à un parcours et vit **au moins 81 jours**. Le poulet bio vit aussi longtemps, avec une alimentation bio.

C’est pour le poulet que le choix pèse le plus : c’est la viande la plus consommée et celle où l’écart de conditions de vie est le plus grand.

## L’étiquette bien-être animal

Créée par des associations de protection animale et des distributeurs, cette étiquette note les produits de **A à E** en tenant compte de l’élevage, du transport et de l’abattage. Elle est surtout présente sur le poulet et le porc. Elle est volontaire : un produit sans étiquette n’est pas forcément mal noté, mais un produit noté **E** correspond au minimum légal.

## Les œufs : le code dit tout

Pour les œufs, c’est simple : le premier chiffre du code imprimé sur la coquille indique le mode d’élevage, de 0 (bio) à 3 (cage). Tout est expliqué dans notre article sur le [code des œufs](/blog/code-oeufs).

## Le lait et le porc

- **Lait :** les mentions « pâturage » ou « lait de pâturage » indiquent un nombre minimum de jours au pré dans l’année, selon des cahiers des charges privés. Le bio impose aussi l’accès au pâturage.
- **Porc :** en élevage standard, les porcs vivent en bâtiment, sur caillebotis. Le Label Rouge, le bio et certaines filières « plein air » ou « sur paille » apportent de vraies différences.

## En vidéo

@video lhqtCo9i4fA | Étiquette Bien-être animal : choisir, c’est agir ! | CIWF France

## Mieux manger les animaux… ou en manger moins

Une viande mieux élevée coûte plus cher. La façon la plus simple de se l’offrir sans dépenser plus : **en manger moins souvent**. Remplacer la viande deux ou trois soirs par semaine par des légumes secs libère largement de quoi acheter un poulet Label Rouge ou bio le week-end.

@recettes chili-haricots, couscous-legumes, pois-chiches-rotis, bolognaise-lentilles

@cta Trois soirs sans viande par semaine, sans se prendre la tête ?
`,
    faq: [
      ['Quelle est la différence entre un poulet standard et un poulet Label Rouge ?', 'Le poulet standard est abattu vers 35 à 40 jours, en bâtiment. Le poulet Label Rouge est d’une souche à croissance lente, a accès au plein air et vit au moins 81 jours.'],
      ['Que veut dire la note de l’étiquette bien-être animal ?', 'Elle va de A (niveau supérieur) à E (minimum légal) et prend en compte l’élevage, le transport et l’abattage des animaux.'],
      ['Comment manger de la viande mieux élevée sans dépenser plus ?', 'En mangeant de la viande moins souvent : remplacer deux ou trois repas par semaine par des légumes secs libère le budget pour une viande de meilleure qualité.'],
    ],
    sources: [
      ['Étiquette Bien-être animal', 'https://www.etiquettebienetreanimal.fr/'],
      ['Modes d’élevage : notre avis (UFC-Que Choisir)', 'https://www.quechoisir.org/decryptage-poule-pondeuse-poulet-porc-boeuf-notre-avis-sur-les-differents-modes-d-elevage-n5685/'],
    ],
  },
  {
    slug: 'proteines-vegetales',
    title: 'Protéines végétales : lesquelles choisir et combien elles coûtent',
    seoTitle: 'Protéines végétales : liste, quantités et prix (lentilles, pois chiches, tofu)',
    description: 'Lentilles, pois chiches, haricots, tofu, avoine : combien de protéines ils apportent, combien ils coûtent pour 10 g de protéines, et comment bien les associer.',
    lead: 'Les légumes secs sont parmi les protéines les moins chères qui existent. Voici combien ils en apportent, combien ils coûtent vraiment et comment les cuisiner sans y passer des heures.',
    category: 'Nutrition', keywords: ['protéines végétales', 'protéine végétale', 'légumineuses', 'lentilles protéines', 'remplacer la viande', 'protéines pas cher'],
    date: '2026-10-07', coverAlt: 'Des bocaux de lentilles, pois chiches et haricots',
    body: `
## De combien de protéines a-t-on besoin ?

L’Anses retient pour un adulte une référence de **0,83 g de protéines par kilo de poids et par jour**. Pour une personne de 70 kg, cela fait environ 58 g par jour. La plupart des Français en mangent nettement plus que nécessaire, et une alimentation sans viande bien composée couvre facilement ce besoin.

## Les meilleures sources végétales

| Aliment | Protéines pour 100 g (environ) | Prix pour 10 g de protéines* |
|---|---|---|
| **Lentilles vertes** (sèches) | 24 g | 0,11 € |
| **Flocons d’avoine** | 13 g | 0,12 € |
| **Lentilles corail** (sèches) | 24 g | 0,15 € |
| **Haricots rouges** (conserve, égouttés) | 8 g | 0,27 € |
| **Pois chiches** (conserve, égouttés) | 7 g | 0,35 € |
| **Haricots blancs** (conserve, égouttés) | 7 g | 0,32 € |
| **Tofu nature** | 12 g | 1,04 € |

*Calcul VégéBudget avec les prix de marque distributeur relevés le 7 octobre 2026 sur carrefour.fr. Valeurs nutritionnelles moyennes arrondies, à vérifier sur l’emballage : elles varient selon les marques.

Les **lentilles sèches** sont imbattables : pour le prix d’un café, on obtient la moitié des protéines de la journée. Les conserves coûtent plus cher au gramme de protéines, mais elles sont prêtes en deux minutes.

## Faut-il associer céréales et légumineuses ?

Les légumineuses (lentilles, pois chiches, haricots) et les céréales (riz, blé, avoine) n’ont pas exactement les mêmes acides aminés : ensemble, ils se complètent. Pas besoin de les associer dans le même repas ; il suffit d’en manger tous les deux au cours de la journée. C’est le principe de nombreux plats traditionnels : **riz et lentilles**, **semoule et pois chiches**, **chili et maïs**.

## Comment en manger plus sans se compliquer la vie

- **Les lentilles corail** cuisent en 15 minutes, sans trempage. Parfaites pour les currys et les soupes.
- **Les conserves** de pois chiches et de haricots se rincent et s’utilisent directement.
- **Les lentilles vertes** cuisent en 20 à 25 minutes et se gardent 3 jours au frigo : cuisez-en le double pour une salade le lendemain.
- **Rincez bien les conserves** : cela retire une partie du sel et rend les légumineuses plus digestes.

> **Le repère officiel :** manger des légumes secs **au moins deux fois par semaine**, d’après le Programme national nutrition santé (Manger Bouger).

## En vidéo

@video UlEChazV2mk | Légumineuses : le vrai du faux ! | La Quotidienne, France 5

## Nos recettes les plus riches en légumineuses

@recettes curry-corail, mijote-lentilles, chili-haricots, couscous-legumes

@cta Des dîners riches en protéines végétales, sans y penser ?
`,
    faq: [
      ['Quelle est la protéine végétale la moins chère ?', 'Les lentilles sèches : environ 0,11 à 0,15 € pour 10 g de protéines avec les prix de marque distributeur.'],
      ['Combien de protéines faut-il par jour ?', 'L’Anses retient 0,83 g par kilo de poids corporel et par jour pour un adulte, soit environ 58 g pour une personne de 70 kg.'],
      ['Faut-il associer céréales et légumineuses dans le même repas ?', 'Non. Il suffit d’en manger au cours de la journée pour que leurs acides aminés se complètent.'],
    ],
    sources: [
      ['Protéines : rôle, sources et apports recommandés (Anses)', 'https://www.anses.fr/fr/content/proteines-role-sources-et-apports-recommandes'],
      ['Augmenter les légumes secs (Manger Bouger)', 'https://www.mangerbouger.fr/l-essentiel/les-recommandations-sur-l-alimentation-l-activite-physique-et-la-sedentarite/augmenter/augmenter-les-legumes-secs'],
    ],
  },
  {
    slug: 'menu-semaine-pas-cher',
    title: 'Menu de la semaine pas cher : 5 dîners pour 2 à environ 21 €',
    seoTitle: 'Menu de la semaine pas cher : 5 dîners pour 2 à environ 21 € (sans viande)',
    description: 'Un exemple concret de menu de la semaine sans viande pour 2 personnes : 5 dîners, la liste de courses et le coût réel, autour de 21 € de courses.',
    lead: 'Cinq dîners pour deux, faciles, sans viande, avec des produits de supermarché. Voici le menu, ce qu’il coûte vraiment et comment le refaire chaque semaine.',
    category: 'Budget', keywords: ['menu de la semaine pas cher', 'menu semaine petit budget', 'menu 20 euros', 'idée repas pas cher', 'menu semaine végétarien', 'liste de courses semaine'],
    date: '2026-10-07', coverAlt: 'Un planning de la semaine avec cinq assiettes et un ticket de caisse',
    body: `
## Le menu

| Soir | Dîner | Temps | Coût par portion* |
|---|---|---|---|
| **Lundi** | [Curry de lentilles corail](/recettes/curry-corail) | 25 min | ${cost('curry-corail')} |
| **Mardi** | [Pâtes au brocoli et citron](/recettes/pates-brocoli) | 20 min | ${cost('pates-brocoli')} |
| **Mercredi** | [Riz sauté aux petits pois](/recettes/riz-saute) | 25 min | ${cost('riz-saute')} |
| **Jeudi** | [Poêlée d’épinards et pois chiches](/recettes/epinards-pois-chiches) | 20 min | ${cost('epinards-pois-chiches')} |
| **Vendredi** | [Soupe de petits pois et tartines](/recettes/soupe-petits-pois) | 25 min | ${cost('soupe-petits-pois')} |

*Coût des quantités utilisées, avec les prix de marque distributeur relevés le 7 octobre 2026 sur carrefour.fr.

## Combien ça coûte vraiment

Il y a deux façons de compter :

- **Ce que vous mangez** : moins d’1 € par portion pour chaque dîner.
- **Ce que vous payez en caisse** : environ **21 €** pour la semaine, car on achète des paquets entiers (un kilo de riz, un sac de petits pois surgelés…). Une partie reste au placard pour les semaines suivantes, et la semaine d’après coûte donc moins cher.

C’est cette deuxième façon de compter que la plupart des sites oublient, et c’est pour ça que les « menus à 15 € » finissent souvent à 35 € en caisse.

## Les principes qui font baisser la note

1. **Des légumes secs comme base** : lentilles, pois chiches, haricots. Ce sont les protéines les moins chères (voir [notre comparatif](/blog/proteines-vegetales)).
2. **Des ingrédients qui reviennent** : les petits pois servent mardi et vendredi, le riz lundi et mercredi. Moins de paquets entamés, moins de gaspillage.
3. **Du surgelé** pour les légumes verts : moins cher que le frais hors saison et zéro perte.
4. **Des marques distributeur** pour le riz, les pâtes, les conserves.
5. **Le placard d’abord** : avant d’acheter, on regarde ce qu’on a déjà.

## La liste de courses

Pour ce menu, il faut principalement : lentilles corail, riz, pâtes, pois chiches en conserve, petits pois surgelés, épinards surgelés, brocoli surgelé, tomates concassées, oignons, ail, un citron, du lait de coco et du pain. Les épices et l’huile viennent du placard.

> **Le plus long, ce n’est pas de cuisiner, c’est de faire la liste.** [VégéBudget](/) compose vos dîners selon votre budget, déduit ce que vous avez déjà et calcule les quantités en paquets entiers, comme en magasin.

## En vidéo

@video CiuMLpBsqss | Ça suffit le gâchis : la liste de courses | ministère de la Transition écologique

## D’autres dîners pour varier

@recettes semoule-pois, salade-lentilles, mijote-lentilles, poelee-chou

@cta Votre menu de la semaine dans votre budget, en 3 minutes ?
`,
    faq: [
      ['Combien coûte un menu de la semaine pour 2 personnes ?', 'Avec 5 dîners sans viande à base de légumes secs, environ 21 € de courses en paquets entiers, et moins d’1 € par portion pour ce qui est réellement mangé.'],
      ['Comment faire un menu de la semaine pas cher ?', 'Partir des légumes secs, réutiliser les mêmes ingrédients sur plusieurs repas, utiliser le surgelé et les marques distributeur, et regarder le placard avant d’acheter.'],
    ],
    sources: [
      ['Augmenter les légumes secs (Manger Bouger)', 'https://www.mangerbouger.fr/l-essentiel/les-recommandations-sur-l-alimentation-l-activite-physique-et-la-sedentarite/augmenter/augmenter-les-legumes-secs'],
    ],
  },
  {
    slug: 'gaspillage-alimentaire',
    title: 'Gaspillage alimentaire : 10 gestes pour arrêter de jeter (et d’acheter) pour rien',
    seoTitle: 'Gaspillage alimentaire à la maison : 10 gestes simples pour économiser',
    description: 'En France, chaque habitant jette environ 30 kg de nourriture par an à la maison. Les 10 gestes qui réduisent le gaspillage et la note des courses.',
    lead: 'La nourriture qu’on jette, c’est de l’argent qu’on a dépensé pour rien. Bonne nouvelle : quelques habitudes suffisent pour en jeter beaucoup moins.',
    category: 'Budget', keywords: ['gaspillage alimentaire', 'anti gaspi', 'réduire le gaspillage alimentaire', 'économiser sur les courses', 'DLC DDM'],
    date: '2026-10-07', coverAlt: 'Une poubelle barrée à côté d’un bocal de restes',
    body: `
## Combien on gaspille vraiment

D’après l’Ademe, chaque Français jette en moyenne **environ 30 kg de nourriture par an** à la maison, dont **7 kg encore emballés**. Restes de repas, fruits et légumes abîmés, pain sec, produits oubliés au fond du frigo : l’Ademe estime ce gaspillage à **environ 100 € par personne et par an**. Pour un foyer de quatre, c’est 400 € jetés chaque année.

## Les 10 gestes qui changent tout

1. **Prévoir ses repas de la semaine.** C’est le geste le plus efficace : on n’achète que ce qu’on va cuisiner.
2. **Faire une liste et s’y tenir.** Les promotions « 2 achetés, 1 offert » sur des produits frais finissent souvent à la poubelle.
3. **Regarder le placard et le frigo avant de partir.** Pour ne pas racheter ce qu’on a déjà.
4. **Ranger le frigo** : les produits qui périment le plus tôt devant, les nouveaux derrière.
5. **Distinguer DLC et DDM.** La date limite de consommation (« à consommer jusqu’au ») est une limite sanitaire. La date de durabilité minimale (« à consommer de préférence avant ») ne l’est pas : pâtes, riz, conserves restent bons après la date.
6. **Cuisiner les bonnes quantités.** Comptez par exemple 60 à 80 g de riz ou de pâtes crus par adulte.
7. **Accommoder les restes** : un fond de légumes devient une soupe, du riz cuit devient un riz sauté.
8. **Congeler** le pain, les restes de plats, les herbes fraîches.
9. **Acheter du surgelé** pour les légumes que vous utilisez petit à petit.
10. **Choisir des recettes qui partagent des ingrédients**, pour finir les paquets entamés.

| Mention | Ce qu’elle veut dire | Après la date ? |
|---|---|---|
| **À consommer jusqu’au** (DLC) | Limite sanitaire | Ne pas consommer |
| **À consommer de préférence avant** (DDM) | Le goût ou la texture peuvent changer | Encore consommable |

## Le meilleur anti-gaspi : savoir ce qu’on va manger

Le gaspillage commence au magasin. Quand on sait ce qu’on va cuisiner chaque soir et en quelle quantité, on achète juste ce qu’il faut. C’est le principe de [VégéBudget](/) : il compose vos dîners selon votre budget, déduit ce que vous avez déjà au placard et donne la liste de courses en paquets entiers.

## En vidéo

@video msWMjD7_Pjg | Comment limiter le gaspillage alimentaire ? | ConsoMag, Ademe

## Des recettes qui finissent les restes

@recettes riz-saute, soupe-petits-pois, poelee-chou, salade-lentilles

@cta Ne plus acheter (et jeter) pour rien ?
`,
    faq: [
      ['Combien de nourriture un Français jette-t-il par an ?', 'Environ 30 kg par an à la maison selon l’Ademe, dont 7 kg de produits encore emballés, soit environ 100 € par personne et par an.'],
      ['Quelle est la différence entre DLC et DDM ?', 'La DLC (« à consommer jusqu’au ») est une limite sanitaire à respecter. La DDM (« à consommer de préférence avant ») indique seulement que le goût ou la texture peuvent changer après la date.'],
      ['Quel est le geste le plus efficace contre le gaspillage ?', 'Prévoir ses repas de la semaine et faire une liste de courses en conséquence.'],
    ],
    sources: [
      ['Gaspillage alimentaire : près de 250 foyers ont économisé l’équivalent de 21 400 repas (Ademe)', 'https://www.ademe.fr/presse/communique-national/gaspillage-alimentaire-pres-de-250-foyers-ont-economise-lequivalent-de-21-400-repas-en-1-an'],
      ['Comment traquer le gaspillage alimentaire ? (Ademe)', 'https://librairie.ademe.fr/dechets-economie-circulaire/5795-comment-traquer-le-gaspillage-alimentaire-.html'],
    ],
  },
];
