#!/usr/bin/env bash
set -euo pipefail

RACINE="$(cd "$(dirname "$0")/.." && pwd)"

MIGRATIONS_MAIN=(
  "20260722155232_baseline_main_external|main.structure_administrative"
  "20260723171939_ajouter_personne_affectations_contrat_main|main.personne"
)

baseline_necessaire() {
  local migration="$1" sentinelle="$2"
  (cd "$RACINE" && pnpm --silent with-env prisma db execute --stdin) >/dev/null 2>&1 <<SQL
DO \$\$
DECLARE
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
    (cd "$RACINE" && pnpm --silent with-env prisma migrate resolve --applied "$migration" >/dev/null)
    echo "  ✓ $migration marquée appliquée ($sentinelle déjà posée par le DDL Dataspace)"
    baselinees=$((baselinees + 1))
  fi
done

if [ "$baselinees" -eq 0 ]; then
  echo "✓ Rien à baseliner : les migrations main sont appliquées, ou main reste à créer."
fi
