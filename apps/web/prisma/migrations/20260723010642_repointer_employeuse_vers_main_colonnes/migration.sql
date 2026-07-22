-- Bascule coop->main (ADR-002 étape 6) : ajoute les colonnes int + FK vers
-- main.structure_administrative, EN PLUS des colonnes uuid existantes (transition non
-- destructive). Colonnes nullables, remplies ensuite par le job de backfill ; l'échange
-- final (drop des colonnes uuid) est une migration ultérieure. FK triviales à la création
-- (colonnes vides). Index créés sur colonnes vides = rapides.

-- AlterTable
ALTER TABLE "coop"."activites" ADD COLUMN     "structure_employeuse_main_id" INTEGER;

-- AlterTable
ALTER TABLE "coop"."employes_structures" ADD COLUMN     "structure_main_id" INTEGER;

-- CreateIndex
CREATE INDEX "activites_structure_employeuse_main_id_idx" ON "coop"."activites"("structure_employeuse_main_id");

-- CreateIndex
CREATE INDEX "employes_structures_structure_main_id_idx" ON "coop"."employes_structures"("structure_main_id");

-- AddForeignKey
ALTER TABLE "coop"."employes_structures" ADD CONSTRAINT "employes_structures_structure_main_id_fkey" FOREIGN KEY ("structure_main_id") REFERENCES "main"."structure_administrative"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coop"."activites" ADD CONSTRAINT "activites_structure_employeuse_main_id_fkey" FOREIGN KEY ("structure_employeuse_main_id") REFERENCES "main"."structure_administrative"("id") ON DELETE SET NULL ON UPDATE CASCADE;

