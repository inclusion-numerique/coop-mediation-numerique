-- We migrate to RDV service public from rdv aide numérique so old credentials are no longer valid
DELETE FROM "rdv_accounts";

UPDATE "beneficiaires" SET "rdv_service_public_id" = NULL;
