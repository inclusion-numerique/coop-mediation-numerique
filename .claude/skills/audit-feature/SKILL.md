---
name: audit-feature
description: >-
  Auditer une feature entière contre le standard COOP et restituer un état de conformité + ce qu'il
  reste à faire (résidus réels vs acceptable). Lance l'agent feature-auditor puis synthétise et
  priorise. À utiliser pour « où en est la feature X ? » ou avant de la déclarer feature-modèle.
---

# /audit-feature — où en est une feature vs le standard

Argument : le **nom de la feature** (ex. `beneficiaire`). À défaut, demande-le.

## Procédure

1. **Lancer l'agent `feature-auditor`** sur la feature (si non enregistré comme subagent type, l'émuler : agent générique lisant `.claude/agents/feature-auditor.md` + la spec).
2. **Synthétiser** son rapport pour l'humain :
   - Statut par dimension (§1–§7) en une ligne.
   - **Résidus réels priorisés** (BLOCKER d'abord), chacun avec l'action concrète.
   - **Acceptable en l'état** (bloc séparé — ne pas faire courir après de faux problèmes : §9, ou logique absente donc pas de spec, TS-2).
   - **Hors périmètre** : résidus appartenant à une autre feature (rdvsp, activites…).
   - **Verdict** : feature-modèle ? oui / non (N résidus, X BLOCKER).
3. Ne **rien corriger** ici — l'audit est en lecture seule. Si l'humain veut traiter un résidu → c'est une nouvelle tranche (`/migrate-ability` ou une correction ciblée, avec sa propre auto-revue + gate).

## Rappels
- Spec = `.claude/conventions/feature-architecture.md`. Citer les IDs.
- Ne jamais signaler les divergences assumées (§9).
