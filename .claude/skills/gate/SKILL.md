---
name: gate
description: >-
  Exécuter la séquence de gate du dépôt avant un commit (tsc → biome → tests ciblés) puis committer avec
  la discipline du repo (stage de chemins PRÉCIS, jamais git add -A ; conventional commit ; retry
  gpg). À utiliser pour figer proprement un incrément.
---

# /gate — gate + commit discipliné (§8 PR-4…PR-8)

## Séquence (dans l'ordre, s'arrêter au premier rouge)

1. **Types** : `pnpm -F web tsc`.
2. **Lint/format** : `pnpm exec biome check --write <fichiers modifiés>` (chemins précis, pas tout le dépôt).
3. **Tests ciblés** selon ce qui a changé :
   - unit : `pnpm -F web test <chemin>` (sans `--` : Vitest ignore ce qui le suit et lance toute la suite)
   - intégration : `pnpm -F web test:integration <chemin>`, **jamais sur la base de travail** : `DATABASE_URL` pointé sur une base jetable du conteneur 5433, migrée (`pnpm -F web db:migrate-deploy`) et chargée (`pnpm -F @app/fixtures load`), capée avec `&connection_limit=3` (TS-7), supprimée ensuite
   - BDD : `pnpm -F web test:cucumber` (suite entière — le scope par chemin en arg ne marche pas, TS-5), sur la même base jetable
   - E2E si pertinent : `pnpm test:e2e`
4. Tout vert → proposer le commit.

## Commit (discipline — PR-5/PR-6/PR-8)

- **Stager des chemins PRÉCIS** `apps/web/...` / `packages/...`. **JAMAIS `git add -A`** (sinon `scripts/`, fichiers jetables → casse lint-staged).
- Vérifier le staging : `git status --short | grep -v '^??'` — confirmer que seuls les fichiers voulus sont indexés (les changements parallèles de l'humain restent hors du commit sauf accord).
- Message **Conventional Commits** : `type(scope)?: description` au présent ; corps = le **pourquoi** + le quoi en termes d'archi (pas la liste des fichiers). Types : `refactor`/`fix`/`test`/`feat`/`chore`.
- Sur une branche (pas `main` — un merge sur `main` déclenche un déploiement prod). Brancher si besoin.
- Si gpg `signing failed` (pinentry) : **ne pas contourner** ; demander à l'humain de déverrouiller l'agent gpg (`! echo test | gpg --clearsign > /dev/null`) puis rejouer le **même** `git commit`.
- Les hooks tournent au commit (Biome sur les fichiers indexés, gitleaks, commitlint) : ne jamais les contourner (`--no-verify` interdit).

## Garde-fous
- Ne committer que si l'humain a donné le go (PR-2, point d'arrêt B).
- Verify-before-delete (PR-3) : si l'incrément supprime du code, confirmer que le remplaçant existe **et** est câblé avant de figer.
