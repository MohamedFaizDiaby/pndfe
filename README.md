# PNDFE — Plateforme Numerique de l'Emploi Formel

MVP de l'**Etape 1** du cahier des charges PNDFE (Ministere de l'Emploi et de la
Protection Sociale, Cote d'Ivoire) : **identite numerique des travailleurs et des
agences d'emploi**.

## Ce qui est implemente (Etape 1 du calendrier officiel)

- Inscription travailleur (profil, photo, piece d'identite) + generation d'une
  carte professionnelle avec **QR Code** unique et scannable.
- Inscription agence d'emploi (documents justificatifs) + **demande d'agrement**.
- Validation/rejet des agrements par le **Ministere** (tableau de bord admin).
- Verification publique d'identite par scan de QR Code (camera ou saisie
  manuelle) — utilisable par une agence ou un employeur.
- Tableau de bord de pilotage (nombre de travailleurs par secteur).
- Authentification par role (TRAVAILLEUR / AGENCE / ADMIN) avec JWT.

Les etapes suivantes du cahier des charges (contrats electroniques, paiement
Mobile Money, bulletins de paie, declarations CNPS/CMU) ne sont pas couvertes
par cette version.

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
npm run start:dev                     # http://localhost:3000
```

Compte Ministere par defaut (cree par le seed) :
- email : `ministere@pndfe.ci`
- mot de passe : `Admin123!`

**A changer immediatement avant toute mise en production.**

### Frontend

```bash
cd frontend
npm install
npm run dev    # http://localhost:5173
```

## Structure du projet

```
pndfe/
  backend/     API NestJS (auth, travailleurs, agences, admin)
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
