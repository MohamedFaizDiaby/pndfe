-- CreateTable
CREATE TABLE "Paiement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contratId" TEXT NOT NULL,
    "periode" TEXT NOT NULL,
    "salaireBrut" REAL NOT NULL,
    "cotisationCnps" REAL NOT NULL,
    "cotisationCmu" REAL NOT NULL,
    "salaireNet" REAL NOT NULL,
    "methodePaiement" TEXT NOT NULL,
    "telephoneBeneficiaire" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'REUSSI',
    "referenceTransaction" TEXT NOT NULL,
    "bulletinPdfUrl" TEXT,
    "datePaiement" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Paiement_contratId_fkey" FOREIGN KEY ("contratId") REFERENCES "Contrat" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Paiement_referenceTransaction_key" ON "Paiement"("referenceTransaction");

-- CreateIndex
CREATE UNIQUE INDEX "Paiement_contratId_periode_key" ON "Paiement"("contratId", "periode");
