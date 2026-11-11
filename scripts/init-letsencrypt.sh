#!/usr/bin/env bash
# Obtient le certificat HTTPS Let's Encrypt pour tous les domaines (a lancer UNE fois,
# sur le serveur, apres avoir configure le DNS et le fichier .env).
#
#   ./scripts/init-letsencrypt.sh            # certificat reel
#   ./scripts/init-letsencrypt.sh --staging  # test (certificat non reconnu, sans limite de quota)
#
# Le renouvellement est ensuite automatique (service "certbot" du docker-compose).
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "Fichier .env introuvable : copiez .env.example en .env et completez-le." >&2
  exit 1
fi

# Lit une variable du .env sans l'executer comme du shell
env_get() {
  grep -E "^$1=" .env | tail -n 1 | cut -d= -f2- | sed -e 's/^["'\'']//' -e 's/["'\'']$//'
}

SITE_DOMAIN="$(env_get SITE_DOMAIN)"
APP_DOMAIN="$(env_get APP_DOMAIN)"
API_DOMAIN="$(env_get API_DOMAIN)"
LETSENCRYPT_EMAIL="$(env_get LETSENCRYPT_EMAIL)"

for var in SITE_DOMAIN APP_DOMAIN API_DOMAIN LETSENCRYPT_EMAIL; do
  if [ -z "${!var}" ]; then
    echo "La variable $var doit etre definie dans .env" >&2
    exit 1
  fi
done

STAGING_ARG=""
if [ "${1:-}" = "--staging" ]; then
  STAGING_ARG="--staging"
  echo ">>> Mode test (staging) : le certificat ne sera pas reconnu par les navigateurs"
fi

COMPOSE="docker compose --profile prod"

echo ">>> Demarrage de nginx (avec un certificat temporaire auto-signe)"
$COMPOSE up -d --build nginx

echo ">>> Suppression du certificat temporaire"
$COMPOSE run --rm --entrypoint sh certbot -c \
  "rm -rf /etc/letsencrypt/live/site /etc/letsencrypt/archive/site /etc/letsencrypt/renewal/site.conf"

echo ">>> Demande du certificat pour : $SITE_DOMAIN, www.$SITE_DOMAIN, $APP_DOMAIN, $API_DOMAIN"
$COMPOSE run --rm --entrypoint certbot certbot certonly \
  --webroot -w /var/www/certbot \
  --cert-name site \
  -d "$SITE_DOMAIN" -d "www.$SITE_DOMAIN" -d "$APP_DOMAIN" -d "$API_DOMAIN" \
  --email "$LETSENCRYPT_EMAIL" \
  --agree-tos --no-eff-email --non-interactive \
  $STAGING_ARG

echo ">>> Rechargement de nginx avec le nouveau certificat"
$COMPOSE exec nginx nginx -s reload

echo ">>> Demarrage du renouvellement automatique"
$COMPOSE up -d certbot

echo
echo "Termine :"
echo "  https://$SITE_DOMAIN"
echo "  https://$APP_DOMAIN"
echo "  https://$API_DOMAIN"
