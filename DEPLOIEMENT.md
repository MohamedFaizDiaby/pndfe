# Guide de déploiement cloud — PNDFE

Ce guide vous fait passer de "ça tourne sur ma machine" à "accessible en ligne
via une URL publique". Je ne peux pas créer de compte cloud ni déployer à
votre place (aucun identifiant configuré dans cet environnement) : ce
document liste les étapes que **vous** devez exécuter, dans l'ordre.

Plateforme recommandée : **[Render](https://render.com)** — gratuit pour
démarrer, pas de carte bancaire requise pour les services gratuits, hébergement
statique natif pour le frontend, PostgreSQL managé inclus. Le projet reste
portable vers Railway ou Fly.io (Dockerfiles fournis) si vous préférez.

> ⚠️ **Non testé localement** : `docker build` n'a pas pu être exécuté dans cet
> environnement (Docker Desktop indisponible — virtualisation matérielle
> désactivée sur cette machine). Les Dockerfiles et `render.yaml` ont été
> écrits avec soin et suivent les pratiques standard, mais **le premier
> déploiement réel sur Render sera le premier test de bout en bout**. Suivez
> l'étape 6 (vérification) attentivement et signalez toute erreur de build —
> elle sera visible dans les logs Render et facile à corriger.

## 1. Mettre le code sur GitHub

Render se connecte à un dépôt Git. Si ce n'est pas déjà fait :

```bash
cd "chemin/vers/pndfe"
# Créez un dépôt vide sur github.com (bouton "New repository"), puis :
git remote add origin https://github.com/<votre-compte>/pndfe.git
git push -u origin master
```

## 2. Créer un compte Render

1. Allez sur [render.com](https://render.com) → "Get Started" → inscription
   (email ou GitHub).
2. Autorisez Render à accéder à votre dépôt GitHub `pndfe` quand demandé.

## 3. Déployer via le Blueprint (`render.yaml`)

1. Dans le tableau de bord Render : **New +** → **Blueprint**.
2. Sélectionnez le dépôt `pndfe`. Render détecte automatiquement
   `render.yaml` à la racine et propose de créer :
   - une base **PostgreSQL** (`pndfe-db`)
   - un service web **`pndfe-backend`** (Docker, avec disque persistant pour
     les fichiers uploadés)
   - un site statique **`pndfe-frontend`**
3. Cliquez **Apply**. Le premier déploiement prend quelques minutes (le
   backend doit être buildé via Docker).

## 4. Vérifier les URLs réelles et les ajuster si nécessaire

`render.yaml` suppose que vos services obtiendront les URLs
`https://pndfe-backend.onrender.com` et `https://pndfe-frontend.onrender.com`.
Si ces noms sont déjà pris, Render en choisit d'autres proches (ex.
`pndfe-backend-ab12.onrender.com`).

**Une fois les deux services déployés**, ouvrez chacun dans le tableau de
bord Render pour voir son URL réelle. Si elle diffère de l'hypothèse :

1. Sur `pndfe-backend` → **Environment** → modifiez `PUBLIC_APP_URL` et
   `FRONTEND_URL` avec la vraie URL du frontend → **Save Changes** (redéploie
   automatiquement).
2. Sur `pndfe-frontend` → **Environment** → modifiez `VITE_API_URL` avec la
   vraie URL du backend → **Save Changes** (redéploie et **rebuild** le
   frontend, nécessaire car cette valeur est injectée au moment du build).

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

1. Ouvrez `https://<backend>.onrender.com/health` → doit répondre
   `{"status":"UP",...}`. Si erreur, consultez les logs du service backend
   sur Render (onglet **Logs**).
2. Ouvrez l'URL du frontend dans un navigateur → la page d'accueil PNDFE doit
   s'afficher.
3. Connectez-vous à l'espace Ministère avec le compte créé à l'étape 5.
4. Testez un parcours complet (inscription travailleur, inscription agence,
   approbation, contrat) pour confirmer que le backend et la base de données
   fonctionnent ensemble correctement.

## 7. Limites du tier gratuit Render (à connaître)

- **Cold start** : un service web gratuit inactif 15 minutes se met en
  veille ; la requête suivante prend ~30-60s pour le réveiller. Sans impact
  fonctionnel, mais surprenant pour un premier accès après une pause.
- **Base de données gratuite** : expire après un délai limité (vérifiez la
  durée actuelle dans la documentation Render au moment du déploiement — elle
  a varié dans le temps). Pour un usage prolongé, passer sur un plan payant
  avant l'expiration (quelques dollars/mois).
- Adapté à une **démonstration** ou un **pilote limité**, pas encore à une
  mise en production nationale (voir le budget d'infrastructure réel prévu
  au cahier des charges).

## 8. Alternative : déploiement Docker générique (Railway, Fly.io, autre)

Les `Dockerfile` de `backend/` et `frontend/` fonctionnent sur toute
plateforme supportant Docker, indépendamment de Render :

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

Sur Railway ou Fly.io, connectez le dépôt et pointez chaque service vers le
bon `Dockerfile` (`backend/Dockerfile` et `frontend/Dockerfile`), en
provisionnant une base PostgreSQL via leur offre managée respective.

## 9. Sécurité avant tout usage réel (rappel)

Voir `RAPPORT_SECURITE.md` pour le détail. En résumé, une fois en ligne :

- `JWT_SECRET` est généré automatiquement par Render (`generateValue: true`)
  — rien à faire, mais ne le partagez jamais.
- Changez le mot de passe admin dès la première connexion (voir limite
  notée à l'étape 5).
- Un audit de sécurité indépendant reste recommandé avant toute ouverture au
  grand public.
