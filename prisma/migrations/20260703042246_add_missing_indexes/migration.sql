-- CreateIndex
CREATE INDEX "Article_published_publishedAt_idx" ON "Article"("published", "publishedAt");

-- CreateIndex
CREATE INDEX "Article_kategori_idx" ON "Article"("kategori");

-- CreateIndex
CREATE INDEX "Package_published_idx" ON "Package"("published");
