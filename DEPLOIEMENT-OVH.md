# Déployer VégéBudget sur un VPS OVH

Ce guide installe le site sur un VPS OVH sous Ubuntu 24.04, avec Node.js 22, la base SQLite et les photos sur le disque du serveur, Nginx devant et un certificat HTTPS gratuit. Comptez une heure la première fois.

## Ce qu'il faut avant de commencer

- Un VPS OVH (la plus petite offre suffit pour démarrer) avec Ubuntu 24.04.
- Un nom de domaine, par exemple `mon-domaine.fr` (chez OVH ou ailleurs).
- Une adresse e-mail sur ce domaine pour envoyer les liens de connexion, par exemple `bonjour@mon-domaine.fr` (offre e-mail OVH, souvent incluse avec le domaine).
- Un accès SSH au VPS (OVH envoie l'adresse IP et l'utilisateur par e-mail).

Dans tout le guide, remplacez `mon-domaine.fr` par votre domaine.

## 1. Faire pointer le domaine vers le VPS

Dans l'espace client OVH, ouvrez **Noms de domaine > mon-domaine.fr > Zone DNS** et créez ou modifiez :

| Type | Sous-domaine | Cible |
| --- | --- | --- |
| A | (vide) | adresse IP du VPS |
| A | www | adresse IP du VPS |

La prise en compte peut prendre jusqu'à quelques heures.

## 2. Préparer le serveur

Connectez-vous en SSH (`ssh ubuntu@IP_DU_VPS`), puis :

```sh
sudo apt update && sudo apt upgrade -y
sudo apt install -y git nginx certbot python3-certbot-nginx sqlite3 ufw
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo corepack enable
echo 'export COREPACK_ENABLE_DOWNLOAD_PROMPT=0' | sudo tee /etc/profile.d/corepack.sh
node --version   # doit afficher v22.13 ou plus récent

sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw --force enable

sudo useradd --system --create-home --home-dir /opt/vegebudget --shell /usr/sbin/nologin vegebudget
sudo mkdir -p /var/lib/vegebudget && sudo chown vegebudget:vegebudget /var/lib/vegebudget
```

## 3. Récupérer et construire le site

Le dépôt est privé : créez sur GitHub un jeton d'accès en lecture seule (**Settings > Developer settings > Fine-grained tokens**, accès « Contents: Read-only » au dépôt `v-g-budget`), puis :

```sh
sudo -u vegebudget git clone https://<VOTRE_JETON>@github.com/opusclip987654321-lang/v-g-budget.git /opt/vegebudget/app
cd /opt/vegebudget/app
sudo -u vegebudget COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm install --frozen-lockfile
sudo -u vegebudget COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm build
```

## 4. Renseigner la configuration

```sh
sudo cp /opt/vegebudget/app/.env.example /etc/vegebudget.env
sudo chmod 600 /etc/vegebudget.env
openssl rand -base64 48      # copiez le résultat dans AUTH_SECRET
sudo nano /etc/vegebudget.env
```

À remplir au minimum : `SITE_ORIGIN` (`https://www.mon-domaine.fr`), `AUTH_SECRET`, `OWNER_EMAIL` (votre adresse, pour l'espace de gestion), `SMTP_USER`, `SMTP_PASSWORD` et `EMAIL_FROM`. Avec un e-mail OVH, le serveur SMTP est `ssl0.ovh.net`, port `465`. Laissez `BILLING_ENABLED=false` pour l'instant.

## 5. Lancer le site en service

Créez `/etc/systemd/system/vegebudget.service` :

```ini
[Unit]
Description=VégéBudget
After=network.target

[Service]
User=vegebudget
WorkingDirectory=/opt/vegebudget/app
EnvironmentFile=/etc/vegebudget.env
Environment=NODE_ENV=production
ExecStart=/usr/bin/node --disable-warning=ExperimentalWarning node_modules/next/dist/bin/next start -p 3000 -H 127.0.0.1
Restart=always

[Install]
WantedBy=multi-user.target
```

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now vegebudget
sudo systemctl status vegebudget     # doit indiquer « active (running) »
curl -I http://127.0.0.1:3000        # doit répondre 200
```

## 6. Nginx et HTTPS

Créez `/etc/nginx/sites-available/vegebudget` :

```nginx
server {
    listen 80;
    server_name mon-domaine.fr www.mon-domaine.fr;
    client_max_body_size 5m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```sh
sudo ln -s /etc/nginx/sites-available/vegebudget /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d mon-domaine.fr -d www.mon-domaine.fr
```

Ouvrez `https://www.mon-domaine.fr`, cliquez sur **Me connecter**, saisissez votre adresse : le lien doit arriver dans votre boîte.

## 7. Que les e-mails n'arrivent pas en indésirables

Dans la zone DNS OVH, vérifiez que l'enregistrement SPF du domaine inclut OVH (`v=spf1 include:mx.ovh.com ~all`) et activez DKIM pour l'adresse d'envoi (**Emails > mon-domaine.fr > DKIM**). Testez avec une adresse Gmail.

## 8. Sauvegardes

Tout ce qui compte est dans `/var/lib/vegebudget` (base `vegebudget.sqlite` et dossier `uploads`). Sauvegarde quotidienne à 3 h :

```sh
sudo mkdir -p /var/backups/vegebudget
sudo crontab -e
# ajouter la ligne :
0 3 * * * sqlite3 /var/lib/vegebudget/vegebudget.sqlite ".backup /var/backups/vegebudget/base-$(date +\%F).sqlite" && tar -czf /var/backups/vegebudget/photos-$(date +\%F).tar.gz -C /var/lib/vegebudget uploads && find /var/backups/vegebudget -mtime +14 -delete
```

Copiez régulièrement ces fichiers hors du VPS (option « Backup automatique » d'OVH ou téléchargement manuel).

## 9. Mettre le site à jour

Après chaque modification fusionnée sur GitHub :

```sh
cd /opt/vegebudget/app
sudo -u vegebudget git pull
sudo -u vegebudget COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm install --frozen-lockfile
sudo -u vegebudget COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm build
sudo systemctl restart vegebudget
```

Les nouvelles tables de la base sont créées automatiquement au démarrage.

## 10. Plus tard : activer les paiements

1. Dans Stripe, créez un prix mensuel récurrent de 4,99 € et notez son identifiant.
2. Créez un webhook vers `https://www.mon-domaine.fr/api/billing/webhook` pour `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid` et `invoice.payment_failed`.
3. Renseignez `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID` et `STRIPE_WEBHOOK_SECRET`, testez en mode test, puis passez `BILLING_ENABLED=true` et redémarrez (`sudo systemctl restart vegebudget`).
4. Complétez les informations de l'éditeur dans **Gestion du service > Ouverture**.

## En cas de problème

- Journaux du site : `sudo journalctl -u vegebudget -n 100`
- Le lien de connexion n'arrive pas : vérifiez `SMTP_USER` et `SMTP_PASSWORD`, puis les journaux.
- Erreur « AUTH_SECRET doit contenir au moins 32 caractères » : régénérez-le avec `openssl rand -base64 48`.

Les comptes créés sur l'ancienne version hébergée par ChatGPT ne sont pas repris : chacun se reconnecte avec son adresse e-mail et repart d'un compte neuf.
