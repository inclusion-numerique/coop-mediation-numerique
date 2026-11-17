-- L'effacement complet d'un compte se journalise comme les autres mutations, avec le CONSTAT
-- d'effacement en `data` : quelles charges ont abouti, lesquelles ont échoué.
--
-- C'est un événement daté et non un état du compte, d'où sa place ici plutôt qu'en colonne sur
-- `users` — et c'est ce journal que lira la reprise des effacements laissés incomplets.
--
-- `ADD VALUE` est idempotent depuis PG 12 avec `IF NOT EXISTS`, ce qui rend la migration rejouable
-- sur une base déjà à jour (restauration locale d'une copie de production, notamment).
ALTER TYPE "coop"."mutation_name" ADD VALUE IF NOT EXISTS 'supprimer_compte';
