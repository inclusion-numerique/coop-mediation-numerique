-- AlterTable
ALTER TABLE "activites" ADD COLUMN     "v1_cra_id" TEXT,
ADD COLUMN     "v1_cra_id_pg" INTEGER,
ADD COLUMN     "v1_permanence_id" TEXT,
ADD COLUMN     "v1_structure_id" TEXT;

-- AlterTable
ALTER TABLE "structures" ADD COLUMN     "v1_imported" TIMESTAMP(3),
ADD COLUMN     "v1_structure_id" TEXT,
ADD COLUMN     "v1_structure_id_pg" INTEGER;

-- CreateIndex
CREATE INDEX "structures_v1_structure_id_idx" ON "structures"("v1_structure_id");
