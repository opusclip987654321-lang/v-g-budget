// Créateurs à qui proposer un « duo » (concept 3 du document « 7 concepts pour se faire connaître sans payer »,
// choisi par Walid le 21/10/2026). Repérés par Claude dans des articles publics ; Walid vérifie le profil avant
// d'écrire. On ajoute à la fin ; on ne change jamais `compte` (il sert d'identifiant et de lien perso).
// site : adresse publique où le site cherche une adresse mail de contact (lib/prospection.ts).
export type Createur = { compte: string; prenom?: string; accroche: string; instagram?: boolean; site?: string };

export const createurs: Createur[] = [
  { compte: 'batchcooking.en.famille', prenom: 'Anne', accroche: 'Vos menus de la semaine en batch cooking, c’est exactement l’esprit.' },
  { compte: '1repas1euro', accroche: 'Votre idée d’un repas à 1 € colle parfaitement à ce qu’on fait.' },
  { compte: 'cuisineestudiantine', accroche: 'Vos recettes végé rapides parlent à notre public étudiant.' },
  { compte: 'wilzer.foodz', prenom: 'Wilzer', accroche: 'Vos recettes faciles et pas chères pour étudiants vont dans le même sens.' },
  { compte: 'chef_n_zem', prenom: 'Nabil', accroche: 'Votre cuisine anti-gaspi « de la flemme » parle à nos abonnés.' },
  { compte: 'lovely.veggie', accroche: 'Vos repas végé équilibrés et jamais tristes vont dans le même sens.' },
  { compte: 'carolinerecipes', prenom: 'Caroline', accroche: 'Votre cuisine végétarienne maison est exactement notre univers.' },
  { compte: 'soleymelo', prenom: 'Mélody', accroche: 'Votre vidéo 14 repas pour 30 € chez Lidl, c’est exactement le sujet.' },
  { compte: 'cuisine_etudiant_officiel', accroche: 'Vos recettes faciles et économiques visent le même public.', site: 'https://www.cuisine-etudiant.fr' },
  { compte: 'cuisineaddict', prenom: 'Sandra', accroche: 'Vos recettes de saison petit budget en batch cooking sont notre univers.' },
  { compte: 'lapetiteokara', prenom: 'Marion', accroche: 'Vos astuces pour manger vegan et pas cher vont dans le même sens.', site: 'https://lapetiteokara.fr' },
  { compte: 'marielaforet', prenom: 'Marie', accroche: 'Votre livre Cuisine vegan petit budget nous a inspirés.', site: 'https://www.100-vegetal.com' },
  { compte: 'copinesdebonsplans', accroche: 'Vos plats végétariens économiques de la semaine parlent au même public.', site: 'https://copinesdebonsplans.fr' },
  { compte: 'healthyalie', accroche: 'Vos plats végés pensés pour les petits budgets sont exactement notre sujet.' },
  { compte: 'rorocuistot', accroche: 'Vos repas de la semaine pas chers préparés en une heure vont dans le même sens.' },
  { compte: 'leculdepoule', accroche: 'Votre meal prep vegan à moins de 20 € pour 2 est exactement notre sujet.', instagram: false, site: 'https://leculdepoule.co' },
  { compte: 'lefrugalisme', accroche: 'Votre méthode de batch cooking petit budget va dans le même sens.', instagram: false, site: 'https://www.lefrugalisme.com' },
  { compte: 'meslistesdecourses', prenom: 'Camille', accroche: 'Votre méthode pour des courses organisées et moins chères parle au même public.', instagram: false, site: 'https://meslistesdecourses.fr' },
];

export const lienPerso = (c: Createur) => `vegebudget.fr/?utm_source=duo-${c.compte.replace(/[^a-z0-9]/gi, '')}`;

export const messageDuo = (c: Createur) => `Bonjour${c.prenom ? ` ${c.prenom}` : ''} ! Je m'occupe de VégéBudget (vegebudget.fr) : des menus végétariens de la semaine, avec la liste de courses et son prix réel, dès 0,50 € la part. ${c.accroche}

Je vous propose un duo sans rien à préparer : je vous fais une vidéo prête à publier, « Ma semaine de dîners pour 2 à petit prix », à poster en Collab (elle apparaît sur votre compte et sur le nôtre). En échange : Premium offert à vie, et 30 % de chaque abonnement payé venu par votre lien perso ${lienPerso(c)}.

Ça vous tente ? Je vous envoie un exemple de vidéo.`;
