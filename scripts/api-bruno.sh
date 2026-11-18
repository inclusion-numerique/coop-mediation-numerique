#!/usr/bin/env bash
set -euo pipefail

sortie=.bruno

rm -rf "$sortie"
pnpm dlx --allow-build=protobufjs @usebruno/cli@4.3.0 import openapi \
  --source src/app/api/v1/documentation/v1.openapi.json \
  --output "$sortie" \
  --collection-format bru \
  --collection-name "La coop - API"

for environnement in "$sortie"/environments/*.bru; do
  printf '\nvars:secret [\n  token\n]\n' >> "$environnement"
done
