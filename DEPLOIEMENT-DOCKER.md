# Mettre VégéBudget en ligne sur un serveur Docker + Caddy (serveur Nūr)

Ce guide sert quand le serveur fait déjà tourner Docker et Caddy pour d'autres sites, comme le VPS Nūr (`vps-59f9b67f`, IPv4 `57.131.152.36`). Pour un serveur vide, voir `DEPLOIEMENT-OVH.md`.

VégéBudget tourne dans son propre conteneur (`vegebudget`), avec un volume pour la base et les photos. Il utilise environ 200 Mo de mémoire. Caddy lui transmet les visites de `vegebudget.fr` et gère le HTTPS.

## 1. Faire pointer le domaine vers le serveur

Dans l'espace client OVH : **Web Cloud > Noms de domaine > vegebudget.fr > Zone DNS**.

- Modifiez (ou créez) l'entrée **A** du domaine nu (sous-domaine vide) : `57.131.152.36`.
- Modifiez (ou créez) l'entrée **A** de `www` : `57.131.152.36`. Si `www` est un **CNAME**, supprimez-le d'abord.
- Supprimez les entrées **AAAA** créées par OVH pour la page de parking, ou remplacez-les par `2001:41d0:701:1100::ddc2`.
- Ne touchez pas aux entrées **MX**, **SPF** et **TXT** : elles servent aux e-mails.

Comptez de quelques minutes à une heure. Vérification : `dig +short vegebudget.fr` doit répondre `57.131.152.36`.

## 2. Récupérer le code sur le serveur

```sh
sudo mkdir -p /opt/vegebudget && sudo chown "$USER" /opt/vegebudget
git clone https://github.com/opusclip987654321-lang/v-g-budget.git /opt/vegebudget
cd /opt/vegebudget
```

## 3. La configuration

Trouvez le réseau Docker de Caddy :

```sh
docker inspect nour-v2-caddy-1 --format '{{range $k, $v := .NetworkSettings.Networks}}{{$k}} {{end}}'
```

Créez `/opt/vegebudget/.env`, puis `chmod 600 .env` :

```sh
SITE_ORIGIN=https://vegebudget.fr
AUTH_SECRET=            # openssl rand -hex 32
CRON_SECRET=            # openssl rand -hex 24
CADDY_NETWORK=          # le nom affiché par la commande ci-dessus
SMTP_HOST=ssl0.ovh.net
SMTP_PORT=465
SMTP_USER=bonjour@vegebudget.fr
SMTP_PASSWORD=
EMAIL_FROM=VégéBudget <bonjour@vegebudget.fr>
OWNER_EMAIL=            # votre adresse, pour l'accès administrateur
```

`DATA_DIR`, `PORT` et `NODE_ENV` sont déjà réglés dans l'image.

## 4. Construire et lancer

```sh
docker compose up -d --build
docker compose ps        # l'état doit passer à « healthy »
curl -sI http://127.0.0.1:3100/ | head -1
```

## 5. Brancher Caddy

Ajoutez ce bloc au Caddyfile utilisé par `nour-v2-caddy-1` :

```caddy
vegebudget.fr {
	encode zstd gzip
	request_body {
		max_size 5MB
	}
	reverse_proxy vegebudget:3000
}

www.vegebudget.fr {
	redir https://vegebudget.fr{uri} permanent
}
```

Rechargez Caddy sans couper les autres sites :

```sh
docker exec nour-v2-caddy-1 caddy reload --config /etc/caddy/Caddyfile
```

Adaptez le chemin si le Caddyfile est monté ailleurs : `docker inspect nour-v2-caddy-1` montre les montages. Caddy obtient le certificat HTTPS tout seul, une fois le DNS en place.

Vérifiez ensuite `https://vegebudget.fr`, `/recettes`, `/robots.txt` et `/sitemap.xml`.

## 6. Rappel hebdomadaire

Ajoutez dans `crontab -e` (remplacez `VOTRE_CRON_SECRET`) :

```sh
0 10 * * 0 curl -fsS -X POST -H "Authorization: Bearer VOTRE_CRON_SECRET" http://127.0.0.1:3100/api/reminders
```

## 7. Sauvegardes

La base et les photos sont dans le volume `vegebudget_vegebudget-data`. Une sauvegarde chaque nuit à 3 h, avec 14 jours d'historique :

```sh
sudo mkdir -p /var/backups/vegebudget
# crontab -e
0 3 * * * docker run --rm -v vegebudget_vegebudget-data:/data:ro -v /var/backups/vegebudget:/b mirror.gcr.io/library/alpine tar czf /b/vegebudget-$(date +\%F).tgz -C /data . && find /var/backups/vegebudget -name '*.tgz' -mtime +14 -delete
```

## 8. Mettre à jour

```sh
cd /opt/vegebudget && git pull && docker compose up -d --build && docker image prune -f
```

## 9. Référencement

Voir `DEPLOIEMENT-OVH.md`, section « Référencement Google, Bing et assistants IA » : Search Console, sitemap et Bing.
