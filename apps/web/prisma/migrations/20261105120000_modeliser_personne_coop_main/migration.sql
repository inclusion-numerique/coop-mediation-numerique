DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_attribute
    WHERE attrelid = to_regclass('main.personne')
      AND attname = 'conseiller_numerique_id'
      AND attnum > 0
      AND NOT attisdropped
  ) THEN
    ALTER TABLE "main"."personne" ADD COLUMN "conseiller_numerique_id" VARCHAR(50);
    CREATE UNIQUE INDEX "personne_conseiller_numerique_id_ukey" ON "main"."personne"("conseiller_numerique_id");
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_attribute
    WHERE attrelid = to_regclass('main.personne')
      AND attname = 'aidant_connect_id'
      AND attnum > 0
      AND NOT attisdropped
  ) THEN
    ALTER TABLE "main"."personne" ADD COLUMN "aidant_connect_id" INTEGER;
    CREATE UNIQUE INDEX "personne_aidant_connect_id_ukey" ON "main"."personne"("aidant_connect_id");
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_attribute
    WHERE attrelid = to_regclass('main.personne')
      AND attname = 'is_visible'
      AND attnum > 0
      AND NOT attisdropped
  ) THEN
    ALTER TABLE "main"."personne" ADD COLUMN "is_visible" BOOLEAN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_attribute
    WHERE attrelid = to_regclass('main.personne')
      AND attname = 'updated_at_coop'
      AND attnum > 0
      AND NOT attisdropped
  ) THEN
    ALTER TABLE "main"."personne" ADD COLUMN "updated_at_coop" TIMESTAMP(6);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_attribute
    WHERE attrelid = to_regclass('main.personne')
      AND attname = 'edited_by'
      AND attnum > 0
      AND NOT attisdropped
  ) THEN
    ALTER TABLE "main"."personne" ADD COLUMN "edited_by" VARCHAR(50);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_attribute
    WHERE attrelid = to_regclass('main.personne')
      AND attname = 'deleted_by'
      AND attnum > 0
      AND NOT attisdropped
  ) THEN
    ALTER TABLE "main"."personne" ADD COLUMN "deleted_by" TEXT[];
  END IF;
END
$$;
