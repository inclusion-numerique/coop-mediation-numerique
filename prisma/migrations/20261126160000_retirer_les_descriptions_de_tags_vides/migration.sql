UPDATE "coop"."tags" SET "description" = NULL WHERE btrim("description") = '';

ALTER TABLE "coop"."tags" ADD CONSTRAINT "tags_description_non_vide" CHECK ("description" IS NULL OR btrim("description") <> '');
