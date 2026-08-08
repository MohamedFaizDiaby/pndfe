# PNDFE — Plateforme Numerique de l'Emploi Formel

MVP des **Etapes 1 a 4** du cahier des charges PNDFE (Ministere de l'Emploi
et de la Protection Sociale, Cote d'Ivoire) : **identite numerique**,
**contrats de travail electroniques**, **paiement des salaires et bulletins
de paie**, **securite et solidite** de la plateforme, et une fonctionnalite de
**mise en relation** entre travailleurs et offres d'emploi (au-dela du cahier
des charges initial).

## Ce qui est implemente

### Etape 1 — Identite numerique

- Inscription travailleur (profil, photo, piece d'identite) + generation d'une
  carte professionnelle avec **QR Code** unique et scannable.
- Inscription agence d'emploi (documents justificatifs) + **demande d'agrement**.
- Validation/rejet des agrements par le **Ministere** (tableau de bord admin).
- Verification publique d'identite par scan de QR Code (camera ou saisie
  manuelle) — utilisable par une agence ou un employeur.
- Tableau de bord de pilotage (nombre de travailleurs par secteur).
- Authentification par role (TRAVAILLEUR / AGENCE / ADMIN) avec JWT.

### Etape 2 — Contrats et protection sociale

- Creation de contrat de travail par une agence agreee (scan/saisie du QR du
  travailleur, poste, secteur, salaire, dates, lieu de travail).
- Signature electronique simplifiee par le travailleur (nom saisi + acceptation
  explicite des conditions) depuis son tableau de bord.
- Generation automatique du **PDF du contrat signe**, telechargeable.
- **Declaration CNPS/CMU automatique** a la signature (numeros generes,
  visibles par le Ministere).
- Suivi des contrats (en attente / signe / refuse) cote agence et travailleur.
- Tableau de bord Ministere enrichi : contrats signes, declarations CNPS/CMU.

### Etape 3 — Paiement des salaires et portefeuille social

- Versement du salaire par une agence, sur un contrat signe, pour une periode
  donnee (mois), via **Orange Money ou MTN MoMo** (voir limite assumee ci-dessous).
- Calcul automatique : salaire brut, cotisation CNPS (retraite, 6.3%),
  cotisation CMU (forfait), net verse.
- **Bulletin de paie PDF conforme**, genere a chaque paiement et telechargeable.
- **Portefeuille social du travailleur** : droits CNPS/CMU cumules, total net
  percu, historique des missions (contrats).
- Tableau de bord Ministere enrichi : nombre de paiements, total des
  cotisations CNPS/CMU collectees.

### Mise en relation — Offres d'emploi (hors cahier des charges initial)

- Une agence agreee **publie une offre** (titre, secteur, description, lieu,
  salaire, nombre de postes).
- Les offres ouvertes sont **consultables publiquement**, filtrables par secteur.
- Un travailleur **postule** (avec un message optionnel) depuis son compte.
- L'agence consulte les candidatures recues et peut **accepter** (ce qui cree
  automatiquement un contrat pre-rempli avec les termes de l'offre, envoye
  pour signature) ou **rejeter** une candidature.
- Le travailleur suit le statut de ses candidatures (en attente / acceptee /
  rejetee) et retrouve le contrat genere en cas d'acceptation.

Cette fonctionnalite se rapproche du module optionnel "Recommandation
automatique de profils" evoque dans le cahier des charges (prevu en extension
a 12 mois), mais implemente ici une mise en relation manuelle bidirectionnelle
(offre publique + candidature) plutot qu'une recommandation automatique par IA.

### Etape 4 — Securite et solidite

- **Journal d'audit** : tracabilite de toutes les actions sensibles
  (connexions, contrats, paiements, agrements, candidatures), consultable par
  le Ministere.
- **Limitation de debit** (rate limiting) globale et renforcee sur
  `/auth/*`, verifiee par un test reel (voir rapport).
- **Endpoint de sante** (`GET /health`) pour la supervision.
- **Revue de securite du code** avec corrections appliquees (CORS, validation
  des fichiers uploades) — voir le detail complet dans
  [`RAPPORT_SECURITE.md`](./RAPPORT_SECURITE.md).
- **Test de charge** reel (1000 requetes concurrentes) et verification du
  rate limiting, resultats documentes dans le meme rapport.

> Le cahier des charges prevoit un audit par des experts independants et une
> surveillance 24h/24 : hors de portee de cet environnement de developpement.
> Le rapport clarifie explicitement ce qui a ete reellement teste par rapport
> a ce qui resterait a valider par un tiers avant mise en production.

Les autres modules optionnels du cahier des charges (recommandation de profils,
detection de fraude, biometrie, USSD, formation en ligne, cartographie) ne sont
pas couverts par cette version (prevus en extension a 12 mois dans le document
original).

