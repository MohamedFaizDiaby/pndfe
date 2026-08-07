-- CreateTable
CREATE TABLE "OffreEmploi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agenceId" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "typeContrat" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "lieuTravail" TEXT NOT NULL,
    "salaireBrut" REAL NOT NULL,
    "nombrePostes" INTEGER NOT NULL DEFAULT 1,
    "statut" TEXT NOT NULL DEFAULT 'OUVERTE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OffreEmploi_agenceId_fkey" FOREIGN KEY ("agenceId") REFERENCES "Agence" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Candidature" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "offreId" TEXT NOT NULL,
    "travailleurId" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "message" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Candidature_offreId_fkey" FOREIGN KEY ("offreId") REFERENCES "OffreEmploi" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Candidature_travailleurId_fkey" FOREIGN KEY ("travailleurId") REFERENCES "Travailleur" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Candidature_offreId_travailleurId_key" ON "Candidature"("offreId", "travailleurId");
