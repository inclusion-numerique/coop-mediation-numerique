CREATE INDEX idx_beneficiaires_v1_imported_null
ON beneficiaires (id)
WHERE v1_imported IS NULL;