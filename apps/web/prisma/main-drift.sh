#!/usr/bin/env bash
#
# Garde anti-dérive des tables `main.*` de l'Entrepôt dont dépend la coop
# (`structure_administrative`, `adresse`). Ces tables sont possédées par le Dataspace et gérées
# par Flyway (ADR-002) : on les modélise dans `schema.prisma` sans les migrer. Si Flyway les fait
# évoluer, notre client Prisma peut casser silencieusement. Ce script compare l'introspection
# actuelle de `main` au snapshot de référence committé (`prisma/main.reference.prisma`).
#
# Lecture seule : `prisma db pull` ne lit que le catalogue (types/colonnes/contraintes), aucune
# donnée. À lancer EN LOCAL contre DATABASE_URL, jamais en CI (pas d'accès prod depuis la CI).
#
#   pnpm -F web db:check-main-drift      # échoue si main a dérivé du snapshot
#   pnpm -F web db:refresh-main-reference # régénère le snapshot après une évolution Flyway légitime
#
set -euo pipefail

MODE="${1:-check}"
WEB_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REF="$WEB_DIR/prisma/main.reference.prisma"
MODELS_REGEX='/^model (structure_administrative|adresse) \{/,/^\}/'

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# `reference` est inclus car des tables de `main` (hors de notre périmètre) ont des FK vers ce
# schéma : sans lui, `db pull` échoue (P4002). On n'extrait ensuite que nos deux modèles.
cat > "$TMP/pull.prisma" <<'PRISMA'
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["main", "reference"]
}
PRISMA

# Introspecte le schéma `main` réel (catalogue uniquement).
(cd "$WEB_DIR" && pnpm --silent with-env prisma db pull --schema "$TMP/pull.prisma" >/dev/null)
awk "$MODELS_REGEX" "$TMP/pull.prisma" > "$TMP/current.models"

REF_HEADER='// Snapshot de référence de l'\''introspection Prisma des tables `main.*` dont dépend la coop.
// Généré par `pnpm -F web db:refresh-main-reference`. NE PAS éditer à la main.
// Sert de base de comparaison à `pnpm -F web db:check-main-drift` (garde anti-dérive Flyway, ADR-002).
'

if [ "$MODE" = "refresh" ]; then
  { printf '%s\n' "$REF_HEADER"; cat "$TMP/current.models"; } > "$REF"
  echo "✓ Snapshot de référence régénéré : $REF"
  exit 0
fi

if [ ! -f "$REF" ]; then
  echo "✗ Snapshot de référence absent ($REF). Lance : pnpm -F web db:refresh-main-reference" >&2
  exit 1
fi

awk "$MODELS_REGEX" "$REF" > "$TMP/ref.models"

if diff -u "$TMP/ref.models" "$TMP/current.models"; then
  echo "✓ Aucune dérive : main.structure_administrative / main.adresse == snapshot de référence."
  exit 0
fi

echo "" >&2
echo "✗ DÉRIVE détectée entre le schéma main réel et le snapshot de référence (diff ci-dessus)." >&2
echo "  Si l'évolution Flyway est légitime, mets à jour les modèles main de schema.prisma en" >&2
echo "  conséquence, puis régénère le snapshot : pnpm -F web db:refresh-main-reference" >&2
exit 1
