import { messages } from '@/content/telegram/messages';
import { readSetting, writeSetting } from './server';

// Messages de Claude à Walid sur Telegram (demande de Walid du 21/10/2026 : « quand tu as besoin de réactivité de ma
// part, demande-moi sur Telegram »). Claude ajoute un message dans content/telegram/messages.ts par une pull request ;
// une fois le site à jour, l'appel horaire POST /api/diffusion l'envoie une seule fois.
// Réglage du .env : TELEGRAM_BOT_TOKEN (bot créé par Walid avec @BotFather). La conversation est celle de la première
// personne qui a écrit /start au bot, retenue ensuite (ou TELEGRAM_CHAT_ID si on veut l'imposer).

const api = async <T>(method: string, body: Record<string, unknown>) => {
  const res = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: 'POST', signal: AbortSignal.timeout(20000), headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({})) as { ok?: boolean; result?: T; description?: string };
  if (!data.ok) throw new Error(`Telegram : ${res.status} ${data.description ?? ''}`.trim());
  return data.result as T;
};

type Update = { message?: { text?: string; chat?: { id: number; type: string } } };

async function chatId() {
  if (process.env.TELEGRAM_CHAT_ID) return process.env.TELEGRAM_CHAT_ID;
  const saved = await readSetting<string | null>('telegram_chat', null);
  if (saved) return saved;
  const updates = await api<Update[]>('getUpdates', { allowed_updates: ['message'] });
  const start = updates.find(u => u.message?.chat?.type === 'private' && u.message.text?.startsWith('/start'));
  if (!start) return null;
  const id = String(start.message!.chat!.id);
  await writeSetting('telegram_chat', id);
  return id;
}

export const envoyes = () => readSetting<Record<string, string>>('telegram_envoyes', {});

// Envoie les messages pas encore partis (au plus 5 par appel). Telegram limite un message à 4096 caractères.
// La dernière erreur est gardée pour le bilan public (aide au diagnostic : webhook déjà posé sur le bot, mauvaise clé…).
export async function envoyerTelegram() {
  if (!process.env.TELEGRAM_BOT_TOKEN) return { rien: 'TELEGRAM_BOT_TOKEN n’est pas configuré.' };
  try {
    const out = await envoyer();
    await writeSetting('telegram_erreur', 'rien' in out && out.rien !== 'Aucun message à envoyer.' ? { at: new Date().toISOString(), message: out.rien } : null);
    return out;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await writeSetting('telegram_erreur', { at: new Date().toISOString(), message });
    throw e;
  }
}

async function envoyer() {
  const done = await envoyes();
  const todo = messages.filter(m => !done[m.id]).slice(0, 5);
  if (!todo.length) return { rien: 'Aucun message à envoyer.' };
  const chat = await chatId();
  if (!chat) return { rien: 'Personne n’a encore écrit /start au bot.' };
  const sent: string[] = [];
  for (const m of todo) {
    for (let i = 0; i < m.texte.length; i += 4000) await api('sendMessage', { chat_id: chat, text: m.texte.slice(i, i + 4000), disable_web_page_preview: true });
    done[m.id] = new Date().toISOString();
    await writeSetting('telegram_envoyes', done);
    sent.push(m.id);
  }
  return { envoyes: sent };
}

// Bilan public : rien du contenu des messages.
export async function bilanTelegram() {
  const done = await envoyes();
  return {
    configure: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    conversation: Boolean(process.env.TELEGRAM_CHAT_ID || await readSetting<string | null>('telegram_chat', null)),
    envoyes: Object.keys(done).length,
    enAttente: messages.filter(m => !done[m.id]).length,
    erreur: await readSetting<{ at: string; message: string } | null>('telegram_erreur', null),
  };
}
