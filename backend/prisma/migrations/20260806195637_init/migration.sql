-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Travailleur" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenoms" TEXT NOT NULL,
    "dateNaissance" DATETIME NOT NULL,
    "telephone" TEXT NOT NULL,
    "metier" TEXT NOT NULL,
    "numeroPieceIdentite" TEXT NOT NULL,
    "photoUrl" TEXT,
    "pieceIdentiteUrl" TEXT,
    "qrCodeToken" TEXT NOT NULL,
    "statutVerification" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Travailleur_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Agence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "raisonSociale" TEXT NOT NULL,
    "registreCommerce" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "secteurs" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Agence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agenceId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "nomFichier" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Document_agenceId_fkey" FOREIGN KEY ("agenceId") REFERENCES "Agence" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DemandeAgrement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agenceId" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "commentaireAdmin" TEXT,
    "traiteParUserId" TEXT,
    "dateTraitement" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DemandeAgrement_agenceId_fkey" FOREIGN KEY ("agenceId") REFERENCES "Agence" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Travailleur_userId_key" ON "Travailleur"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Travailleur_qrCodeToken_key" ON "Travailleur"("qrCodeToken");

-- CreateIndex
CREATE UNIQUE INDEX "Agence_userId_key" ON "Agence"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DemandeAgrement_agenceId_key" ON "DemandeAgrement"("agenceId");
