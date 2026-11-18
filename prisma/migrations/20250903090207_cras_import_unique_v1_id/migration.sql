/*
  Warnings:

  - A unique constraint covering the columns `[v1_cra_id]` on the table `activites` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "activites_v1_cra_id_key" ON "public"."activites"("v1_cra_id");
