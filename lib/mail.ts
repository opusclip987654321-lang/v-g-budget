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
    text: `Bonjour,\n\nCliquez sur ce lien pour vous connecter à VégéBudget :\n${link}\n\nCe lien est valable 20 minutes et ne fonctionne qu’une fois. Si vous n’avez rien demandé, ignorez cet e-mail.\n\nVégéBudget`,
    html: `<p>Bonjour,</p><p>Cliquez sur ce bouton pour vous connecter à VégéBudget :</p>${button(link, 'Me connecter')}<p style="color:#666;font-size:13px">Ce lien est valable 20 minutes et ne fonctionne qu’une fois. Si vous n’avez rien demandé, ignorez cet e-mail.</p>`,
  });
}

// Rappel hebdomadaire : la semaine prochaine est à composer, avec le bilan de la précédente.
export async function sendWeeklyReminder(to: string, data: { link: string; stopLink: string; weekLabel: string; recap: string[] }) {
  const recapText = data.recap.length ? data.recap.map(line => `- ${line}`).join('\n') + '\n\n' : '';
  const recapHtml = data.recap.length ? `<ul>${data.recap.map(line => `<li>${escape(line)}</li>`).join('')}</ul>` : '';
  await send({
    to, link: data.link, kind: 'reminder',
    subject: `Préparez vos menus de la semaine du ${data.weekLabel} avec VégéBudget`,
    text: `Bonjour,\n\n${data.recap.length ? 'Votre semaine passée :\n' : ''}${recapText}Prenez un moment pour prévoir vos dîners de la semaine du ${data.weekLabel} et vérifier ce que vous avez déjà à la maison. Vos menus et votre liste de courses vous attendent dans VégéBudget :\n${data.link}\n\nNe plus recevoir ce rappel : ${data.stopLink}\n\nVégéBudget`,
    html: `<p>Bonjour,</p>${data.recap.length ? '<p>Votre semaine passée :</p>' : ''}${recapHtml}<p>Prenez un moment pour prévoir vos dîners de la semaine du ${escape(data.weekLabel)} et vérifier ce que vous avez déjà à la maison. Vos menus et votre liste de courses vous attendent dans VégéBudget.</p>${button(data.link, 'Préparer mes menus')}<p style="color:#666;font-size:13px"><a href="${escape(data.stopLink)}" style="color:#666">Ne plus recevoir ce rappel</a></p>`,
  });
}

// Menu gratuit de la semaine (lib/menu-gratuit.ts) : d'abord la confirmation de l'adresse, puis le menu.
export async function sendMenuConfirm(to: string, link: string) {
  await send({
    to, link, kind: 'menu-confirmer',
    subject: 'Confirmez pour recevoir votre menu gratuit',
    text: `Bonjour,\n\nCliquez sur ce lien pour recevoir tout de suite le menu de la semaine (5 dîners sans viande pour 2, avec le coût), puis un nouveau chaque vendredi :\n${link}\n\nSi vous n’avez rien demandé, ignorez cet e-mail : vous ne recevrez rien.\n\nVégéBudget`,
    html: `<p>Bonjour,</p><p>Cliquez sur ce bouton pour recevoir tout de suite le menu de la semaine (5 dîners sans viande pour 2, avec le coût), puis un nouveau chaque vendredi.</p>${button(link, 'Recevoir mon menu')}<p style="color:#666;font-size:13px">Si vous n’avez rien demandé, ignorez cet e-mail : vous ne recevrez rien.</p>`,
  });
}

type FreeMenu = { weekLabel: string; dinners: { title: string; path: string; minutes: number; portion: string }[]; total: string; origin: string; appLink: string; stopLink: string; founder: string };
export async function sendFreeMenu(to: string, m: FreeMenu) {
  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const lines = m.dinners.map((d, n) => `${days[n]} : ${d.title} (${d.minutes} min, ${d.portion} la portion)`);
  await send({
    to, link: m.appLink, kind: 'menu-gratuit',
    subject: `Vos ${m.dinners.length} dîners de la semaine du ${m.weekLabel}, environ ${m.total} pour 2`,
    text: `Bonjour,\n\nVoici vos ${m.dinners.length} dîners sans viande pour 2 personnes, semaine du ${m.weekLabel} :\n\n${lines.join('\n')}\n\nCourses estimées : environ ${m.total} (paquets entiers, prix relevés sur carrefour.fr).\n\nPour la liste de courses exacte, sans racheter ce que vous avez déjà, et adapter le menu à votre budget : ${m.appLink}\n\nLa première semaine est gratuite. Ensuite, l’offre de lancement est à ${m.founder} par an.\n\nNe plus recevoir le menu : ${m.stopLink}\n\nVégéBudget`,
    html: `<p>Bonjour,</p><p>Voici vos ${m.dinners.length} dîners sans viande pour 2 personnes, semaine du ${escape(m.weekLabel)} :</p><ul>${m.dinners.map((d, n) => `<li><strong>${days[n]}</strong> : <a href="${escape(m.origin + d.path)}" style="color:#174c38">${escape(d.title)}</a> · ${d.minutes} min · ${escape(d.portion)} la portion</li>`).join('')}</ul><p>Courses estimées : <strong>environ ${escape(m.total)}</strong> (paquets entiers, prix relevés sur carrefour.fr).</p><p>Pour la liste de courses exacte, sans racheter ce que vous avez déjà, et un menu adapté à votre budget :</p>${button(m.appLink, 'Créer ma liste de courses')}<p>La première semaine est gratuite. Ensuite, l’offre de lancement est à ${escape(m.founder)} par an.</p><p style="color:#666;font-size:13px"><a href="${escape(m.stopLink)}" style="color:#666">Ne plus recevoir le menu</a></p>`,
  });
}
