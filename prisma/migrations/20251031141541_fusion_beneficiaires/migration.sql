-- AlterTable
ALTER TABLE "public"."beneficiaires" ADD COLUMN     "fusion_vers_id" UUID;

-- AddForeignKey
ALTER TABLE "public"."beneficiaires" ADD CONSTRAINT "beneficiaires_fusion_vers_id_fkey" FOREIGN KEY ("fusion_vers_id") REFERENCES "public"."beneficiaires"("id") ON DELETE SET NULL ON UPDATE CASCADE;
