-- AlterTable
ALTER TABLE "public"."activites" ADD COLUMN     "structure_employeuse_id" UUID;

-- CreateIndex
CREATE INDEX "activites_structure_employeuse_id_idx" ON "public"."activites"("structure_employeuse_id");

-- AddForeignKey
ALTER TABLE "public"."activites" ADD CONSTRAINT "activites_structure_employeuse_id_fkey" FOREIGN KEY ("structure_employeuse_id") REFERENCES "public"."structures"("id") ON DELETE SET NULL ON UPDATE CASCADE;
