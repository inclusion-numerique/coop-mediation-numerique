-- La table miroir `structures_cartographie_nationale` est supprimée : la donnée de la
-- cartographie nationale vit désormais dans l'Entrepôt (`main.lieu_inclusion`), lue via le
-- second client Prisma read-only. La colonne `structures.id_cartographie_nationale` (lien
-- vers le lieu carto) est conservée mais n'est plus une clé étrangère.

-- DropForeignKey
ALTER TABLE "coop"."structures" DROP CONSTRAINT "structures_id_cartographie_nationale_fkey";

-- DropTable
DROP TABLE "coop"."structures_cartographie_nationale";
