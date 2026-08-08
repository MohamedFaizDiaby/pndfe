# Guide de déploiement cloud — PNDFE

Ce guide vous fait passer de "ça tourne sur ma machine" à "accessible en ligne
via une URL publique". Je ne peux pas créer de compte cloud ni déployer à
votre place (aucun identifiant configuré dans cet environnement) : ce
document liste les étapes que **vous** devez exécuter, dans l'ordre.

Plateforme recommandée : **[Render](https://render.com)** — gratuit pour
démarrer, pas de carte bancaire requise pour les services gratuits,
PostgreSQL managé inclus.

**Architecture** : un seul service web sert à la fois l'API et le frontend
(le build React est copié dans l'image Docker au moment du build). Ce choix
n'est pas la configuration la plus "propre" dans l'absolu (2 services
séparés serait plus classique), mais certains comptes Render limitent le
nombre de ressources gratuites simultanées — un compte tout neuf a atteint
cette limite avec 2 services web + 1 base. Un seul service + 1 base passe
sous ce plafond.

> ⚠️ **Non testé avec `docker build`** : Docker Desktop est indisponible sur
> la machine de développement d'origine (virtualisation matérielle
> désactivée). En revanche, la logique de build a été vérifiée localement
> sans Docker (build du frontend avec URL d'API relative, inspection du
> bundle généré) — un bug réel a d'ailleurs été détecté et corrigé de cette
> façon avant le déploiement. Le premier déploiement Render reste le premier
> test du Dockerfile lui-même.

## 1. Mettre le code sur GitHub

```bash
cd "chemin/vers/pndfe"
git remote add origin https://github.com/<votre-compte>/pndfe.git
git push -u origin master
```

## 2. Créer un compte Render

1. Allez sur [render.com](https://render.com) → "Get Started" → inscription
   (idéalement "Sign up with GitHub", pour connecter directement l'accès).
2. Autorisez Render à accéder à votre dépôt GitHub `pndfe` quand demandé.

## 3. Déployer via le Blueprint (`render.yaml`)

1. Dans le tableau de bord Render : **New +** → **Blueprint**.
2. Sélectionnez le dépôt `pndfe`. Render détecte automatiquement
   `render.yaml` à la racine et propose de créer :
   - une base **PostgreSQL** (`pndfe-db`)
   - un service web **`pndfe-backend`** (Docker, sert l'API et le frontend)
3. Cliquez **Apply**. Le premier déploiement prend quelques minutes (build
   Docker du frontend puis du backend).

> Si vous avez suivi une version précédente de ce guide et avez déjà 3
> ressources créées (2 services + 1 base) : supprimez le service
> `pndfe-frontend` (Settings → Delete Service tout en bas de la page) avant
> de relancer le Blueprint, pour repasser sous la limite de ressources
> gratuites de votre compte.

## 4. Vérifier l'URL réelle et l'ajuster si nécessaire

`render.yaml` suppose que le service obtiendra l'URL
`https://pndfe-backend.onrender.com`. Si ce nom est déjà pris, Render en
choisit un autre proche (ex. `pndfe-backend-ab12.onrender.com`).

**Une fois déployé**, ouvrez le service dans le tableau de bord Render pour
voir son URL réelle. Si elle diffère de l'hypothèse :

1. **Environment** → modifiez `PUBLIC_APP_URL` et `FRONTEND_URL` avec la
   vraie URL → **Save Changes**.
2. Comme l'URL de l'API n'est plus injectée au moment du build du frontend
   (elle est désormais relative, même origine), **aucun rebuild du frontend
   n'est nécessaire** pour ce changement — contrairement à l'architecture à
   2 services d'une version précédente de ce guide.

## 5. Créer le compte administrateur (Ministère)

Le compte admin **n'est pas créé automatiquement** au déploiement (choix
volontaire, voir `RAPPORT_SECURITE.md`). Depuis le tableau de bord Render,
sur le service `pndfe-backend` → onglet **Shell**, exécutez :

```bash
ADMIN_EMAIL="ministere@pndfe.ci" npx prisma db seed
```

Le mot de passe généré aléatoirement s'affiche **une seule fois** dans la
sortie de la commande — notez-le immédiatement. Pour définir vous-même le
mot de passe plutôt que d'en générer un aléatoire :

```bash
ADMIN_EMAIL="ministere@pndfe.ci" ADMIN_PASSWORD="votre-mot-de-passe-fort" npx prisma db seed
```

> ⚠️ Il n'existe pas encore de fonctionnalité "changer mon mot de passe"
> dans l'application — c'est une limite connue à combler avant un usage réel
> prolongé. En attendant, ré-exécutez le seed avec un nouveau
> `ADMIN_PASSWORD` (après avoir supprimé l'ancien compte en base, sinon le
> script le voit déjà présent et ne fait rien).

## 6. Vérifier que tout fonctionne

1. Ouvrez `https://<votre-service>.onrender.com/health` → doit répondre
   `{"status":"UP",...}`. Si erreur, consultez les logs du service sur
   Render (onglet **Logs**).
2. Ouvrez `https://<votre-service>.onrender.com/` dans un navigateur → la
   page d'accueil PNDFE doit s'afficher (servie par le même service).
3. Connectez-vous à l'espace Ministère avec le compte créé à l'étape 5.
4. Testez un parcours complet (inscription travailleur, inscription agence,
   approbation, contrat) pour confirmer que le backend, le frontend et la
   base de données fonctionnent ensemble correctement.

## 7. Limites du tier gratuit Render (à connaître)

- **Cold start** : un service web gratuit inactif 15 minutes se met en
  veille ; la requête suivante prend ~30-60s pour le réveiller. Sans impact
  fonctionnel, mais surprenant pour un premier accès après une pause.
- **Base de données gratuite** : expire après un délai limité (vérifiez la
  durée actuelle dans la documentation Render au moment du déploiement — elle
  a varié dans le temps). Pour un usage prolongé, passer sur un plan payant
  avant l'expiration (quelques dollars/mois).
- **Fichiers uploadés non persistants** : le plan gratuit ne supporte pas les
  disques persistants. Résultat : photos, pièces d'identité et PDF générés
  sont perdus à chaque redéploiement ou redémarrage du service. Sans impact
  sur les données en base (contrats, paiements, etc.), seulement sur les
  fichiers. Deux solutions pour un usage prolongé : passer sur un plan payant
  (~7$/mois) et ajouter un `disk:` dans `render.yaml`, ou migrer vers un
  stockage objet (S3-compatible, ex. Cloudflare R2 — gratuit jusqu'à un
  certain volume) — non fait ici pour rester sur des services 100% gratuits.
- **Nombre de ressources gratuites limité** par compte (voir l'incident
  rencontré lors du premier déploiement, résolu en passant à 1 seul service).
- Adapté à une **démonstration** ou un **pilote limité**, pas encore à une
  mise en production nationale (voir le budget d'infrastructure réel prévu
  au cahier des charges).

## 8. Alternative : déploiement à 2 services (Railway, Fly.io, ou Render sans limite de ressources)

Si votre compte n'a pas de limite de ressources gratuites, ou si vous
préférez l'architecture classique à 2 services séparés (plus simple à faire
évoluer indépendamment), les Dockerfiles dédiés `backend/Dockerfile` et
`frontend/Dockerfile` restent disponibles :

```bash
# Backend
docker build -t pndfe-backend ./backend
docker run -p 4300:4300 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  -e FRONTEND_URL="https://..." \
  -e PUBLIC_APP_URL="https://..." \
  pndfe-backend

# Frontend (l'URL du backend doit etre connue au moment du build)
docker build -t pndfe-frontend --build-arg VITE_API_URL=https://... ./frontend
docker run -p 8080:80 pndfe-frontend
```

## 9. Sécurité avant tout usage réel (rappel)

Voir `RAPPORT_SECURITE.md` pour le détail. En résumé, une fois en ligne :

- `JWT_SECRET` est généré automatiquement par Render (`generateValue: true`)
  — rien à faire, mais ne le partagez jamais.
- Changez le mot de passe admin dès la première connexion (voir limite
  notée à l'étape 5).
- Un audit de sécurité indépendant reste recommandé avant toute ouverture au
  grand public.
