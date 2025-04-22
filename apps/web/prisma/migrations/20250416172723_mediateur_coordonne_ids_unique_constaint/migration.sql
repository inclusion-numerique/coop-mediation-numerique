-- Step 1: Delete duplicates, keeping only the one with the most recent `modification`
DELETE FROM "mediateurs_coordonnes"
WHERE id IN (
	SELECT id FROM (
					   SELECT id,
							  ROW_NUMBER() OVER (
								  PARTITION BY coordinateur_id, mediateur_id
								  ORDER BY modification DESC
								  ) AS row_num
					   FROM "mediateurs_coordonnes"
				   ) t
	WHERE t.row_num > 1
);

-- Step 2: Add the unique constraint
CREATE UNIQUE INDEX "mediateurs_coordonnes_coordinateur_id_mediateur_id_key" ON "mediateurs_coordonnes"("coordinateur_id", "mediateur_id");
