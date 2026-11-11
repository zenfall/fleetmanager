FROM nginx:1.27-alpine

# openssl : generation d'un certificat temporaire tant que Let's Encrypt n'a pas ete obtenu
RUN apk add --no-cache openssl

# Le template est transforme au demarrage (envsubst) en /etc/nginx/conf.d/default.conf
# a partir de SITE_DOMAIN, APP_DOMAIN et API_DOMAIN.
COPY templates/ /etc/nginx/templates/
COPY snippets/ /etc/nginx/snippets/
COPY 15-certificat-temporaire.sh /docker-entrypoint.d/
RUN chmod +x /docker-entrypoint.d/15-certificat-temporaire.sh
