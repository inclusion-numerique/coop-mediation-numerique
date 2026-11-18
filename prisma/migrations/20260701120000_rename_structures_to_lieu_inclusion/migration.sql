-- Inc. 2a du split : renomme la table `structures` -> `lieu_inclusion` pour s'aligner sur
-- `main.lieu_inclusion` (Entrepôt) et préparer la synchro quotidienne coop <-> main.
--
-- RENAME SEUL : aucune colonne n'est supprimée ici. Le drop des colonnes employeuse
-- dupliquées (siret, rna, nom_usage, synchronisation_siret, *_referent) = incrément 2b,
-- conditionné à la migration des lecteurs SIRET de la fiche lieu (features/lieux-activite).
--
-- Les FK entrantes restantes (`mediateurs_en_activite.structure_id`, `activites.structure_id`)
-- suivent le rename automatiquement (référence par OID). Le nom du modèle Prisma reste
-- `Structure` (via @@map) — son renommage éventuel est du rework Phase 2.
-- Prérequis : 1a.2 appliqué (le rôle employeuse pointe déjà vers structure_administrative).

ALTER TABLE "coop"."structures" RENAME TO "lieu_inclusion";

-- Alignement des noms d'index/contraintes sur la convention Prisma dérivée du nouveau nom
-- de table (évite un drift au prochain `prisma migrate dev`).
ALTER INDEX "coop"."structures_pkey" RENAME TO "lieu_inclusion_pkey";
ALTER INDEX "coop"."structures_creation_id_key" RENAME TO "lieu_inclusion_creation_id_key";
ALTER INDEX "coop"."structures_creation_id_idx" RENAME TO "lieu_inclusion_creation_id_idx";
ALTER INDEX "coop"."structures_id_cartographie_nationale_idx" RENAME TO "lieu_inclusion_id_cartographie_nationale_idx";
ALTER INDEX "coop"."structures_activites_count_asc_idx" RENAME TO "lieu_inclusion_activites_count_asc_idx";
ALTER INDEX "coop"."structures_activites_count_desc_idx" RENAME TO "lieu_inclusion_activites_count_desc_idx";
ALTER INDEX "coop"."structures_v1_structure_id_idx" RENAME TO "lieu_inclusion_v1_structure_id_idx";
ALTER INDEX "coop"."structures_v1_permanence_id_idx" RENAME TO "lieu_inclusion_v1_permanence_id_idx";
ALTER INDEX "coop"."structures_code_insee_idx" RENAME TO "lieu_inclusion_code_insee_idx";
ALTER INDEX "coop"."idx_structures_not_deleted" RENAME TO "idx_lieu_inclusion_not_deleted";

ALTER TABLE "coop"."lieu_inclusion" RENAME CONSTRAINT "structures_creation_par_id_fkey" TO "lieu_inclusion_creation_par_id_fkey";
ALTER TABLE "coop"."lieu_inclusion" RENAME CONSTRAINT "structures_derniere_modification_par_id_fkey" TO "lieu_inclusion_derniere_modification_par_id_fkey";
ALTER TABLE "coop"."lieu_inclusion" RENAME CONSTRAINT "structures_suppression_par_id_fkey" TO "lieu_inclusion_suppression_par_id_fkey";
