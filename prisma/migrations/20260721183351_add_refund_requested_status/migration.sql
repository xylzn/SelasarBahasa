/*
  Warnings:

  - You are about to drop the `Package` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "StatusEnrollment" ADD VALUE 'REFUND_REQUESTED';

-- AlterTable
ALTER TABLE "Kelas" ADD COLUMN     "nama" TEXT NOT NULL DEFAULT '';

-- DropTable
DROP TABLE "Package";
