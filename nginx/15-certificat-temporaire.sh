#!/bin/sh
# Execute automatiquement par l'image nginx avant le demarrage du serveur.
set -eu

for var in SITE_DOMAIN APP_DOMAIN API_DOMAIN; do
  eval "val=\${$var:-}"
  if [ -z "$val" ]; then
    echo "ERREUR : la variable $var doit etre definie dans le fichier .env" >&2
    exit 1
  fi
done

CERT_DIR=/etc/letsencrypt/live/site

# Nginx refuse de demarrer si le certificat reference n'existe pas. Au tout premier
# lancement (avant scripts/init-letsencrypt.sh), on cree donc un certificat auto-signe
# temporaire, remplace ensuite par le vrai certificat Let's Encrypt.
if [ ! -f "$CERT_DIR/fullchain.pem" ]; then
  echo "Aucun certificat trouve : generation d'un certificat temporaire auto-signe"
  mkdir -p "$CERT_DIR"
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout "$CERT_DIR/privkey.pem" \
    -out "$CERT_DIR/fullchain.pem" \
    -subj "/CN=localhost" 2>/dev/null
fi

# Rechargement periodique pour prendre en compte les certificats renouveles par certbot.
(while :; do sleep 6h; nginx -s reload; done) &
