---
name: gate
description: >-
  Exécuter la séquence de gate COOP avant un commit (tsc → biome → tests ciblés) puis committer avec
  la discipline du repo (stage de chemins PRÉCIS, jamais git add -A ; conventional commit ; retry
  gpg). À utiliser pour figer proprement un incrément.
---

# /gate — gate + commit discipliné (§8 PR-4…PR-8)

## Séquence (dans l'ordre, s'arrêter au premier rouge)

1. **Types** : `pnpm -F web tsc`.
2. **Lint/format** : `pnpm biome check --write <fichiers modifiés>` (chemins précis, pas tout le repo).
3. **Tests ciblés** selon ce qui a changé :
   - unit : `pnpm -F web test -- <chemin>`
   - intégration : `pnpm -F web test:integration -- <chemin>` (DB ; capper `DATABASE_URL` avec `&connection_limit=3` si « too many clients », TS-7)
   - BDD : `pnpm -F web test:cucumber` (suite entière — le scope par chemin en arg ne marche pas, TS-5 ; DB 5433)
   - E2E si pertinent : `pnpm test:e2e`
4. Tout vert → proposer le commit.

## Commit (discipline — PR-5/PR-6/PR-8)

- **Stager des chemins PRÉCIS** `apps/web/...` / `packages/...`. **JAMAIS `git add -A`** (sinon `scripts/`, fichiers jetables → casse lint-staged).
- Vérifier le staging : `git status --short | grep -v '^??'` — confirmer que seuls les fichiers voulus sont indexés (les changements parallèles de l'humain restent hors du commit sauf accord).
- Message **Conventional Commits** : `type(scope)?: description` au présent ; corps = le **pourquoi** + le quoi en termes d'archi (pas la liste des fichiers). Types : `refactor`/`fix`/`test`/`feat`/`chore`.
- Sur une branche (pas `main` — un merge sur `main` déclenche un déploiement prod). Brancher si besoin.
- Si gpg `signing failed` (pinentry) : **ne pas contourner** ; demander à l'humain de déverrouiller l'agent gpg puis rejouer le **même** `git commit`.

## Garde-fous
- Ne committer que si l'humain a donné le go (PR-2, point d'arrêt B).
- Verify-before-delete (PR-3) : si l'incrément supprime du code, confirmer que le remplaçant existe **et** est câblé avant de figer.
