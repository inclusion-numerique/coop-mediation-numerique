-- Suppression des résidus de l'assistant IA, retiré du code applicatif le 18/05/2026
-- (commit 23c56c4c « refactor: remove unused AI assistant ») sans que le schéma ni la
-- base ne soient nettoyés. Aucun code ne lit ni n'écrit ces tables depuis cette date.
--
-- Le mécanisme de feature flags disparaît avec : `Assistant` en était l'unique valeur
-- (0 utilisateur la portait en production) et `hasFeatureFlag` n'avait aucun appelant.
--
-- L'extension `vector` n'est VOLONTAIREMENT pas supprimée : elle vit dans le schéma
-- `public` de l'Entrepôt, partagé avec les autres locataires du Dataspace, donc hors
-- du périmètre de la Coop.

-- DropForeignKey
ALTER TABLE "coop"."assistant_chat_messages" DROP CONSTRAINT "assistant_chat_messages_thread_id_fkey";

-- DropForeignKey
ALTER TABLE "coop"."assistant_chat_threads" DROP CONSTRAINT "assistant_chat_threads_assistant_configuration_id_fkey";

-- DropForeignKey
ALTER TABLE "coop"."assistant_chat_threads" DROP CONSTRAINT "assistant_chat_threads_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "coop"."assistant_configurations" DROP CONSTRAINT "assistant_configurations_user_id_fkey";

-- DropForeignKey
ALTER TABLE "coop"."users" DROP CONSTRAINT "users_current_assistant_configuration_id_fkey";

-- DropIndex
DROP INDEX "coop"."users_current_assistant_configuration_id_key";

-- AlterTable
ALTER TABLE "coop"."users" DROP COLUMN "current_assistant_configuration_id",
DROP COLUMN "feature_flags";

-- DropTable
DROP TABLE "coop"."assistant_chat_messages";

-- DropTable
DROP TABLE "coop"."assistant_chat_threads";

-- DropTable
DROP TABLE "coop"."assistant_configurations";

-- DropTable
DROP TABLE "coop"."rag_document_chunks";

-- DropEnum
DROP TYPE "coop"."user_feature_flag";
