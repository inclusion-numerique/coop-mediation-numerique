-- AlterTable
ALTER TABLE "public"."tags" ADD COLUMN     "coordinateur_id" UUID;

-- CreateIndex
CREATE INDEX "tags_coordinateur_id_idx" ON "public"."tags"("coordinateur_id");

-- AddForeignKey
ALTER TABLE "public"."tags" ADD CONSTRAINT "tags_coordinateur_id_fkey" FOREIGN KEY ("coordinateur_id") REFERENCES "public"."coordinateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
