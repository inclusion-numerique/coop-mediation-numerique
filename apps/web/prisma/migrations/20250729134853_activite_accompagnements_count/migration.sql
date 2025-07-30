/*
  Warnings:

  - Added the required column `accompagnements_count` to the `activites` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."activites" ADD COLUMN     "accompagnements_count" INTEGER;


UPDATE "public"."activites" SET "accompagnements_count" = (SELECT count(*) FROM "public"."accompagnements" WHERE "public"."accompagnements"."activite_id" = "public"."activites"."id");


ALTER TABLE "public"."activites" ALTER COLUMN "accompagnements_count" SET NOT NULL;

-- CreateIndex
CREATE INDEX "activites_modification_idx" ON "public"."activites"("modification" DESC);


