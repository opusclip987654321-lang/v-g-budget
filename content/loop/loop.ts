// La loop de VégéBudget (choix de louis du 19/10/2026) : une boucle fermée qui vise des abonnés
// payants. Chaque semaine, la revue (content/loop/CONSIGNES.md) lit les chiffres et les avis des
// visiteurs dans le cerveau, décide seule, modifie le site et écrit ici ce qu'elle a changé et pourquoi.
// Les chiffres sont comparés par version : changer quelque chose = nouvelle version, nouvelle date.
export type Question = { id: string; moment: 'menus' | 'offre'; question: string; choix: string[]; texteLibre: boolean };
export type Entree = { version: number; date: string; changements: string[]; pourquoi: string; mesure: string };

export const loop = {
  version: 1,
  depuis: '2026-10-19',
  essai: 'Point de départ : page d’accueil, appli et offre telles qu’elles sont le 19/10 ; on demande aux visiteurs ce qu’ils cherchent et ce qui les retient de payer.',
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
  ] as Entree[],
};
