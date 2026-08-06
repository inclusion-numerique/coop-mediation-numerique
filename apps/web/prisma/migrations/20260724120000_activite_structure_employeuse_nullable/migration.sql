-- ADR-002 (périmètre élargi) : l'employeuse d'une activité passe désormais par main
-- (`structure_employeuse_main_id`). On rend `structure_employeuse_id` (coop) nullable pour que le
-- nouveau code cesse de l'écrire, sans casser l'ancien (qui peut encore le remplir pendant la
-- transition). La colonne + la FK coop sont conservées, drop à l'échange final.
ALTER TABLE "coop"."activites" ALTER COLUMN "structure_employeuse_id" DROP NOT NULL;
