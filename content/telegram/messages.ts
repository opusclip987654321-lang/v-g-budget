// Messages de Claude à Walid sur Telegram, envoyés une seule fois chacun par lib/telegram.ts (appel horaire de
// POST /api/diffusion). On ajoute à la fin, on ne change jamais l'id d'un message déjà envoyé.
export type Message = { id: string; texte: string };

const duo = (prenom: string, compte: string, accroche: string) => `Bonjour ${prenom} ! Je m'occupe de VégéBudget (vegebudget.fr) : des menus végétariens de la semaine, avec la liste de courses et son prix réel, dès 0,50 € la part. ${accroche}

Je vous propose un duo sans rien à préparer : je vous fais une vidéo prête à publier, « Ma semaine de dîners pour 2 à petit prix », à poster en Collab (elle apparaît sur votre compte et sur le nôtre). En échange : Premium offert à vie, et 30 % de chaque abonnement payé venu par votre lien perso vegebudget.fr/?utm_source=duo-${compte.replace(/[^a-z0-9]/gi, '')}.

Ça vous tente ? Je vous envoie un exemple de vidéo.`;

const createurs: [string, string, string][] = [
  ['Anne', 'batchcooking.en.famille', 'Vos menus de la semaine en batch cooking, c’est exactement l’esprit.'],
  ['', '1repas1euro', 'Votre idée d’un repas à 1 € colle parfaitement à ce qu’on fait.'],
  ['', 'cuisineestudiantine', 'Vos recettes végé rapides parlent à notre public étudiant.'],
  ['Wilzer', 'wilzer.foodz', 'Vos recettes faciles et pas chères pour étudiants vont dans le même sens.'],
  ['Nabil', 'chef_n_zem', 'Votre cuisine anti-gaspi « de la flemme » parle à nos abonnés.'],
  ['', 'lovely.veggie', 'Vos repas végé équilibrés et jamais tristes vont dans le même sens.'],
  ['Caroline', 'carolinerecipes', 'Votre cuisine végétarienne maison est exactement notre univers.'],
  ['Mélody', 'soleymelo', 'Votre vidéo 14 repas pour 30 € chez Lidl, c’est exactement le sujet.'],
  ['', 'cuisine_etudiant_officiel', 'Vos recettes faciles et économiques visent le même public.'],
  ['Sandra', 'cuisineaddict', 'Vos recettes de saison petit budget en batch cooking sont notre univers.'],
  ['Marion', 'lapetiteokara', 'Vos astuces pour manger vegan et pas cher vont dans le même sens.'],
  ['Marie', 'marielaforet', 'Votre livre Cuisine vegan petit budget nous a inspirés.'],
  ['', 'copinesdebonsplans', 'Vos plats végétariens économiques de la semaine parlent au même public.'],
  ['', 'healthyalie', 'Vos plats végés pensés pour les petits budgets sont exactement notre sujet.'],
  ['', 'rorocuistot', 'Vos repas de la semaine pas chers préparés en une heure vont dans le même sens.'],
];

export const messages: Message[] = [
  { id: '2026-10-21-bonjour', texte: `Bonjour Walid, c'est Claude. Le bot VégéBudget est branché : je t'écrirai ici quand j'ai besoin de toi rapidement.

Juste après ce message : 15 messages à envoyer en message privé Instagram depuis @vegbudget, un par créateur. Pour chacun : ouvre le profil (instagram.com/le_compte), vérifie qu'il publie encore et qu'il parle bien de cuisine pas chère, puis copie-colle le texte. Ajoute le prénom s'il manque. Un compte qui ne colle pas ou n'existe plus : passe au suivant. Les réponses, je m'en occupe : tu me les transmets dans le fil VégéBudget.` },
  ...createurs.map(([prenom, compte, accroche], i) => ({
    id: `2026-10-21-duo-${compte}`,
    texte: `${i + 1}/15 · instagram.com/${compte}\n\n${duo(prenom || 'à vous', compte, accroche).replace('Bonjour à vous !', 'Bonjour !')}`,
  })),
];
