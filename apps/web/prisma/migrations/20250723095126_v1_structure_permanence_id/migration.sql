-- AlterTable
ALTER TABLE "structures" ADD COLUMN     "v1_permanence_id" TEXT;

-- CreateIndex
CREATE INDEX "structures_v1_permanence_id_idx" ON "structures"("v1_permanence_id");
