#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-check}"
RACINE="$(cd "$(dirname "$0")/.." && pwd)"
REF="$RACINE/prisma/main.reference.prisma"
MODELS_REGEX='/^model (structure_administrative|adresse|lieu_inclusion) \{/,/^\}/'

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

cat > "$TMP/pull.prisma" <<'PRISMA'
datasource db {
  provider = "postgresql"
  schemas  = ["main", "reference"]
}
PRISMA

(cd "$RACINE" && pnpm --silent with-env prisma db pull --schema "$TMP/pull.prisma" >/dev/null)
awk "$MODELS_REGEX" "$TMP/pull.prisma" > "$TMP/current.models"

REF_HEADER='// Snapshot de référence de l'\''introspection Prisma des tables `main.*` dont dépend la coop.
// Généré par `pnpm db:refresh-main-reference`. NE PAS éditer à la main.
// Sert de base de comparaison à `pnpm db:check-main-drift` (garde anti-dérive Flyway, ADR-002).
'

if [ "$MODE" = "refresh" ]; then
  { printf '%s\n' "$REF_HEADER"; cat "$TMP/current.models"; } > "$REF"
  echo "✓ Snapshot de référence régénéré : $REF"
  exit 0
fi

if [ ! -f "$REF" ]; then
  echo "✗ Snapshot de référence absent ($REF). Lance : pnpm db:refresh-main-reference" >&2
  exit 1
fi

awk "$MODELS_REGEX" "$REF" > "$TMP/ref.models"

if diff -u "$TMP/ref.models" "$TMP/current.models"; then
  echo "✓ Aucune dérive : structure_administrative / adresse / lieu_inclusion == snapshot."
  exit 0
fi

echo "" >&2
echo "✗ DÉRIVE détectée entre le schéma main réel et le snapshot de référence (diff ci-dessus)." >&2
echo "  Si l'évolution Flyway est légitime, mets à jour les modèles main de schema.prisma en" >&2
echo "  conséquence, puis régénère le snapshot : pnpm db:refresh-main-reference" >&2
exit 1
