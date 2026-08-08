# PNDFE - image unique servant a la fois l'API (NestJS) et le frontend
# (build statique React), pour minimiser le nombre de services necessaires
# chez un hebergeur limitant les ressources gratuites (ex: Render).
#
# Contexte de build : la RACINE du depot (pas backend/ ni frontend/), car ce
# Dockerfile a besoin des deux dossiers. Voir render.yaml.
#
# NB: n'a pas pu etre teste localement (Docker Desktop indisponible sur la
# machine de developpement - virtualisation materielle desactivee).

# --- Frontend ---
FROM node:20-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
# URL vide = appels API en chemin relatif (meme origine que le frontend,
# puisque les deux sont servis par le meme service). Evite tout probleme de
# CORS et le probleme d'oeuf-et-poule des URLs a synchroniser entre 2 services.
ENV VITE_API_URL=""
RUN npm run build

# --- Backend ---
FROM node:20-slim AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npx prisma generate
RUN npm run build

# --- Runtime ---
FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=backend-build /app/backend/node_modules ./node_modules
COPY --from=backend-build /app/backend/dist ./dist
COPY --from=backend-build /app/backend/prisma ./prisma
COPY --from=backend-build /app/backend/package.json ./package.json
COPY --from=frontend-build /app/frontend/dist ./public

# Fichiers uploades/generes (photos, pieces d'identite, PDF) : ephemere sur
# le tier gratuit Render (pas de disque persistant disponible) - voir
# RAPPORT_SECURITE.md.
ENV UPLOADS_DIR=uploads
ENV FRONTEND_DIST_DIR=public
RUN mkdir -p uploads

EXPOSE 4300

# Applique les migrations en attente puis demarre le serveur (API + frontend
# statique sur le meme port). Idempotent : sans danger a re-executer a
# chaque redeploiement.
CMD ["npm", "run", "start:prod"]
