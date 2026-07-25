/*
  Warnings:

  - You are about to drop the column `mediaUrl` on the `AktivitasKita` table. All the data in the column will be lost.
  - You are about to drop the column `tipeMedia` on the `AktivitasKita` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "AktivitasKita_tipeMedia_idx";

-- AlterTable
ALTER TABLE "AktivitasKita" DROP COLUMN "mediaUrl",
DROP COLUMN "tipeMedia";

-- CreateTable
CREATE TABLE "AktivitasMedia" (
    "id" TEXT NOT NULL,
    "aktivitasId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tipe" "TipeMedia" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AktivitasMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AktivitasMedia_aktivitasId_idx" ON "AktivitasMedia"("aktivitasId");

-- AddForeignKey
ALTER TABLE "AktivitasMedia" ADD CONSTRAINT "AktivitasMedia_aktivitasId_fkey" FOREIGN KEY ("aktivitasId") REFERENCES "AktivitasKita"("id") ON DELETE CASCADE ON UPDATE CASCADE;
