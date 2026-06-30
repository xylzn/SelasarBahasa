/*
  Warnings:

  - You are about to drop the column `kontenTeks` on the `Materi` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Materi" DROP COLUMN "kontenTeks",
ADD COLUMN     "pdfUrl" TEXT;

-- CreateTable
CREATE TABLE "Tugas" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "instruksi" TEXT NOT NULL,
    "fileInstruksiUrl" TEXT,
    "kelas" "KelasLevel" NOT NULL DEFAULT 'DASAR',
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "deadline" TIMESTAMP(3),
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tugas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TugasSubmission" (
    "id" TEXT NOT NULL,
    "tugasId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TugasSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tugas_slug_key" ON "Tugas"("slug");

-- CreateIndex
CREATE INDEX "Tugas_isPremium_published_idx" ON "Tugas"("isPremium", "published");

-- CreateIndex
CREATE INDEX "Tugas_kelas_idx" ON "Tugas"("kelas");

-- CreateIndex
CREATE INDEX "TugasSubmission_tugasId_idx" ON "TugasSubmission"("tugasId");

-- CreateIndex
CREATE INDEX "TugasSubmission_userId_idx" ON "TugasSubmission"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TugasSubmission_tugasId_userId_key" ON "TugasSubmission"("tugasId", "userId");

-- AddForeignKey
ALTER TABLE "TugasSubmission" ADD CONSTRAINT "TugasSubmission_tugasId_fkey" FOREIGN KEY ("tugasId") REFERENCES "Tugas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TugasSubmission" ADD CONSTRAINT "TugasSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
