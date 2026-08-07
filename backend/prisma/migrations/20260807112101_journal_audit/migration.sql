-- CreateTable
CREATE TABLE "JournalAudit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "role" TEXT,
    "action" TEXT NOT NULL,
    "entite" TEXT,
    "entiteId" TEXT,
    "details" TEXT,
    "adresseIp" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "JournalAudit_userId_idx" ON "JournalAudit"("userId");

-- CreateIndex
CREATE INDEX "JournalAudit_action_idx" ON "JournalAudit"("action");

-- CreateIndex
CREATE INDEX "JournalAudit_createdAt_idx" ON "JournalAudit"("createdAt");
