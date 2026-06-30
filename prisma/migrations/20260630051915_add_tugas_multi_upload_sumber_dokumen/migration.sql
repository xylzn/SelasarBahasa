/*
  Warnings:

  - You are about to drop the column `konten` on the `Article` table. All the data in the column will be lost.
  - The `fiturList` column on the `Package` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `deskripsi` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `QuizAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `fileName` on the `TugasSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrl` on the `TugasSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `User` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `QuizOption` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuizQuestion` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Quiz` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `isi` to the `Article` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ContactMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `durasiBulan` to the `Package` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Package` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Quiz` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Quiz` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SumberDokumen" AS ENUM ('LINK', 'UPLOAD');

-- CreateEnum
CREATE TYPE "QuizTipe" AS ENUM ('PILIHAN_GANDA', 'ESAY');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'PREMIUM', 'ADMIN');

-- DropForeignKey
ALTER TABLE "QuizOption" DROP CONSTRAINT "QuizOption_questionId_fkey";

-- DropForeignKey
ALTER TABLE "QuizQuestion" DROP CONSTRAINT "QuizQuestion_quizId_fkey";

-- DropIndex
DROP INDEX "Article_kategori_idx";

-- DropIndex
DROP INDEX "Article_published_publishedAt_idx";

-- DropIndex
DROP INDEX "ContactMessage_isRead_idx";

-- DropIndex
DROP INDEX "Materi_kelas_tipe_idx";

-- DropIndex
DROP INDEX "Materi_urutan_idx";

-- DropIndex
DROP INDEX "Package_published_urutan_idx";

-- DropIndex
DROP INDEX "QuizAttempt_userId_quizId_idx";

-- DropIndex
DROP INDEX "User_role_idx";

-- AlterTable
ALTER TABLE "Article" DROP COLUMN "konten",
ADD COLUMN     "coverUrl" TEXT,
ADD COLUMN     "isi" TEXT NOT NULL,
ALTER COLUMN "ringkasan" SET DATA TYPE TEXT,
ALTER COLUMN "metaDescription" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "ContactMessage" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Materi" ADD COLUMN     "sumberDokumen" "SumberDokumen";

-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "durasiBulan" INTEGER NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "harga" SET DATA TYPE DECIMAL(12,2),
DROP COLUMN "fiturList",
ADD COLUMN     "fiturList" TEXT[];

-- AlterTable
ALTER TABLE "Quiz" DROP COLUMN "deskripsi",
ADD COLUMN     "kelas" "KelasLevel" NOT NULL DEFAULT 'DASAR',
ADD COLUMN     "materiId" TEXT,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "tipe" "QuizTipe" NOT NULL DEFAULT 'PILIHAN_GANDA',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "urutan" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "QuizAttempt" DROP COLUMN "score",
ADD COLUMN     "selesai" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "skor" INTEGER,
ADD COLUMN     "startedAt" TIMESTAMP(3),
ALTER COLUMN "jawaban" DROP NOT NULL,
ALTER COLUMN "jawaban" SET DATA TYPE TEXT,
ALTER COLUMN "completedAt" DROP NOT NULL,
ALTER COLUMN "completedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "TugasSubmission" DROP COLUMN "fileName",
DROP COLUMN "fileUrl";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "passwordHash",
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';

-- DropTable
DROP TABLE "QuizOption";

-- DropTable
DROP TABLE "QuizQuestion";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "Pertanyaan" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "teks" TEXT NOT NULL,
    "tipe" "QuizTipe" NOT NULL DEFAULT 'PILIHAN_GANDA',
    "pilihan" TEXT[],
    "jawabanBenar" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pertanyaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TugasSubmissionFile" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,

    CONSTRAINT "TugasSubmissionFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TugasSubmissionFile_submissionId_idx" ON "TugasSubmissionFile"("submissionId");

-- CreateIndex
CREATE INDEX "Materi_kelas_idx" ON "Materi"("kelas");

-- CreateIndex
CREATE UNIQUE INDEX "Quiz_slug_key" ON "Quiz"("slug");

-- CreateIndex
CREATE INDEX "Quiz_kelas_idx" ON "Quiz"("kelas");

-- CreateIndex
CREATE INDEX "QuizAttempt_userId_idx" ON "QuizAttempt"("userId");

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_materiId_fkey" FOREIGN KEY ("materiId") REFERENCES "Materi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pertanyaan" ADD CONSTRAINT "Pertanyaan_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TugasSubmissionFile" ADD CONSTRAINT "TugasSubmissionFile_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "TugasSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
