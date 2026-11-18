DO $$
BEGIN
  IF to_regclass('main.formation') IS NULL THEN
    CREATE TABLE "main"."formation" (
        "id" SERIAL NOT NULL,
        "personne_id" INTEGER NOT NULL,

        CONSTRAINT "formation_pkey" PRIMARY KEY ("id")
    );
    CREATE INDEX "formation_personne_id_idx" ON "main"."formation"("personne_id");
    ALTER TABLE "main"."formation" ADD CONSTRAINT "formation_personne_id_fkey" FOREIGN KEY ("personne_id") REFERENCES "main"."personne"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF to_regclass('main.poste') IS NULL THEN
    CREATE TABLE "main"."poste" (
        "id" SERIAL NOT NULL,
        "poste_conum_id" INTEGER NOT NULL,
        "structure_id" INTEGER,
        "personne_id" INTEGER,

        CONSTRAINT "poste_pkey" PRIMARY KEY ("id")
    );
    CREATE UNIQUE INDEX "poste_ukey" ON "main"."poste"("poste_conum_id", "structure_id", "personne_id");
    ALTER TABLE "main"."poste" ADD CONSTRAINT "poste_personne_id_fkey" FOREIGN KEY ("personne_id") REFERENCES "main"."personne"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    ALTER TABLE "main"."poste" ADD CONSTRAINT "poste_structure_id_fkey" FOREIGN KEY ("structure_id") REFERENCES "main"."structure_administrative"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
  END IF;
END
$$;
