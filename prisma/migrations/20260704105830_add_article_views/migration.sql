-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "reminderSentAt" TIMESTAMP(3),
ADD COLUMN     "warningSentAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Article_views_idx" ON "Article"("views");
