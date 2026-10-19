#!/usr/bin/env bash
# Mise à jour automatique de vegebudget.fr sur le serveur Nūr (validée par louis le 15/10/2026).
# Lancée chaque heure par cron. Ne fait rien tant que la branche main n'a pas bougé sur GitHub.
# Sinon : git pull, reconstruction, vérification que le site répond, et retour à la version
# précédente s'il ne répond pas. Ne modifie jamais un fichier à la main : si le dossier contient
# des changements locaux, s'arrête et le note dans le journal.
# Installation (une seule fois) : bash /opt/vegebudget/scripts/mise-a-jour-auto.sh --installer
# Journal : ~/vegebudget-mise-a-jour.log
set -uo pipefail

# Tout est dans une fonction : bash lit le fichier en entier avant de l'exécuter,
# donc le git pull peut remplacer ce script pendant qu'il tourne sans rien casser.
main() {
  local dir=/opt/vegebudget log="$HOME/vegebudget-mise-a-jour.log" bad="$HOME/.vegebudget-version-refusee"
  note() { echo "$(date '+%F %T') $*" >> "$log"; }

  if [ "${1:-}" = "--installer" ]; then
    if crontab -l 2>/dev/null | grep -q 'mise-a-jour-auto.sh'; then echo "Déjà installé."; return 0; fi
    { crontab -l 2>/dev/null; echo "17 * * * * bash $dir/scripts/mise-a-jour-auto.sh # vegebudget mise a jour auto"; } | crontab -
    echo "Installé : le site se mettra à jour tout seul chaque heure (à h17) quand main change. Journal : $log"
    return 0
  fi

  exec 9>"$HOME/.vegebudget-mise-a-jour.lock"
  flock -n 9 || return 0
  cd "$dir" || { note "Dossier $dir introuvable."; return 1; }

  # Carrousel Instagram du jour (ajouté le 15/10/2026) : le site décide lui-même s'il publie
  # (une fois par jour, à partir de 18 h, seulement s'il y a un nouvel article et un compte connecté).
  local secret reponse
  secret=$(grep -E '^CRON_SECRET=' .env 2>/dev/null | tail -1 | cut -d= -f2- | tr -d '"'"'"' \r')
  if [ -n "$secret" ]; then
    reponse=$(curl -sS --max-time 300 -X POST -H "Authorization: Bearer $secret" http://127.0.0.1:3100/api/instagram/publier 2>&1)
    case "$reponse" in *'"publie"'*|*'"error"'*|curl:*) note "Instagram : $reponse";; esac
    # Diffusion (ajoutée le 20/10/2026, lib/diffusion.ts) : pages nouvelles signalées à Bing (IndexNow) et vidéo
    # du jour (Reel Instagram, puis TikTok, YouTube et Facebook par Post for Me quand il est configuré).
    reponse=$(curl -sS --max-time 600 -X POST -H "Authorization: Bearer $secret" http://127.0.0.1:3100/api/diffusion 2>&1)
    case "$reponse" in *'"slug"'*|*'"envoyees"'*|*'"erreur"'*|*'"error"'*|curl:*) note "Diffusion : $reponse";; esac
  fi

  if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
    note "ARRÊT : fichiers modifiés à la main sur le serveur : $(git status --porcelain --untracked-files=no | tr '\n' ' '). Rien n'est mis à jour."
    return 1
  fi
  git fetch -q origin main || { note "git fetch impossible."; return 1; }
  local old new
  old=$(git rev-parse HEAD); new=$(git rev-parse origin/main)
  [ "$old" = "$new" ] && return 0
  if [ -f "$bad" ] && [ "$(cat "$bad")" = "$new" ]; then return 0; fi

  note "Mise à jour ${old:0:7} -> ${new:0:7}"
  git merge -q --ff-only origin/main || { note "ARRÊT : impossible d'avancer main jusqu'à origin/main."; return 1; }
  if ! docker compose up -d --build >> "$log" 2>&1; then
    note "ÉCHEC de la construction : retour à ${old:0:7} (le site en ligne n'a pas changé)."
    echo "$new" > "$bad"; git reset -q --hard "$old"; return 1
  fi
  local ok=0
  for _ in $(seq 1 30); do
    if curl -fsS -o /dev/null --max-time 5 http://127.0.0.1:3100/; then ok=1; break; fi
    sleep 5
  done
  if [ "$ok" = 1 ]; then
    note "OK : site en ligne en ${new:0:7}."
    rm -f "$bad"; docker image prune -f > /dev/null 2>&1
  else
    note "ÉCHEC : le site ne répond pas en ${new:0:7}, retour à ${old:0:7}."
    echo "$new" > "$bad"; git reset -q --hard "$old"
    docker compose up -d --build >> "$log" 2>&1 && note "Version ${old:0:7} remise en ligne."
    return 1
  fi
}
main "$@"; exit $?
