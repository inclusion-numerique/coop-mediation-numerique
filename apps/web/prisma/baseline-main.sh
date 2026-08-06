#!/usr/bin/env bash
#
# Baseline des migrations `main.*` sur une base qui porte DÉJÀ le schéma `main` (ADR-002).
#
# Les tables `main.*` sont possédées par le Dataspace et gérées par Flyway : nos migrations qui les
# modélisent n'ont pas d'`IF NOT EXISTS` et ne doivent jamais s'exécuter là où `main` existe déjà.
# Trois situations coexistent :
#
#   - CI / environnements de preview : base vide, `main` est créé par les migrations -> deploy normal.
#   - docker local (`docker:reset`)  : `docker/initdb/01-dataspace-ddl.sql` pose le vrai DDL Dataspace
#                                      à la création du volume, avant toute migration.
#   - restauration locale d'un dump prod (`cli backup:locally-restore-latest-main`) : `main` ET
#                                      l'historique Prisma de la prod reviennent avec le dump.
#
# Règle appliquée, migration par migration : si elle n'est pas enregistrée comme appliquée alors que
# ses tables existent déjà, on la marque appliquée — exactement ce que l'étape 1 du runbook ADR-002
# fait à la main sur la prod. Sinon on ne touche à rien : la migration doit s'exécuter (base vide),
# ou elle est déjà appliquée.
#
# Rattrape aussi une migration `main` en échec (P3018, « relation already exists ») laissée par un
# `prisma migrate deploy` lancé sans baseline préalable : elle est ré-enregistrée comme appliquée.
#
# Appelé automatiquement par `pnpm -F web db:migrate-deploy`, avant `prisma migrate deploy`.
# La prod, elle, déploie via `prisma migrate deploy` en direct (.circleci/config.yml) : elle n'est
# pas concernée, son baseline reste la décision humaine décrite par le runbook.
set -euo pipefail

WEB_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# `migration|table sentinelle` : la table dont l'existence prouve que le DDL Flyway est déjà posé.
# À compléter si une nouvelle migration modélise des tables `main.*` du DDL Dataspace.
MIGRATIONS_MAIN=(
  "20260722155232_baseline_main_external|main.structure_administrative"
  "20260723171939_ajouter_personne_affectations_contrat_main|main.personne"
)

# `prisma db execute` ne restitue aucun résultat : on encode le prédicat dans le code de sortie
# (`RAISE EXCEPTION` => sortie non nulle). Évite d'exiger un client psql sur la machine.
# Sortie 0 = la migration doit être marquée appliquée.
baseline_necessaire() {
  local migration="$1" sentinelle="$2"
  (cd "$WEB_DIR" && pnpm --silent with-env prisma db execute --schema ./prisma/schema.prisma --stdin) >/dev/null 2>&1 <<SQL
DO \$\$
DECLARE
  -- L'historique vit dans \`coop\` (déplacé par move-prisma-migrations-to-coop.sql), dans \`public\`
  -- tant que le déplacement n'a pas eu lieu, ou nulle part sur une base jamais migrée.
  historique regclass := coalesce(to_regclass('coop._prisma_migrations'), to_regclass('public._prisma_migrations'));
  appliquee boolean := false;
BEGIN
  IF to_regclass('${sentinelle}') IS NULL THEN
    RAISE EXCEPTION 'tables absentes : la migration doit s''exécuter';
  END IF;

  IF historique IS NOT NULL THEN
    EXECUTE format(
      'SELECT EXISTS (SELECT 1 FROM %s WHERE migration_name = %L AND finished_at IS NOT NULL AND rolled_back_at IS NULL)',
      historique, '${migration}'
    ) INTO appliquee;
  END IF;

  IF appliquee THEN
    RAISE EXCEPTION 'déjà appliquée';
  END IF;
END
\$\$;
SQL
}

baselinees=0
for entree in "${MIGRATIONS_MAIN[@]}"; do
  migration="${entree%%|*}"
  sentinelle="${entree##*|}"

  if baseline_necessaire "$migration" "$sentinelle"; then
    (cd "$WEB_DIR" && pnpm --silent with-env prisma migrate resolve --applied "$migration" >/dev/null)
    echo "  ✓ $migration marquée appliquée ($sentinelle déjà posée par le DDL Dataspace)"
    baselinees=$((baselinees + 1))
  fi
done

if [ "$baselinees" -eq 0 ]; then
  echo "✓ Rien à baseliner : les migrations main sont appliquées, ou main reste à créer."
fi
