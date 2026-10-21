import { createurs, messageDuo } from '@/content/prospection/createurs';

// Messages de Claude à Walid sur Telegram, envoyés une seule fois chacun par lib/telegram.ts (appel horaire de
// POST /api/diffusion). On ajoute à la fin, on ne change jamais l'id d'un message déjà envoyé.
export type Message = { id: string; texte: string };

const instagram = createurs.filter(c => c.instagram !== false).slice(0, 15);

export const messages: Message[] = [
  { id: '2026-10-21-bonjour', texte: `Bonjour Walid, c'est Claude. Le bot VégéBudget est branché : je t'écrirai ici quand j'ai besoin de toi rapidement.

Juste après ce message : 15 messages à envoyer en message privé Instagram depuis @vegbudget, un par créateur. Pour chacun : ouvre le profil (instagram.com/le_compte), vérifie qu'il publie encore et qu'il parle bien de cuisine pas chère, puis copie-colle le texte. Ajoute le prénom s'il manque. Un compte qui ne colle pas ou n'existe plus : passe au suivant.

Ensuite, coche « envoyé » pour chacun sur vegebudget.fr/prospection (et « a répondu » quand quelqu'un répond) : je suis l'avancement de là.` },
  ...instagram.map((c, i) => ({ id: `2026-10-21-duo-${c.compte}`, texte: `${i + 1}/15 · instagram.com/${c.compte}\n\n${messageDuo(c)}` })),
];
