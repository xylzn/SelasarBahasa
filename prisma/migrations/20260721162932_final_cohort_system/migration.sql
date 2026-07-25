/*
  Warnings:

  - The values [USER,PREMIUM] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `isPremium` on the `Materi` table. All the data in the column will be lost.
  - You are about to drop the column `kelas` on the `Materi` table. All the data in the column will be lost.
  - You are about to drop the column `isPremium` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `kelas` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `isPremium` on the `Tugas` table. All the data in the column will be lost.
  - You are about to drop the column `kelas` on the `Tugas` table. All the data in the column will be lost.
  - You are about to drop the column `premiumExpiresAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `reminderSentAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `warningSentAt` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TipeKelas" AS ENUM ('REGULER', 'PRIVAT', 'ANAK_REMAJA');

-- CreateEnum
CREATE TYPE "TingkatBIPA" AS ENUM ('BIPA_1', 'BIPA_2', 'BIPA_3', 'BIPA_4', 'BIPA_5', 'BIPA_6');

-- CreateEnum
CREATE TYPE "StatusKelas" AS ENUM ('WAITING_LIST', 'ONGOING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "StatusEnrollment" AS ENUM ('PENDING_PAYMENT', 'WAITING', 'ACTIVE', 'COMPLETED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "TipeMedia" AS ENUM ('FOTO', 'VIDEO');

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('ADMIN', 'STUDENT');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'STUDENT';
COMMIT;

-- DropIndex
DROP INDEX "Materi_isPremium_published_idx";

-- DropIndex
DROP INDEX "Materi_kelas_idx";

-- DropIndex
DROP INDEX "Quiz_isPremium_published_idx";

-- DropIndex
DROP INDEX "Quiz_kelas_idx";

-- DropIndex
DROP INDEX "Tugas_isPremium_published_idx";

-- DropIndex
DROP INDEX "Tugas_kelas_idx";

-- AlterTable
ALTER TABLE "Materi" DROP COLUMN "isPremium",
DROP COLUMN "kelas",
ADD COLUMN     "tingkatBIPA" "TingkatBIPA",
ADD COLUMN     "tipeKelas" "TipeKelas";

-- AlterTable
ALTER TABLE "Quiz" DROP COLUMN "isPremium",
DROP COLUMN "kelas",
ADD COLUMN     "tingkatBIPA" "TingkatBIPA",
ADD COLUMN     "tipeKelas" "TipeKelas";

-- AlterTable
ALTER TABLE "Tugas" DROP COLUMN "isPremium",
DROP COLUMN "kelas",
ADD COLUMN     "tingkatBIPA" "TingkatBIPA",
ADD COLUMN     "tipeKelas" "TipeKelas";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "premiumExpiresAt",
DROP COLUMN "reminderSentAt",
DROP COLUMN "warningSentAt",
ADD COLUMN     "noWhatsapp" TEXT,
ALTER COLUMN "role" SET DEFAULT 'STUDENT';

-- DropEnum
DROP TYPE "KelasLevel";

-- CreateTable
CREATE TABLE "Kelas" (
    "id" TEXT NOT NULL,
    "tipe" "TipeKelas" NOT NULL,
    "tingkat" "TingkatBIPA" NOT NULL,
    "status" "StatusKelas" NOT NULL DEFAULT 'WAITING_LIST',
    "minKuota" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kelasId" TEXT NOT NULL,
    "status" "StatusEnrollment" NOT NULL DEFAULT 'WAITING',
    "jadwalPreferensi" TEXT,
    "umurAnak" INTEGER,
    "namaWali" TEXT,
    "alasanRefund" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AktivitasKita" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "mediaUrl" TEXT NOT NULL,
    "tipeMedia" "TipeMedia" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AktivitasKita_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Kelas_tipe_tingkat_idx" ON "Kelas"("tipe", "tingkat");

-- CreateIndex
CREATE INDEX "Kelas_status_idx" ON "Kelas"("status");

-- CreateIndex
CREATE INDEX "Enrollment_userId_idx" ON "Enrollment"("userId");

-- CreateIndex
CREATE INDEX "Enrollment_kelasId_idx" ON "Enrollment"("kelasId");

-- CreateIndex
CREATE INDEX "Enrollment_status_idx" ON "Enrollment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_userId_kelasId_key" ON "Enrollment"("userId", "kelasId");

-- CreateIndex
CREATE INDEX "AktivitasKita_tipeMedia_idx" ON "AktivitasKita"("tipeMedia");

-- CreateIndex
CREATE INDEX "AktivitasKita_createdAt_idx" ON "AktivitasKita"("createdAt");

-- CreateIndex
CREATE INDEX "Materi_published_idx" ON "Materi"("published");

-- CreateIndex
CREATE INDEX "Materi_tipeKelas_tingkatBIPA_idx" ON "Materi"("tipeKelas", "tingkatBIPA");

-- CreateIndex
CREATE INDEX "Quiz_published_idx" ON "Quiz"("published");

-- CreateIndex
CREATE INDEX "Quiz_tipeKelas_tingkatBIPA_idx" ON "Quiz"("tipeKelas", "tingkatBIPA");

-- CreateIndex
CREATE INDEX "Tugas_published_idx" ON "Tugas"("published");

-- CreateIndex
CREATE INDEX "Tugas_tipeKelas_tingkatBIPA_idx" ON "Tugas"("tipeKelas", "tingkatBIPA");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
