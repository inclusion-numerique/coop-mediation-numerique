# Runbook — réconciliation des employeuses coop → `main`

Amener à **zéro** l'écart entre `coop.structure_administrative` et
`main.structure_administrative` : chaque employeuse coop doit avoir une ligne `main` qui la
désigne par `structure_coop_id`. C'est le prérequis de la migration décrite dans
[ADR-002](./adr/adr-002-migration-structures-employeuses-vers-main.md) — sans couverture
complète, les clés étrangères de `coop.activites` et `coop.employes_structures` ne peuvent pas
être repointées.

La séquence est rejouable de bout en bout sur une restauration fraîche. **L'ordre compte** :
chaque étape modifie la population que la suivante analyse.

---

## Avant de commencer

### Vérifier la base cible — impératif

`DATABASE_URL` du `.env` doit pointer sur le Docker local, **port 5433** :

```bash
grep -m1 '^DATABASE_URL=' .env | sed -E 's#(://[^:]+:)[^@]+@#\1***@#'
# postgresql://coop-mediation-numerique:***@localhost:5433/…
```

Un `localhost:5455` est un **tunnel SSH vers la production**. Tout job lancé sans
`--deployment` écrirait alors directement en prod. Vérifier à chaque session, pas seulement à
la première.

### Règle d'or

Tous les jobs ont `dryRun: true` par défaut. **Toujours lancer le dry-run, lire le CSV, puis
appliquer.** Les fusions font une suppression dure (`mergeStructureAdministrative`) : il n'y a
pas de retour en arrière sans restauration.

### Deux dossiers non versionnés

`refactor/` et `output/` sont dans le `.gitignore`. Le toolkit SQL de l'étape 3
(`refactor/audit-coop-main/`) et tous les CSV produits n'existent donc **que sur la machine qui
les a générés** : ils ne se retrouvent pas après un clone. Les sauvegarder ailleurs avant de
nettoyer le dépôt, et ne pas compter dessus pour rejouer la séquence depuis une machine neuve.

### Les deux fixtures locales

`36929ed7-…` et `f4dbca97-…` (`packages/fixtures/src/structures.ts`) n'existent pas en
production et sont exclues des jobs. Un écart résiduel de 2 après un `fixtures:load` est normal ;
sur une base fraîchement restaurée sans fixtures, la cible est 0.

---

## Séquence

### 1 — Peupler les SIRET manquants

```bash
pnpm cli job:execute corriger-employeuses-sans-siret '{"dryRun":true,"peuplementSeul":true}'
pnpm cli job:execute corriger-employeuses-sans-siret '{"dryRun":false,"peuplementSeul":true}'
```

Retrouve le SIRET d'employeuses qui n'en ont pas, par rapprochement avec `main` et l'API
entreprise.

**`peuplementSeul: true` est le mode normal.** Sans lui, le job enchaîne ses phases 2 à 5
(déduplication, liaison, propagation, création), toutes **remplacées** par les étapes suivantes
de ce runbook, qui les font mieux. Les laisser tourner produit des décisions concurrentes de
celles du plan.

**Pourquoi en premier** : une employeuse sans SIRET ne peut être ni dédupliquée par SIRET, ni
liée, ni créée proprement. Le peuplement fait entrer de nouvelles lignes dans le champ d'action
de toutes les étapes suivantes.

### 2 — Dédupliquer les employeuses

```bash
pnpm cli job:execute deduplicate-employeuses '{"dryRun":true}'
pnpm cli job:execute deduplicate-employeuses '{"dryRun":false}'
```

Fusionne les employeuses en double selon deux critères chaînés : **SIRET identique**, et
**nom + adresse + code INSEE identiques** (normalisés). Détache les lignes `main` des employeuses
absorbées qui en portaient une.

**Ne jamais inverser 1 et 2.** Une employeuse qui reçoit son SIRET à l'étape 1 rejoint des
groupes que la déduplication aurait manqués sans lui. Si l'ordre a été inversé, relancer
l'étape 2.

Sorties :

- `output/audit-structures/deduplicate-employeuses-applied.csv` — les groupes fusionnés
- `output/audit-structures/lignes-main-detachees-applied.csv` — **livrable Entrepôt** : les
  lignes `main` qui perdent leur lien parce qu'elles doublonnent une autre ligne `main`. Eux
  seuls peuvent les fusionner chez eux.

### 3 — Générer le plan de couverture

```bash
./refactor/audit-coop-main/export-plan-complet.sh
```

Produit `refactor/audit-coop-main/out/plan-complet.csv` : un groupe par décision
(`LIER` / `FUSIONNER` / `CREER`), avec la colonne `Apply` pré-remplie à `OK` sur les décisions
sûres et **vide** sur celles à relire. Une annotation existante est reportée d'un run à l'autre ;
le fichier précédent est sauvegardé en `.bak`.

**À régénérer après toute écriture en base.** Le plan est une photographie : les étapes 1 et 2
changent la population, un plan généré avant elles propose des liaisons vers des lignes qui
n'existent plus.

