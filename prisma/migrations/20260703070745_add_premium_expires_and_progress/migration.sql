-- AlterTable
ALTER TABLE "User" ADD COLUMN     "premiumExpiresAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "MateriProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "materiId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MateriProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MateriProgress_userId_idx" ON "MateriProgress"("userId");

-- CreateIndex
CREATE INDEX "MateriProgress_materiId_idx" ON "MateriProgress"("materiId");

-- CreateIndex
CREATE UNIQUE INDEX "MateriProgress_userId_materiId_key" ON "MateriProgress"("userId", "materiId");

-- AddForeignKey
ALTER TABLE "MateriProgress" ADD CONSTRAINT "MateriProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MateriProgress" ADD CONSTRAINT "MateriProgress_materiId_fkey" FOREIGN KEY ("materiId") REFERENCES "Materi"("id") ON DELETE CASCADE ON UPDATE CASCADE;
