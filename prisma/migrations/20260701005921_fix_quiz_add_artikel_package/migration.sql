/*
  Warnings:

  - You are about to drop the column `materiId` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `tipe` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `urutan` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `selesai` on the `QuizAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `skor` on the `QuizAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `startedAt` on the `QuizAttempt` table. All the data in the column will be lost.
  - You are about to drop the `Pertanyaan` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `deskripsi` to the `Quiz` table without a default value. This is not possible if the table is not empty.
  - Added the required column `score` to the `QuizAttempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jawaban` to the `QuizAttempt` table without a default value. This is not possible if the table is not empty.
  - Made the column `completedAt` on table `QuizAttempt` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Pertanyaan" DROP CONSTRAINT "Pertanyaan_quizId_fkey";

-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_materiId_fkey";

-- DropIndex
DROP INDEX "Quiz_slug_key";

-- DropIndex
DROP INDEX "QuizAttempt_userId_idx";

-- AlterTable
ALTER TABLE "Quiz" DROP COLUMN "materiId",
DROP COLUMN "slug",
DROP COLUMN "tipe",
DROP COLUMN "urutan",
ADD COLUMN     "deskripsi" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "QuizAttempt" DROP COLUMN "selesai",
DROP COLUMN "skor",
DROP COLUMN "startedAt",
ADD COLUMN     "score" INTEGER NOT NULL,
DROP COLUMN "jawaban",
ADD COLUMN     "jawaban" JSONB NOT NULL,
ALTER COLUMN "completedAt" SET NOT NULL,
ALTER COLUMN "completedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "Pertanyaan";

-- DropEnum
DROP TYPE "QuizTipe";

-- CreateTable
CREATE TABLE "QuizQuestion" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "pertanyaan" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "teks" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "QuizOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuizQuestion_quizId_idx" ON "QuizQuestion"("quizId");

-- CreateIndex
CREATE INDEX "QuizQuestion_urutan_idx" ON "QuizQuestion"("urutan");

-- CreateIndex
CREATE INDEX "QuizOption_questionId_idx" ON "QuizOption"("questionId");

-- CreateIndex
CREATE INDEX "QuizAttempt_userId_quizId_idx" ON "QuizAttempt"("userId", "quizId");

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizOption" ADD CONSTRAINT "QuizOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
