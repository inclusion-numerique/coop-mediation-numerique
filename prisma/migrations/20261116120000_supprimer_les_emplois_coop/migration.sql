SET lock_timeout = '10s';

ALTER TABLE "coop"."activites" DROP COLUMN "structure_employeuse_id";

DROP TABLE "coop"."employes_structures";

DROP TABLE "coop"."structure_administrative";
