-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Travailleur" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenoms" TEXT NOT NULL,
    "dateNaissance" TIMESTAMP(3) NOT NULL,
    "telephone" TEXT NOT NULL,
    "metier" TEXT NOT NULL,
    "numeroPieceIdentite" TEXT NOT NULL,
    "photoUrl" TEXT,
    "pieceIdentiteUrl" TEXT,
    "qrCodeToken" TEXT NOT NULL,
    "statutVerification" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Travailleur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agence" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "raisonSociale" TEXT NOT NULL,
    "registreCommerce" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "secteurs" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "agenceId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "nomFichier" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemandeAgrement" (
    "id" TEXT NOT NULL,
    "agenceId" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "commentaireAdmin" TEXT,
    "traiteParUserId" TEXT,
    "dateTraitement" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemandeAgrement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contrat" (
    "id" TEXT NOT NULL,
    "agenceId" TEXT NOT NULL,
    "travailleurId" TEXT NOT NULL,
    "typeContrat" TEXT NOT NULL,
    "poste" TEXT NOT NULL,
    "lieuTravail" TEXT NOT NULL,
    "salaireBrut" DOUBLE PRECISION NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3),
    "statut" TEXT NOT NULL DEFAULT 'ENVOYE',
    "signatureTravailleurNom" TEXT,
    "signatureTravailleurAt" TIMESTAMP(3),
    "motifRefus" TEXT,
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contrat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paiement" (
    "id" TEXT NOT NULL,
    "contratId" TEXT NOT NULL,
    "periode" TEXT NOT NULL,
    "salaireBrut" DOUBLE PRECISION NOT NULL,
    "cotisationCnps" DOUBLE PRECISION NOT NULL,
    "cotisationCmu" DOUBLE PRECISION NOT NULL,
    "salaireNet" DOUBLE PRECISION NOT NULL,
    "methodePaiement" TEXT NOT NULL,
    "telephoneBeneficiaire" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'REUSSI',
    "referenceTransaction" TEXT NOT NULL,
    "bulletinPdfUrl" TEXT,
    "datePaiement" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Paiement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeclarationCnps" (
    "id" TEXT NOT NULL,
    "contratId" TEXT NOT NULL,
    "numeroCnps" TEXT NOT NULL,
    "numeroCmu" TEXT NOT NULL,
    "dateDeclaration" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeclarationCnps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OffreEmploi" (
    "id" TEXT NOT NULL,
    "agenceId" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "typeContrat" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "lieuTravail" TEXT NOT NULL,
    "salaireBrut" DOUBLE PRECISION NOT NULL,
    "nombrePostes" INTEGER NOT NULL DEFAULT 1,
    "statut" TEXT NOT NULL DEFAULT 'OUVERTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OffreEmploi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidature" (
    "id" TEXT NOT NULL,
    "offreId" TEXT NOT NULL,
    "travailleurId" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalAudit" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "role" TEXT,
    "action" TEXT NOT NULL,
    "entite" TEXT,
    "entiteId" TEXT,
    "details" TEXT,
    "adresseIp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JournalAudit_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE UNIQUE INDEX "Paiement_referenceTransaction_key" ON "Paiement"("referenceTransaction");

-- CreateIndex
CREATE UNIQUE INDEX "Paiement_contratId_periode_key" ON "Paiement"("contratId", "periode");

-- CreateIndex
CREATE UNIQUE INDEX "DeclarationCnps_contratId_key" ON "DeclarationCnps"("contratId");

-- CreateIndex
CREATE UNIQUE INDEX "DeclarationCnps_numeroCnps_key" ON "DeclarationCnps"("numeroCnps");

-- CreateIndex
CREATE UNIQUE INDEX "DeclarationCnps_numeroCmu_key" ON "DeclarationCnps"("numeroCmu");

-- CreateIndex
CREATE UNIQUE INDEX "Candidature_offreId_travailleurId_key" ON "Candidature"("offreId", "travailleurId");

-- CreateIndex
CREATE INDEX "JournalAudit_userId_idx" ON "JournalAudit"("userId");

-- CreateIndex
CREATE INDEX "JournalAudit_action_idx" ON "JournalAudit"("action");

-- CreateIndex
CREATE INDEX "JournalAudit_createdAt_idx" ON "JournalAudit"("createdAt");

-- AddForeignKey
ALTER TABLE "Travailleur" ADD CONSTRAINT "Travailleur_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agence" ADD CONSTRAINT "Agence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_agenceId_fkey" FOREIGN KEY ("agenceId") REFERENCES "Agence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandeAgrement" ADD CONSTRAINT "DemandeAgrement_agenceId_fkey" FOREIGN KEY ("agenceId") REFERENCES "Agence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrat" ADD CONSTRAINT "Contrat_agenceId_fkey" FOREIGN KEY ("agenceId") REFERENCES "Agence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrat" ADD CONSTRAINT "Contrat_travailleurId_fkey" FOREIGN KEY ("travailleurId") REFERENCES "Travailleur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paiement" ADD CONSTRAINT "Paiement_contratId_fkey" FOREIGN KEY ("contratId") REFERENCES "Contrat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeclarationCnps" ADD CONSTRAINT "DeclarationCnps_contratId_fkey" FOREIGN KEY ("contratId") REFERENCES "Contrat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OffreEmploi" ADD CONSTRAINT "OffreEmploi_agenceId_fkey" FOREIGN KEY ("agenceId") REFERENCES "Agence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidature" ADD CONSTRAINT "Candidature_offreId_fkey" FOREIGN KEY ("offreId") REFERENCES "OffreEmploi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidature" ADD CONSTRAINT "Candidature_travailleurId_fkey" FOREIGN KEY ("travailleurId") REFERENCES "Travailleur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

