import nodemailer from 'nodemailer';
import { appendFile } from 'node:fs/promises';

// Envoi des e-mails par SMTP (par exemple le serveur SMTP d'OVH : ssl0.ovh.net, port 465).
// Sans SMTP_HOST (développement), l'e-mail est affiché dans les journaux du serveur.
type Mail = { to: string; subject: string; text: string; html: string; kind: string; link: string };

async function send(mail: Mail) {
  // Tests automatiques uniquement : les e-mails sont écrits dans un fichier au lieu d'être envoyés.
  if (process.env.MAIL_OUTBOX) { await appendFile(process.env.MAIL_OUTBOX, JSON.stringify({ to: mail.to, kind: mail.kind, subject: mail.subject, link: mail.link, text: mail.text }) + '\n'); return; }
  if (!process.env.SMTP_HOST) {
    if (process.env.NODE_ENV === 'production') throw new Error('SMTP_HOST manquant : impossible d’envoyer l’e-mail.');
    console.info(`[VégéBudget] E-mail « ${mail.subject} » pour ${mail.to} : ${mail.link}`);
    return;
  }
  const port = Number(process.env.SMTP_PORT || 465);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
  });
  await transport.sendMail({ from: process.env.EMAIL_FROM || process.env.SMTP_USER, to: mail.to, subject: mail.subject, text: mail.text, html: mail.html });
}

const escape = (value: string) => value.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const button = (link: string, label: string) => `<p><a href="${escape(link)}" style="display:inline-block;background:#174c38;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">${label}</a></p>`;

export async function sendLoginEmail(to: string, link: string) {
  await send({
    to, link, kind: 'login',
    subject: 'Votre lien de connexion VégéBudget',
    text: `Bonjour,\n\nCliquez sur ce lien pour vous connecter à VégéBudget :\n${link}\n\nCe lien est valable 20 minutes et ne fonctionne qu'une fois. Si vous n'avez rien demandé, ignorez cet e-mail.\n\nVégéBudget`,
    html: `<p>Bonjour,</p><p>Cliquez sur ce bouton pour vous connecter à VégéBudget :</p>${button(link, 'Me connecter')}<p style="color:#666;font-size:13px">Ce lien est valable 20 minutes et ne fonctionne qu'une fois. Si vous n'avez rien demandé, ignorez cet e-mail.</p>`,
  });
}

// Rappel hebdomadaire : la semaine prochaine est à composer, avec le bilan de la précédente.
export async function sendWeeklyReminder(to: string, data: { link: string; stopLink: string; weekLabel: string; recap: string[] }) {
  const recapText = data.recap.length ? data.recap.map(line => `- ${line}`).join('\n') + '\n\n' : '';
  const recapHtml = data.recap.length ? `<ul>${data.recap.map(line => `<li>${escape(line)}</li>`).join('')}</ul>` : '';
  await send({
    to, link: data.link, kind: 'reminder',
    subject: `Vos dîners de la semaine du ${data.weekLabel} sont à composer`,
    text: `Bonjour,\n\n${data.recap.length ? 'Votre semaine passée :\n' : ''}${recapText}En une minute, composez vos dîners de la semaine du ${data.weekLabel} et obtenez la liste de courses exacte :\n${data.link}\n\nNe plus recevoir ce rappel : ${data.stopLink}\n\nVégéBudget`,
    html: `<p>Bonjour,</p>${data.recap.length ? '<p>Votre semaine passée :</p>' : ''}${recapHtml}<p>En une minute, composez vos dîners de la semaine du ${escape(data.weekLabel)} et obtenez la liste de courses exacte.</p>${button(data.link, 'Composer ma semaine')}<p style="color:#666;font-size:13px"><a href="${escape(data.stopLink)}" style="color:#666">Ne plus recevoir ce rappel</a></p>`,
  });
}
