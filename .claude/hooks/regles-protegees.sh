#!/usr/bin/env bash
set -euo pipefail

commande=$(jq -r '.tool_input.command // empty')

if grep -qE '(biome\.jsonc?|\.alint\.ya?ml|\.dependency-cruiser|lint:imports:tables|pending_deployments|regles-d-architecture)' <<<"$commande"; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "ask",
      permissionDecisionReason: "Cette commande touche une règle d’architecture (Biome, alint ou dependency-cruiser) ou son approbation : Marc valide chaque changement de règle."
    }
  }'
fi
