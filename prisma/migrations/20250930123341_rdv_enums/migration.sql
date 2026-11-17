/*
  Warnings:

  - The `caisse_affiliation` column on the `rdv_users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."rdv_users" DROP COLUMN "caisse_affiliation",
ADD COLUMN     "caisse_affiliation" TEXT;

-- DropEnum
DROP TYPE "public"."rdv_caisse_affiliation";
