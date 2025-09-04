/*
  Warnings:

  - Made the column `structure_employeuse_id` on table `activites` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."activites" DROP CONSTRAINT "activites_structure_employeuse_id_fkey";

-- AlterTable
ALTER TABLE "public"."activites" ALTER COLUMN "structure_employeuse_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."activites" ADD CONSTRAINT "activites_structure_employeuse_id_fkey" FOREIGN KEY ("structure_employeuse_id") REFERENCES "public"."structures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
