# PNDFE — Plateforme Numerique de l'Emploi Formel

MVP des **Etapes 1, 2 et 3** du cahier des charges PNDFE (Ministere de l'Emploi
et de la Protection Sociale, Cote d'Ivoire) : **identite numerique**,
**contrats de travail electroniques**, **paiement des salaires et bulletins
de paie**, et une fonctionnalite de **mise en relation** entre travailleurs et
offres d'emploi (au-dela du cahier des charges initial).

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

- **Backend** : NestJS + TypeScript, Prisma ORM, SQLite en developpement local
  (basculer vers PostgreSQL en production en changeant `provider` dans
  `backend/prisma/schema.prisma` et `DATABASE_URL`).
- **Frontend** : React + TypeScript, bundle via esbuild (voir note ci-dessous),
  routage par hash (`react-router-dom` en mode `HashRouter`).
- Authentification JWT, upload de fichiers local (`backend/uploads`), QR codes
  generes avec la librairie `qrcode`, scan via `html5-qrcode`.

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

## Demarrage

### Backend

```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev --name init   # cree la base SQLite + le compte admin
npm run start:dev                     # http://localhost:4190
```

Compte Ministere par defaut (cree par le seed) :
- email : `ministere@pndfe.ci`
- mot de passe : `Admin123!`

**A changer immediatement avant toute mise en production.**

### Frontend

```bash
cd frontend
npm install
npm run dev    # http://localhost:5190
```

## Structure du projet

```
pndfe/
  backend/     API NestJS (auth, travailleurs, agences, contrats, paiements, offres, admin)
    prisma/    schema.prisma, migrations, seed
    src/
  frontend/    Application web React (mobile-first)
    src/
      pages/
      components/
      auth/
      api/
```

## Notes de securite (avant toute mise en production)

- Changer `JWT_SECRET` et le mot de passe admin par defaut.
- Passer de SQLite a PostgreSQL.
- Stocker les fichiers uploades (photos, pieces d'identite) sur un stockage
  objet chiffre (ex: S3) plutot que sur le disque local.
- Ajouter la limitation de debit (rate limiting) sur `/auth/login` et
  `/auth/register/*`.
