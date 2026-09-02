-- CreateTable
CREATE TABLE IF NOT EXISTS "Participant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "participantId" TEXT NOT NULL,
    "icNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "preferredMode" TEXT NOT NULL,
    "finalMode" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "checkInAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Alert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "region" TEXT,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "metadata" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "triggeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "participant" TEXT,
    "icNumber" TEXT,
    "detail" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Participant_participantId_key" ON "Participant"("participantId");
CREATE UNIQUE INDEX IF NOT EXISTS "Participant_icNumber_key" ON "Participant"("icNumber");
CREATE INDEX IF NOT EXISTS "Participant_region_status_idx" ON "Participant"("region", "status");
CREATE INDEX IF NOT EXISTS "Participant_status_idx" ON "Participant"("status");
CREATE INDEX IF NOT EXISTS "Participant_sector_idx" ON "Participant"("sector");
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