> **Limites assumees** :
> - La **signature electronique** (Etape 2) est une signature simple (nom saisi
>   + consentement horodate), suffisante pour une demonstration fonctionnelle.
>   Une mise en production s'appuierait sur un prestataire de signature
>   electronique agree (ex. DocuSign, Yousign) pour la valeur probatoire
>   renforcee mentionnee dans le cahier des charges.
> - Le **paiement Mobile Money** (Etape 3) est **simule** : la plateforme
>   calcule les montants, genere une reference de transaction et le bulletin de
>   paie, mais n'effectue aucun transfert d'argent reel. Une mise en production
>   s'integrerait aux API officielles d'Orange Money et MTN MoMo (avec gestion
>   asynchrone des callbacks de confirmation).

## Stack technique

- **Backend** : NestJS + TypeScript, Prisma ORM, **PostgreSQL** (local via
  Docker Compose, managee en production - voir `DEPLOIEMENT.md`). Le projet a
  d'abord ete developpe sous SQLite (aucun serveur a installer) avant d'etre
  migre vers PostgreSQL pour permettre un deploiement cloud reel.
- **Frontend** : React + TypeScript, bundle via esbuild (voir note ci-dessous),
  routage par hash (`react-router-dom` en mode `HashRouter`).
- Authentification JWT, upload de fichiers (`backend/uploads`, a monter en
  disque persistant en production), QR codes generes avec la librairie
  `qrcode`, scan via `html5-qrcode`.
- `Dockerfile` pour le backend et le frontend, `render.yaml` (blueprint de
  deploiement Render en un clic).

### Pourquoi esbuild plutot que Vite ?

Sur cette machine, une politique de controle d'application Windows bloque le
chargement du module natif de Rollup (`@rollup/rollup-win32-x64-msvc.node`),
dont Vite depend. Le frontend utilise donc directement l'API esbuild
(`frontend/scripts/dev.mjs` et `build.mjs`), qui s'appuie sur un executable
autonome et n'est pas concerne par ce blocage. Sur une machine sans cette
restriction, une migration vers Vite est possible sans changer le code source
de l'application (seuls les scripts de build changeraient).

## Prerequis

- Node.js 18+ (ce projet a ete developpe et teste avec Node 24 portable, car
  l'installeur MSI officiel necessite des droits administrateur).
- Docker (pour PostgreSQL local via Docker Compose). Non teste dans
  l'environnement de developpement d'origine (virtualisation desactivee sur
  cette machine) mais requis pour la plupart des configurations standard.

## Demarrage

### Backend

```bash
cd backend
docker compose up -d          # PostgreSQL local (voir docker-compose.yml)
npm install
cp .env.example .env
npx prisma migrate dev         # applique les migrations existantes
npm run start:dev              # http://localhost:4300
ADMIN_EMAIL="ministere@pndfe.ci" npx prisma db seed   # cree le compte admin
```

Le mot de passe du compte admin est genere aleatoirement et affiche une
seule fois dans la console (ou definissable via `ADMIN_PASSWORD`, voir
`DEPLOIEMENT.md`).

### Frontend

```bash
cd frontend
npm install
npm run dev    # http://localhost:5190
```

## Deploiement cloud

Voir [`DEPLOIEMENT.md`](./DEPLOIEMENT.md) pour le guide pas-a-pas complet
(Render recommande, `render.yaml` fourni ; alternative Docker generique pour
Railway/Fly.io).

## Structure du projet

```
pndfe/
  render.yaml         blueprint de deploiement Render
  DEPLOIEMENT.md       guide de deploiement cloud pas-a-pas
  RAPPORT_SECURITE.md  audit de securite et resultats des tests de charge
  backend/     API NestJS (auth, travailleurs, agences, contrats, paiements, offres, admin)
    Dockerfile
    docker-compose.yml PostgreSQL local
    prisma/    schema.prisma, migrations, seed
    src/
  frontend/    Application web React (mobile-first)
    Dockerfile
    src/
      pages/
      components/
      auth/
      api/
```

## Notes de securite (avant toute mise en production)

Voir [`RAPPORT_SECURITE.md`](./RAPPORT_SECURITE.md) pour le detail complet
(revue de code, corrections appliquees, resultats des tests de charge). En
resume, avant toute mise en production :

- Definir `ADMIN_PASSWORD` (ou noter le mot de passe genere aleatoirement) et
  le changer regulierement — aucune fonctionnalite de changement de mot de
  passe en libre-service n'existe encore dans l'application.
- `JWT_SECRET` : genere automatiquement sur Render (`generateValue: true`) ;
  sur une autre plateforme, definir une valeur forte et unique.
- Stocker les fichiers uploades (photos, pieces d'identite) sur un stockage
  objet chiffre (ex: S3) plutot que sur disque, meme persistant.
- Faire realiser un audit de securite independant (pentest) avant ouverture
  au public.
- `FRONTEND_URL` doit correspondre a l'URL publique reelle du frontend (le
  CORS y est restreint) — voir `DEPLOIEMENT.md` etape 4.
