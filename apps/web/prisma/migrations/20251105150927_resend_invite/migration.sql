/*
  Warnings:

  - Made the column `creation` on table `invitations_equipes` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "public"."mutation_name" ADD VALUE 'renvoyer_invitation_mediateur_coordonne';

-- AlterTable
ALTER TABLE "public"."invitations_equipes" ADD COLUMN     "renvoyee" TIMESTAMP(3),
ALTER COLUMN "creation" SET NOT NULL;
