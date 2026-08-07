-- CreateTable
CREATE TABLE "Contrat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agenceId" TEXT NOT NULL,
    "travailleurId" TEXT NOT NULL,
    "typeContrat" TEXT NOT NULL,
    "poste" TEXT NOT NULL,
    "lieuTravail" TEXT NOT NULL,
    "salaireBrut" REAL NOT NULL,
    "dateDebut" DATETIME NOT NULL,
    "dateFin" DATETIME,
    "statut" TEXT NOT NULL DEFAULT 'ENVOYE',
    "signatureTravailleurNom" TEXT,
    "signatureTravailleurAt" DATETIME,
    "motifRefus" TEXT,
    "pdfUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Contrat_agenceId_fkey" FOREIGN KEY ("agenceId") REFERENCES "Agence" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Contrat_travailleurId_fkey" FOREIGN KEY ("travailleurId") REFERENCES "Travailleur" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DeclarationCnps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contratId" TEXT NOT NULL,
    "numeroCnps" TEXT NOT NULL,
    "numeroCmu" TEXT NOT NULL,
    "dateDeclaration" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DeclarationCnps_contratId_fkey" FOREIGN KEY ("contratId") REFERENCES "Contrat" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DeclarationCnps_contratId_key" ON "DeclarationCnps"("contratId");

-- CreateIndex
CREATE UNIQUE INDEX "DeclarationCnps_numeroCnps_key" ON "DeclarationCnps"("numeroCnps");

-- CreateIndex
CREATE UNIQUE INDEX "DeclarationCnps_numeroCmu_key" ON "DeclarationCnps"("numeroCmu");
