DO $$ BEGIN
  IF to_regclass('main.conseiller_numerique_en_poste') IS NOT NULL THEN
    RAISE EXCEPTION 'main.conseiller_numerique_en_poste est déjà posée (Flyway / DDL Dataspace) : cette migration doit être marquée appliquée, pas exécutée. Utilise `pnpm db:migrate-deploy` (baseline automatique) au lieu de `prisma migrate deploy`.';
  END IF;
END $$;

CREATE VIEW main.conseiller_numerique_en_poste AS
SELECT DISTINCT personne_id
FROM main.personne_affectations_emploi pae
WHERE source::text = 'idposte'::text AND est_active = true;
