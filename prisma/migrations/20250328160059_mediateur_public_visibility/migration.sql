-- AlterTable
ALTER TABLE "mediateurs" ADD COLUMN     "is_visible" BOOLEAN NOT NULL DEFAULT false;

-- AlterEnum
ALTER TYPE "mutation_name" ADD VALUE 'set_mediateur_visibility';
ALTER TYPE "api_client_scope" ADD VALUE 'lieux_activite';
