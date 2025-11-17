/*
  Warnings:

  - You are about to drop the column `nom_evenement` on the `activite_coordination` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."activite_coordination" DROP COLUMN "nom_evenement",
ADD COLUMN     "nom" TEXT;