**Ne pas lancer `run.sh`** tant qu'un plan annoté n'est pas appliqué : il boucle sur
`queries/*.sql` et écrase `out/`. Le plan vit volontairement hors de `queries/`.

Relire le CSV, mettre `OK` ou `NOK` sur les lignes laissées vides. Une case vide = aucune
décision, la ligne est ignorée.

### 4 — Appliquer le plan

```bash
pnpm cli job:execute appliquer-plan-couverture '{"dryRun":true}'
pnpm cli job:execute appliquer-plan-couverture '{"dryRun":false}'
```

Exécute les décisions `OK` : liaisons, fusions, créations. Avant toute création, le job tente de
**réclamer** une ligne `main` occupée à tort, puis de **se raccrocher** à une ligne libre du même
SIRET et de la même commune. Il ne crée qu'en dernier recours.

Sortie : `output/audit-structures/appliquer-plan-couverture-applied.csv`.

### 5 — Clôturer

```bash
pnpm cli job:execute couvrir-employeuses-restantes '{"dryRun":true}'
pnpm cli job:execute couvrir-employeuses-restantes '{"dryRun":false}'
```

Balaie toutes les employeuses encore sans équivalent et leur crée une ligne `main`, pour amener
l'écart à zéro.

**À exécuter en dernier, jamais avant l'étape 4.** Lancé plus tôt, il créerait des lignes pour
des employeuses qui avaient une cible parfaitement valable dans `main`.

---

## Vérification finale

```sql
select
  (select count(*) from coop.structure_administrative where suppression is null) as employeuses_coop,
  (select count(*) from coop.structure_administrative c where c.suppression is null
     and not exists (select 1 from main.structure_administrative m
                     where m.structure_coop_id = c.id))                          as ecart_residuel,
  (select count(*) from main.structure_administrative m where m.structure_coop_id is not null
     and not exists (select 1 from coop.structure_administrative c
                     where c.id = m.structure_coop_id))                          as liens_pendants;
```

Attendu : `ecart_residuel` = 0 (ou 2 avec les fixtures), `liens_pendants` = 0.

Adresses orphelines — une ligne `main.adresse` créée sans sa structure, symptôme d'une écriture
hors transaction :

```sql
select count(*) from main.adresse a
where a.created_at::date = current_date
  and not exists (select 1 from main.structure_administrative m where m.adresse_id = a.id);
```

Attendu : 0.

Pour ventiler un écart résiduel non nul, voir la requête de répartition par cas dans
`refactor/audit-coop-main/queries/13-reste-a-couvrir.sql`.

---

## Livrables pour l'équipe Entrepôt

À produire après l'étape 5, avant toute exécution en production :

```bash
DBURL="$(grep -m1 '^DATABASE_URL=' .env | sed -E 's/^DATABASE_URL=//; s/^"//; s/"$//')"
psql "$DBURL" -Aqt -c "COPY ($(sed -E 's/;[[:space:]]*$//' refactor/audit-coop-main/entrepot-impact.sql)) \
  TO STDOUT WITH (FORMAT csv, HEADER true)" > refactor/audit-coop-main/out/entrepot-impact.csv
```

Deux fichiers à leur transmettre :

- `entrepot-impact.csv` — tout ce que la Coop écrit dans `main`, en distinguant **CREATION**
  (lignes nouvelles, ce qui augmente leur volume) et **LIAISON** (lignes préexistantes qui
  reçoivent seulement un `structure_coop_id`).
- `lignes-main-detachees-applied.csv` — les lignes qui perdent leur lien, doublons à fusionner
  de leur côté.

Le périmètre d'`entrepot-impact.sql` est daté du jour (`updated_at_coop::date = current_date`) :
adapter la date pour rejouer l'export plus tard.

---

## Pièges rencontrés en exécution réelle

| Piège | Conséquence | Parade |
|---|---|---|
| `DATABASE_URL` sur le tunnel prod (5455) | écriture directe en production | vérifier le port avant chaque session |
| Déduplication avant peuplement des SIRET | groupes manqués | respecter l'ordre 1 → 2 |
| Plan généré avant les étapes 1 ou 2 | liaisons vers des lignes supprimées | régénérer après toute écriture |
| `run.sh` lancé avec un plan annoté en cours | `out/` écrasé, annotations perdues | ne pas lancer `run.sh` à ce moment |
| Clôture avant l'application du plan | créations inutiles dans `main` | étape 5 en dernier |
| `peuplementSeul` omis à l'étape 1 | phases 2–5 concurrentes du plan | toujours `peuplementSeul: true` |
| Unicité de `main.adresse` sur (CP, commune, voie, numéro, répétition) | échec de création | `creerLigneMain` réutilise l'adresse existante |
| Unicité `(siret, denomination_antenne)` en NULLS NOT DISTINCT | une seule ligne par SIRET peut avoir l'antenne nulle | `choisirAntenne` nomme l'antenne si la place est prise |
| Adresse et structure hors transaction | adresse orpheline en cas d'échec | les deux écritures sont dans une transaction |
| Désaccentuation après retrait de la ponctuation | `Aubière` → `AUBIRE` ≠ `AUBIERE` | `unaccent` **avant** `regexp_replace` |
