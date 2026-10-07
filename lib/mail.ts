import nodemailer from 'nodemailer';
import { appendFile } from 'node:fs/promises';

// Envoi des e-mails par SMTP (par exemple le serveur SMTP d'OVH : ssl0.ovh.net, port 465).
// Sans SMTP_HOST (développement), le lien est affiché dans les journaux du serveur.
export async function sendLoginEmail(to: string, link: string) {
  const subject = 'Votre lien de connexion VégéBudget';
  const text = `Bonjour,\n\nCliquez sur ce lien pour vous connecter à VégéBudget :\n${link}\n\nCe lien est valable 20 minutes et ne fonctionne qu'une fois. Si vous n'avez rien demandé, ignorez cet e-mail.\n\nVégéBudget`;
  const html = `<p>Bonjour,</p><p>Cliquez sur ce bouton pour vous connecter à VégéBudget :</p><p><a href="${link}" style="display:inline-block;background:#174c38;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Me connecter</a></p><p style="color:#666;font-size:13px">Ce lien est valable 20 minutes et ne fonctionne qu'une fois. Si vous n'avez rien demandé, ignorez cet e-mail.</p>`;
  // Tests automatiques uniquement : les e-mails sont écrits dans un fichier au lieu d'être envoyés.
  if (process.env.MAIL_OUTBOX) { await appendFile(process.env.MAIL_OUTBOX, JSON.stringify({ to, link }) + '\n'); return; }
  if (!process.env.SMTP_HOST) {
    if (process.env.NODE_ENV === 'production') throw new Error('SMTP_HOST manquant : impossible d’envoyer le lien de connexion.');
    console.info(`[VégéBudget] Lien de connexion pour ${to} : ${link}`);
    return;
  }
  const port = Number(process.env.SMTP_PORT || 465);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
  });
  await transport.sendMail({ from: process.env.EMAIL_FROM || process.env.SMTP_USER, to, subject, text, html });
}
