# PNDFE frontend - build statique + nginx. Utile pour Railway/Fly.io (pas de
# hebergement statique natif). Sur Render, preferer un "Static Site" natif
# (gratuit, pas besoin de Docker) - voir render.yaml et DEPLOIEMENT.md.
#
# NB: n'a pas pu etre teste localement (Docker Desktop indisponible sur cette
# machine - voir backend/Dockerfile). A valider avant un premier deploiement.

FROM node:20-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# URL publique du backend, injectee dans le bundle au moment du build
# (esbuild "define" - ne peut pas etre changee apres coup sans rebuild).
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# ---

FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
# Routage par hash (#/...) : nginx sert index.html + assets statiques sans
# configuration de fallback SPA particuliere.
EXPOSE 80
