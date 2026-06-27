/*
  Warnings:

  - The values [CAMPURAN] on the enum `MateriTipe` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "KelasLevel" AS ENUM ('DASAR', 'MENENGAH', 'LANJUTAN');

-- AlterEnum
BEGIN;
-- First, update any existing CAMPURAN records to VIDEO
UPDATE "Materi" SET "tipe" = 'VIDEO' WHERE "tipe" = 'CAMPURAN';

CREATE TYPE "MateriTipe_new" AS ENUM ('TEKS', 'VIDEO');
ALTER TABLE "Materi" ALTER COLUMN "tipe" DROP DEFAULT;
ALTER TABLE "Materi" ALTER COLUMN "tipe" TYPE "MateriTipe_new" USING ("tipe"::text::"MateriTipe_new");
ALTER TYPE "MateriTipe" RENAME TO "MateriTipe_old";
ALTER TYPE "MateriTipe_new" RENAME TO "MateriTipe";
DROP TYPE "MateriTipe_old";
ALTER TABLE "Materi" ALTER COLUMN "tipe" SET DEFAULT 'TEKS';
COMMIT;

-- AlterTable
ALTER TABLE "Materi" ADD COLUMN     "kelas" "KelasLevel" NOT NULL DEFAULT 'DASAR';

-- CreateIndex
CREATE INDEX "Materi_kelas_tipe_idx" ON "Materi"("kelas", "tipe");
