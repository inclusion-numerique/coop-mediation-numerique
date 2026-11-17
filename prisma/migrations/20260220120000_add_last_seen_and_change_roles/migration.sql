-- AlterTable
ALTER TABLE "users" ADD COLUMN "last_seen" TIMESTAMP(3);

-- AlterEnum
ALTER TYPE "mutation_name" ADD VALUE 'changer_roles';
