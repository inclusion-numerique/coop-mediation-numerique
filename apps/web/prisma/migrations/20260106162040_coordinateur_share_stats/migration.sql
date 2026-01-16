/*
  Warnings:

  - A unique constraint covering the columns `[coordinateur_id]` on the table `partage_statistiques` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."partage_statistiques" DROP CONSTRAINT "partage_statistiques_mediateur_id_fkey";

-- AlterTable
ALTER TABLE "public"."partage_statistiques" ADD COLUMN     "coordinateur_id" UUID,
ALTER COLUMN "mediateur_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "partage_statistiques_coordinateur_id_key" ON "public"."partage_statistiques"("coordinateur_id");

-- AddForeignKey
ALTER TABLE "public"."partage_statistiques" ADD CONSTRAINT "partage_statistiques_mediateur_id_fkey" FOREIGN KEY ("mediateur_id") REFERENCES "public"."mediateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."partage_statistiques" ADD CONSTRAINT "partage_statistiques_coordinateur_id_fkey" FOREIGN KEY ("coordinateur_id") REFERENCES "public"."coordinateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
