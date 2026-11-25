#!/usr/bin/env bash
set -euo pipefail

sortie=coverage-total

rm -rf "$sortie"
mkdir -p "$sortie/rapport"
lcov --quiet --rc branch_coverage=1 --ignore-errors inconsistent,inconsistent $(printf -- '--add-tracefile %s ' "$@") --output-file "$sortie/lcov.info"
sed "s#^SF:src/#SF:$PWD/src/#" "$sortie/lcov.info" > "$sortie/lcov-absolu.info"
genhtml --quiet --rc branch_coverage=1 --ignore-errors inconsistent,inconsistent,category,category --hierarchical \
  --title "La Coop de la médiation numérique" --prefix "$PWD" \
  --output-directory "$sortie/rapport" "$sortie/lcov-absolu.info" >&2
