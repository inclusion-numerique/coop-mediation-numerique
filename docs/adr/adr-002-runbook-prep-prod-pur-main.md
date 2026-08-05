# ADR-002 — Runbook prep prod « bascule pur main »

Prépare la prod (Entrepôt partagé) à recevoir le code qui lit l'employeuse **uniquement
depuis `main`** (`coop.users → main.personne → affectations → structure_administrative`),
sans résidu de lecture des SA coop.

**Toutes les écritures visent une base partagée (Entrepôt). Précautions systématiques :**

- Confirmer la cible (`DATABASE_URL` → prod) **avant** toute écriture.
- Chaque job est **dry-run par défaut** → relire le CSV (`output/audit-structures/…`) →
  `apply` avec `'{"dryRun":false}'` seulement après validation.
- Tous les jobs sont **idempotents** : un re-dry-run après apply doit retomber à ~0.
- Les migrations sont **backward-compatible** (colonnes ajoutées, `NOT NULL` retiré) :
  la prep peut passer **avant** le déploiement du code, l'ancien code continue de tourner.
- Répéter d'abord **en local sur un restore prod** (mêmes commandes), puis rejouer en prod.

L'ordre ci-dessous est impératif (dépendances de données).

---

## Étape 0 — Prérequis : alignement des SA employeuses coop ↔ main

> Porté par **l'autre PR** (rattrapage des structures employeuses). Doit être fait AVANT
> les backfills de personnes/affectations, qui joignent sur `structure_coop_id`.

Objectif : **chaque structure employeuse coop a une `main.structure_administrative`
correspondante** (via `structure_coop_id`), complète (dénomination + adresse).

- Réconciliation / couverture des employeuses restantes (jobs de l'autre PR).
- `completer-structures-main` : complète les SA main incomplètes depuis le SIRET
  (API Recherche d'entreprises + géocodage BAN).

Vérification (aucune employeuse coop active sans SA main) :

```sql
SELECT count(*) AS employeuses_coop_sans_sa_main
FROM (SELECT DISTINCT structure_id FROM coop.employes_structures WHERE suppression IS NULL) es
WHERE NOT EXISTS (
  SELECT 1 FROM main.structure_administrative m WHERE m.structure_coop_id = es.structure_id
);
-- attendu : 0 (ou résidu connu/assumé)
```

---

## Étape 1 — Migrations

`main` (personne / affectations / contrat + baseline) est géré par **Flyway** côté
Entrepôt : ces migrations existent déjà en prod → `resolve --applied` (ne PAS les rejouer,
leurs `CREATE TABLE` n'ont pas d'`IF NOT EXISTS`). Seules les migrations **coop** se
déploient.

Ce baseline est désormais **automatique** : `prisma/baseline-main.sh` marque appliquée toute
migration `main` non enregistrée dont les tables existent déjà. Il est branché sur
`db:migrate-deploy` (docker local, restauration locale d'un dump prod, envs de preview) et sur le
step tunnel du déploiement prod (`.circleci/config.yml`). Les deux commandes ci-dessous ne restent
utiles que pour baseliner à la main, hors de ces chemins.

```bash
# main (déjà présent via Flyway) -> marquer appliquées
pnpm -F web prisma migrate resolve --applied 20260722155232_baseline_main_external
pnpm -F web prisma migrate resolve --applied 20260723171939_ajouter_personne_affectations_contrat_main

# colonnes coop + nullable -> déployer
#   20260723010642 : employes_structures.structure_main_id + activites.structure_employeuse_main_id
#   20260724120000 : activites.structure_employeuse_id devient NULLABLE (drop colonne+FK = échange final)
pnpm -F web db:migrate-deploy

pnpm -F web prisma migrate status   # "Database schema is up to date!"
```

---

## Étape 2 — Réconciliation `coop.users` ↔ `main.personne`

C'est le pivot `coop_id` qui donne accès aux affectations (employeuses) et contrats de main.

### 2a. `relier-personnes-coop-main` — pose / re-pointe le `coop_id` manquant

Match par email (3 chemins réels du `contact` : `coop.email`, `idposte.mail_perso`,
`idposte.mail_pro`) + nom+SIRET employeuse. Table de décision : `lie` (personne libre),
`re-point` (jumeau MORT : jamais connecté / supprimé / legacy `conseiller-v1`),
`re-point-recence` (both-alive, orphelin `last_login` strictement plus récent),
`conflit-manuel` (both-alive à trancher à la main via CSV), `sans-match`.

```bash
pnpm cli job:execute relier-personnes-coop-main                     # dry-run -> relire le CSV
pnpm cli job:execute relier-personnes-coop-main '{"dryRun":false}'  # apply
```

### 2b. `backfill-personnes-affectations-main` — personne + affectation `source=coop` (NON-CN)

Rejoue le dual-write (`ensurePersonneMain` + `ensureAffectationEmploiMain`) sur les emplois
coop existants des **non-CN** (l'employeuse d'un CN vient de l'affectation `idposte` de
l'Entrepôt ; une `source=coop` y ferait doublon). SA main résolue via `structure_coop_id`.

> À lancer **APRÈS** 2a (sinon `ensurePersonneMain` crée une personne neuve au lieu de
> laisser 2a re-pointer la vraie personne idposte).

```bash
pnpm cli job:execute backfill-personnes-affectations-main
pnpm cli job:execute backfill-personnes-affectations-main '{"dryRun":false}'
```

---

## Étape 3 — Backfill `structure_employeuse_main_id`

Peuple `structure_employeuse_main_id` sur `coop.activites` (~4M) et `structure_main_id` sur
`coop.employes_structures`, depuis la colonne coop via la correspondance `structure_coop_id`.
Nécessaire pour que l'employeuse des activités existantes soit lisible côté main (le nouveau
code n'écrit plus que la colonne main). ~6 min pour ~4M lignes (batché à 50k).

```bash
pnpm cli job:execute backfill-structure-employeuse-main
pnpm cli job:execute backfill-structure-employeuse-main '{"dryRun":false}'
```

Vérification :

```sql
SELECT count(*) FILTER (WHERE structure_employeuse_main_id IS NOT NULL) AS avec_main,
       count(*) AS total
FROM coop.activites;
```

---

## Après la prep

Prod = schéma + données prêts. Le déploiement du code (cette PR) lit alors l'employeuse
depuis main (courante = affectation active ; à une date = `main.contrat`) et n'écrit plus
que les colonnes main.

**Résiduel connu (hors prep, non bloquant)** :

- `conflit-manuel` de 2a (comptes coop en double both-alive) : dédoublonnage humain via CSV.
- CN absents de main (email divergent) : réconciliation manuelle.

**Échange final (PR ultérieure)** : drop des colonnes + FK coop SA
(`activites.structure_employeuse_id`, `employes_structures.structure_id`), suppression des
emplois coop, une fois tous les reads/writes basculés.

## Gotchas

- Après un changement de `schema.prisma`, **redémarrer le serveur** (Next hot-reload le TS
  mais pas le client Prisma dans `node_modules` → l'ancien client exige les champs required
  supprimés → `TRPCClientError`).
- `e2e` (`cy run`) et `fixtures:load` **truncatent le schéma coop** (CASCADE) → détruisent un
  restore prod local. Ne pas mélanger e2e et base restaurée à conserver.
- `DATABASE_URL` du `.env` local peut pointer le **tunnel prod** (5455) : toujours vérifier la
  cible avant un `apply`.
