-- Repair addresses with "null" string in structures.adresse column.
-- The bug was caused by APIs returning the string "null" instead of JSON null,
-- which was not filtered out before concatenation.

-- Fix addresses that start with "null" (with optional comma and spaces)
UPDATE "structures"
SET 
  "adresse" = TRIM(regexp_replace("adresse", '^null[,\s]+', '', 'i')),
  "modification" = CURRENT_TIMESTAMP
WHERE 
  "adresse" ILIKE 'null%';