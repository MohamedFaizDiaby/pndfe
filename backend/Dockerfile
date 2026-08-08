# PNDFE backend seul (sans le frontend). Utile si vous deployez le frontend
# comme service separe (voir frontend/Dockerfile) - par exemple sur une
# plateforme sans limite stricte de nombre de services gratuits. Le
# deploiement Render par defaut (render.yaml) utilise plutot le Dockerfile
# combine a la racine du depot (../Dockerfile), qui sert l'API et le
# frontend depuis un seul service.
#
# NB: n'a pas pu etre teste localement dans cet environnement de
# developpement (Docker Desktop indisponible - virtualisation materielle
# desactivee sur cette machine). A valider par un premier build/deploy avant
# de considerer ce Dockerfile comme definitif - voir DEPLOIEMENT.md.

FROM node:20-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# ---

FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# On garde toutes les dependances (y compris devDependencies) car la CLI
# Prisma (utilisee au demarrage pour appliquer les migrations) est une
# devDependency. Alternative plus legere possible plus tard : npm prune
# --production puis copier explicitement node_modules/.bin/prisma et
# node_modules/@prisma/engines.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./package.json

# Repertoire de stockage des fichiers uploades/generes (photos, pieces
# d'identite, PDF). Sur le tier gratuit Render (pas de disque persistant
# disponible), ce dossier est ephemere : perdu a chaque redeploiement. Pour
# un stockage durable sans plan payant, migrer vers un stockage objet
# (S3-compatible) - voir RAPPORT_SECURITE.md.
ENV UPLOADS_DIR=uploads
RUN mkdir -p uploads

EXPOSE 4300

# Applique les migrations en attente puis demarre le serveur. Idempotent :
# sans danger a re-executer a chaque redeploiement.
CMD ["npm", "run", "start:prod"]
