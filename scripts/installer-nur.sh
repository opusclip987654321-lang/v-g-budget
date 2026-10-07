#!/usr/bin/env bash
# Installe ou met à jour VégéBudget sur le VPS Nūr (Docker + Caddy de nour-v2). Relançable sans risque.
# Depuis le Mac : curl -fsSL https://raw.githubusercontent.com/opusclip987654321-lang/v-g-budget/main/scripts/installer-nur.sh | ssh ubuntu@57.131.152.36 bash
set -e
BRANCH=${BRANCH:-main}
sudo mkdir -p /opt/vegebudget && sudo chown ubuntu:ubuntu /opt/vegebudget
[ -d /opt/vegebudget/.git ] || git clone -q https://github.com/opusclip987654321-lang/v-g-budget.git /opt/vegebudget
cd /opt/vegebudget && git fetch -q origin && git checkout -q "$BRANCH" && git pull -q origin "$BRANCH"
if [ ! -f .env ]; then
  umask 077
  printf '%s\n' "SITE_ORIGIN=https://vegebudget.fr" "AUTH_SECRET=$(openssl rand -hex 32)" "CRON_SECRET=$(openssl rand -hex 24)" "CADDY_NETWORK=nour-v2_default" "SMTP_HOST=ssl0.ovh.net" "SMTP_PORT=465" "SMTP_USER=bonjour@vegebudget.fr" "SMTP_PASSWORD=" 'EMAIL_FROM="VégéBudget <bonjour@vegebudget.fr>"' "OWNER_EMAIL=" > .env
  chmod 600 .env
fi
docker compose up -d --build
for i in $(seq 1 40); do [ "$(docker inspect -f '{{.State.Health.Status}}' vegebudget)" = healthy ] && break; sleep 3; done
docker inspect -f 'vegebudget : {{.State.Health.Status}}' vegebudget
cd /home/ubuntu/nour-v2
docker exec nour-v2-caddy-1 cat /etc/caddy/Caddyfile | diff -q - infra/Caddyfile >/dev/null || { echo "Caddy ne voit pas le fichier : arrêt"; exit 1; }
cp infra/Caddyfile /home/ubuntu/Caddyfile.avant-vegebudget
git fetch -q origin main
git show origin/main:infra/Caddyfile > infra/Caddyfile
if ! docker exec nour-v2-caddy-1 caddy validate --config /etc/caddy/Caddyfile >/dev/null 2>&1; then cat /home/ubuntu/Caddyfile.avant-vegebudget > infra/Caddyfile; echo "Caddyfile invalide : remis comme avant"; exit 1; fi
docker exec nour-v2-caddy-1 caddy reload --config /etc/caddy/Caddyfile
sudo mkdir -p /var/backups/vegebudget && sudo chown ubuntu:ubuntu /var/backups/vegebudget
SECRET=$(grep '^CRON_SECRET=' /opt/vegebudget/.env | cut -d= -f2)
if ! crontab -l 2>/dev/null | grep -q vegebudget; then
  { crontab -l 2>/dev/null
    echo "0 10 * * 0 curl -fsS -X POST -H \"Authorization: Bearer $SECRET\" http://127.0.0.1:3100/api/reminders # vegebudget"
    echo "0 3 * * * docker run --rm -v vegebudget_vegebudget-data:/data:ro -v /var/backups/vegebudget:/b mirror.gcr.io/library/alpine tar czf /b/vegebudget-\$(date +\\%F).tgz -C /data . && find /var/backups/vegebudget -name '*.tgz' -mtime +14 -delete # vegebudget"
  } | crontab -
fi
echo "Terminé."
