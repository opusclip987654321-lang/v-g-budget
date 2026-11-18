// La loop de VégéBudget (choix de louis du 19/10/2026) : une boucle fermée qui vise des abonnés
// payants. Chaque semaine, la revue (content/loop/CONSIGNES.md) lit les chiffres et les avis des
// visiteurs dans le cerveau, décide seule, modifie le site et écrit ici ce qu'elle a changé et pourquoi.
// Les chiffres sont comparés par version : changer quelque chose = nouvelle version, nouvelle date.
export type Question = { id: string; moment: 'menus' | 'offre'; question: string; choix: string[]; texteLibre: boolean };
export type Entree = { version: number; date: string; changements: string[]; pourquoi: string; mesure: string };

export const loop = {
  version: 3,
  depuis: '2026-11-18',
  essai: 'Deux essais validés par Walid le 18/11 : titres et descriptions Google plus concrets (un chiffre ou un prix) sur les 4 articles déjà en première page, et le menu de la semaine en PDF à imprimer offert contre une adresse mail sur les pages menu. Accueil, appli et offre inchangés.',
  // Une question au plus par moment ; un visiteur ne voit chaque question qu'une fois.
  questions: [
    {
      id: 'menus-raison',
      moment: 'menus',
      question: 'Une question rapide : qu’est-ce qui vous a fait essayer VégéBudget ?',
      choix: ['Dépenser moins en courses', 'Manger moins de viande', 'Ne plus chercher quoi cuisiner', 'Faire des courses plus simples', 'Autre chose'],
      texteLibre: true,
    },
    {
      id: 'offre-frein',
      moment: 'offre',
      question: 'Qu’est-ce qui vous retient de passer à Premium ?',
      choix: ['Le prix', 'Je teste encore ma première semaine', 'Je n’en ai pas besoin chaque semaine', 'Les recettes ne me conviennent pas', 'Autre chose'],
      texteLibre: true,
    },
  ] as Question[],
  journal: [
    {
      version: 1,
      date: '2026-10-19',
      changements: ['Mise en place de la loop : version du site, deux questions courtes aux visiteurs, revue chaque lundi.'],
      pourquoi: 'Demande de louis : une loop d’apprentissage qui comprend ce que veulent les visiteurs et repositionne VégéBudget, avec le maximum de liberté.',
      mesure: 'Point de départ, chiffres du 7 au 19/10 dans le cerveau.',
    },
    {
      version: 2,
      date: '2026-11-09',
      changements: ['Nouvelles pages /menu-vegetarien-semaine pour 1, 2 et 4 personnes : 5 dîners, liste de courses chiffrée, prix par plat et par portion (calculés par le planificateur), FAQ et données structurées ; ajoutées au plan du site, à llms.txt et au pied de page.'],
      pourquoi: 'Action validée par Walid (Loop Agent, 07/11) : les requêtes « menu végétarien pas cher semaine liste de courses » sont tenues par des sites qui donnent des fourchettes ; VégéBudget peut donner le prix réel de chaque plat.',
      mesure: 'Pages indexées dans les 3 semaines (Search Console, Bing), puis visites venues de Google ou d’une IA sur ces pages.',
    },
    {
      version: 3,
      date: '2026-11-18',
      changements: [
        'Titre et description Google réécrits (avec un chiffre ou un prix) pour /blog/code-oeufs, /blog/recettes-lentilles-pas-cheres, /blog/menu-semaine-pas-cher et /blog/repas-pas-cher-pour-2 ; le texte des articles ne change pas.',
        'Menu de la semaine en PDF à imprimer (5 dîners, liste de courses à cocher avec les prix, recettes) contre une adresse mail, sur les 3 pages menu et l’article « menu semaine pas cher » ; titre de la page pour 4 avec « moins de 50 € » et « PDF » ; 3 épingles Pinterest « PDF gratuit à imprimer ».',
      ],
      pourquoi: 'Actions validées par Walid (Loop Agent, 18/11) : 16 clics Google pour 1 680 affichages en 28 jours (code-oeufs : 778 affichages, 1 clic) ; 0 adresse laissée pour le menu du vendredi ; des gens tapent « 50 euros la semaine pour 4 personnes pdf ».',
      mesure: 'Clics Google sur 28 jours (départ 16 au 18/11, cible 40) relevés 4 semaines après ; adresses laissées pour le PDF (champ pdf de /api/menu-gratuit, cible 10 en 4 semaines).',
    },
  ] as Entree[],
};
