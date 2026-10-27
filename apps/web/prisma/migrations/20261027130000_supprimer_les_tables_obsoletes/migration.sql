SET lock_timeout = '10s';

ALTER TABLE "coop"."users" DROP CONSTRAINT "users_image_id_fkey";

ALTER TABLE "coop"."images" DROP CONSTRAINT "images_upload_key_fkey";

ALTER TABLE "coop"."uploads" DROP CONSTRAINT "uploads_uploaded_by_id_fkey";

ALTER TABLE "coop"."employes_structures" DROP CONSTRAINT "employes_structures_user_id_fkey";

ALTER TABLE "coop"."employes_structures" DROP CONSTRAINT "employes_structures_structure_id_fkey";

ALTER TABLE "coop"."employes_structures" DROP CONSTRAINT "employes_structures_structure_main_id_fkey";

ALTER TABLE "coop"."employes_structures" DROP CONSTRAINT "employes_structures_creation_par_id_fkey";

ALTER TABLE "coop"."employes_structures" DROP CONSTRAINT "employes_structures_modification_par_id_fkey";

ALTER TABLE "coop"."employes_structures" DROP CONSTRAINT "employes_structures_suppression_par_id_fkey";

ALTER TABLE "coop"."activites" DROP CONSTRAINT "activites_structure_employeuse_id_fkey";

ALTER TABLE "coop"."rdv_user_profiles" DROP CONSTRAINT "rdv_user_profiles_organisation_id_fkey";

ALTER TABLE "coop"."rdv_user_profiles" DROP CONSTRAINT "rdv_user_profiles_user_id_fkey";

ALTER TABLE "coop"."rdv_webhook_endpoints" DROP CONSTRAINT "rdv_webhook_endpoints_organisation_id_fkey";

DROP INDEX "coop"."users_image_id_key";

DROP INDEX "coop"."activites_structure_employeuse_id_idx";

ALTER TABLE "coop"."users" DROP COLUMN "image_id";

ALTER TABLE "coop"."activites" DROP COLUMN "structure_employeuse_id";

DROP TABLE "coop"."images";

DROP TABLE "coop"."uploads";

DROP TABLE "coop"."structure_administrative";

DROP TABLE "coop"."employes_structures";

DROP TABLE "coop"."rdv_user_profiles";

DROP TABLE "coop"."rdv_webhook_endpoints";

DROP TABLE IF EXISTS "coop"."v1_repair_beneficiaire_rn";

DROP TABLE IF EXISTS "coop"."v1_repair_cra_lieux";

DROP TABLE IF EXISTS "coop"."v1_repair_current_batch";

DROP TABLE IF EXISTS "coop"."v1_repair_status_assignments";

DROP TABLE IF EXISTS "coop"."v1_repair_status_expansion";
