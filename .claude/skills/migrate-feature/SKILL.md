---
name: migrate-feature
description: >-
  Migrer une feature ENTIÈRE au standard COOP, verticalement, ability par ability. Décompose la
  feature, ordonne les abilities, modélise le domaine partagé (domain-modeler), puis boucle
  /migrate-ability sur chacune, gère la coexistence ancien/nouveau, et finit par un audit. À lancer
  pour migrer une feature complète.
---

# /migrate-feature — migration verticale d'une feature complète

Orchestre la migration d'une feature de bout en bout (cf. `refactor/03-etapes.md` étapes 1–3 et
`refactor/05-feature-decomposition.md`). **Une ability = 1 PR.** Tu délègues l'essentiel au skill
`/migrate-ability` ; ce skill-ci gère le **découpage, l'ordre, le domaine partagé et le nettoyage final**.

Argument : le **nom de la feature**. Référentiel : `.claude/conventions/feature-architecture.md`.

## Points d'arrêt humains (PR-2)
- **A. Après décomposition** : valider la liste d'abilities + l'ordre.
- **B. Modèle de domaine** : valider la proposition `domain-modeler`.
- (+ les arrêts internes à chaque `/migrate-ability`.)

## Étapes

1. **Décomposer.** Lister les abilities de la feature (cas d'usage). Si `refactor/05` la mappe déjà, partir de là ; sinon proposer le découpage. Définir l'**ordre** (petite/claire d'abord ; mutations avant queries si priorité). Repérer le legacy (router tRPC, `src/<feature>/`, routes, composants) et ses consommateurs (grep `apps/web/src` **et** `packages/`). → **attendre (A)**.
2. **Modéliser le domaine partagé.** Lancer **`domain-modeler`** une fois pour la feature → présenter + trancher les questions ouvertes → **attendre (B)**. Puis créer `domain/` (VO, entité, errors, index) et le **transfer layer** `db/` + round-trip (DM-10/TS-4).
3. **Boucler `/migrate-ability`** sur chaque ability, dans l'ordre. Chacune fait sa propre implémentation → auto-revue (`convention-reviewer`) → gate → commit. **Coexistence** : le router tRPC / REST appelle progressivement l'ability ; ne supprime rien sans remplaçant câblé (PR-3).
4. **Nettoyage final.** Quand toutes les abilities sont migrées : supprimer le code legacy mort (verify-before-delete), vider puis retirer le router tRPC de `appRouter.ts`, éliminer le namespace legacy.
5. **Audit.** Lancer **`/audit-feature`** → viser **0 résidu réel** (feature-modèle). Consigner en mémoire les nouveaux retours récurrents éventuels.

## Garde-fous
- Migration **incrémentale, prod intacte**, tests existants verts à chaque PR (PR-1/PR-7).
- Calibrer l'effort DDD au sous-domaine (AR-6) — ne pas sur-modéliser une feature Supporting/Generic.
