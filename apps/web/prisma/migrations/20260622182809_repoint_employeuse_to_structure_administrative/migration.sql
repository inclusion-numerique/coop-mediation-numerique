-- Incrément 1a.2 : bascule du rôle EMPLOYEUSE de `structures` vers `structure_administrative`.
-- 1) crée une structure_administrative (id = structures.id) pour chaque structure
--    employeuse (référencée par un emploi/une activité, ou portant un siret),
-- 2) swap des FK employeuse `employes_structures` / `activites` vers structure_administrative.
--
-- Aucun repoint de valeurs : en réutilisant `id = structures.id`, les colonnes
-- `structure_id` / `structure_employeuse_id` égalent déjà l'id de la SA créée.
-- L'id partagé n'est qu'un mécanisme de migration des données legacy ; il n'est lu
-- nulle part (les lecteurs corrèlent employeuse <-> lieu par similitude nom + adresse).
-- L'ordre DROP-avant-ADD des FK est obligatoire (l'ancienne contrainte vise `structures`).
-- Prérequis : 1a.1 appliqué (table structure_administrative créée).

-- 1. Créer une SA (id = structures.id) pour chaque structure jouant le rôle employeuse.
INSERT INTO "coop"."structure_administrative"
  ("id", "siret", "rna", "denomination", "synchronisation_siret", "nom", "adresse",
   "commune", "code_postal", "code_insee", "complement_adresse", "nom_referent",
   "courriel_referent", "telephone_referent", "source", "creation", "modification")
SELECT s."id", s."siret", s."rna", s."nom_usage", s."synchronisation_siret",
   COALESCE(s."nom", ''), COALESCE(s."adresse", ''), COALESCE(s."commune", ''),
   COALESCE(s."code_postal", ''), s."code_insee", s."complement_adresse",
   s."nom_referent", s."courriel_referent", s."telephone_referent", 'coop', now(), now()
FROM "coop"."structures" s
WHERE
  s."siret" IS NOT NULL
  OR EXISTS (SELECT 1 FROM "coop"."employes_structures" es WHERE es."structure_id" = s."id")
  OR EXISTS (SELECT 1 FROM "coop"."activites" a WHERE a."structure_employeuse_id" = s."id");

-- 2. Swap des contraintes FK employeuse : structures -> structure_administrative.
ALTER TABLE "coop"."employes_structures"
  DROP CONSTRAINT "employes_structures_structure_id_fkey";
ALTER TABLE "coop"."activites"
  DROP CONSTRAINT "activites_structure_employeuse_id_fkey";

ALTER TABLE "coop"."employes_structures"
  ADD CONSTRAINT "employes_structures_structure_id_fkey"
  FOREIGN KEY ("structure_id") REFERENCES "coop"."structure_administrative"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "coop"."activites"
  ADD CONSTRAINT "activites_structure_employeuse_id_fkey"
  FOREIGN KEY ("structure_employeuse_id") REFERENCES "coop"."structure_administrative"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
