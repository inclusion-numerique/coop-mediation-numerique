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

### Vérification — les trois requêtes doivent renvoyer 0

Une SA employeuse absente de main ne se contente pas de manquer : elle **exclut ses salariés
du backfill 2b**, dont `chargerCibles` joint sur `main.structure_administrative`. Le job les
compte alors comme traités (`statut=ok`) sans rien écrire — le compte rendu ne signale rien.
D'où trois contrôles et non un seul : la cause, puis ses deux effets.

```sql
-- (a) cause : employeuse coop active sans SA main
SELECT count(*) AS employeuses_coop_sans_sa_main
FROM (SELECT DISTINCT structure_id FROM coop.employes_structures WHERE suppression IS NULL) es
WHERE NOT EXISTS (
  SELECT 1 FROM main.structure_administrative m WHERE m.structure_coop_id = es.structure_id
);

-- (b) effet : salarié d'une employeuse active privé de main.personne
SELECT count(*) AS users_actifs_sans_personne_main
FROM coop.users u
WHERE u.deleted IS NULL
  AND EXISTS (
    SELECT 1 FROM coop.employes_structures es
    WHERE es.user_id = u.id AND es.suppression IS NULL
      AND (es.fin_emploi IS NULL OR es.fin_emploi > now())
  )
  AND NOT EXISTS (SELECT 1 FROM main.personne p WHERE p.coop_id = u.id);

-- (c) effet : emploi actif sans corrélation main
SELECT count(*) AS emplois_actifs_sans_structure_main
FROM coop.employes_structures es
WHERE es.suppression IS NULL
  AND (es.fin_emploi IS NULL OR es.fin_emploi > now())
  AND es.structure_main_id IS NULL;
```

**Ordre impératif** : ces trois requêtes se relancent **après** l'étape 2b et **après**
l'étape 3, pas seulement avant. Un résidu en (a) au moment de 2b ne se rattrape pas tout
seul — il faut créer les SA manquantes, **puis rejouer 2b et 3**.

État mesuré sur le restore prod du 2026-08-06 (à ramener à 0 avant la prod) : **(a) 6**
— 5 employeuses actives + 1 dont les emplois sont supprimés —, **(b) 4**, **(c) 5**.

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

### Écart assumé au drop de `coop.structure_administrative` / `coop.employes_structures`

Audit du 2026-08-06 sur restore prod. La couverture **par lignes** est acquise
(activités 4 017 546 / 4 017 546) ; l'écart restant est **par colonnes**. Décisions prises,
à ne pas rouvrir :

| Donnée coop sans équivalent main | Volume | Décision |
|---|---|---|
| SA employeuse absente de main | 6 | **À corriger** — cf. étape 0, seul point bloquant |
| `debut_emploi` / `fin_emploi` | 2 384 débuts, 220 fins sans `main.contrat` correspondant | **Assumé** — l'Entrepôt fait autorité sur les contrats : ce qu'il n'a pas n'a pas lieu d'être |
| `nom/courriel/telephone_referent` | 344 sans contact main | **Assumé** — les référents sont gérés par l'Entrepôt, les nôtres sont présumés obsolètes |
| `creation_par_id`, `modification_par_id`, `suppression_par_id` | toute la table | **Assumé perdu** — piste d'audit non portée |

Non vérifié à ce stade, et qui reste à la charge de qui déclenchera le drop : l'**égalité des
valeurs** là où les deux côtés sont renseignés (2 091 SA ont « un » contact main, pas
forcément le même référent), et le recouvrement des **périodes** entre `main.contrat` et
`debut_emploi`/`fin_emploi`. L'audit n'a porté que sur la présence.

## Gotchas

- Après un changement de `schema.prisma`, **redémarrer le serveur** (Next hot-reload le TS
  mais pas le client Prisma dans `node_modules` → l'ancien client exige les champs required
  supprimés → `TRPCClientError`).
- `e2e` (`cy run`) et `fixtures:load` **truncatent le schéma coop** (CASCADE) → détruisent un
  restore prod local. Ne pas mélanger e2e et base restaurée à conserver.
- `DATABASE_URL` du `.env` local peut pointer le **tunnel prod** (5455) : toujours vérifier la
  cible avant un `apply`.
