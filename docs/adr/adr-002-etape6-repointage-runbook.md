# ADR-002 étape 6 — Runbook de repointage employeuse `coop` → `main`

Compagnon opérationnel de l'ADR-002. Détaille la bascule des 2 clés étrangères employeuses
(`coop.activites.structure_employeuse_id`, `coop.employes_structures.structure_id`) de `uuid` (coop)
vers `int` (`main.structure_administrative`), en **une seule PR** (décision 4), validée sur
restauration iso-prod avant la prod.

## Stratégie retenue

- **Additif d'abord** : les colonnes/relations `main` coexistent avec les `uuid` coop (aucune
  suppression avant l'échange final). `tsc` reste vert à chaque incrément.
- **Dual-write** : chaque création d'emploi/activité peuple les DEUX colonnes (`structureId` uuid +
  `structureMainId` int). Rollback trivial : les colonnes uuid restent renseignées.
- **Lectures repointées** vers la relation `main`. Correctes pour l'état post-backfill ; pendant la
  transition, les where/dedup peuvent rester sur coop (toujours peuplé) jusqu'à l'échange.
- **Échange final** (migration séparée dans la même PR) : DROP des colonnes/relations uuid, `NOT
  NULL` sur les colonnes int, index/renommage éventuels. Rollback = migration inverse écrite en même
  temps.

## Fait (branche `refactor/lieu-employeuse`)

| Incrément | Commit | Contenu |
|---|---|---|
| 6a | `f5db7516` | Moteur SIRET→API→BAN partagé (`features/structures/main/`) |
| 6b | `0cd82e34` | `ensureStructureAdministrativeMain` (anti-dérive) sur `findOrCreate` |
| 6c | `1d6e2d4a` | Colonnes int + FK + relations Prisma (additif) + migration |
| 6d | `1f42f00e` | Job `backfill-structure-employeuse-main` (par lots) |
| 6e-écritures-1 | `f96d670f` (WIP non signé) | Contrat `{ id, mainId }` + dual-write inscription/import |

## Mise à jour 2026-07-24 — bascule PUR MAIN (pivot d'approche)

Le read de l'employeuse a **pivoté**. Au lieu de lire `emploi.structureMain` (la SA main via la FK
de l'emploi coop), on lit l'employeuse **depuis la personne** :
`coop.users → main.personne (coop_id) → main.personne_affectations_emploi (est_active) →
main.structure_administrative`, et l'employeuse À UNE DATE depuis `main.contrat`. Cela supprime toute
dépendance à `coop.employes_structures` pour les reads d'employeuse d'un utilisateur.

**Fait cette session** (branche `refactor/lieu-employeuse`) :

- **Réconciliation données, APPLIQUÉE EN PROD** (précautions max) : `relier-personnes-coop-main`
  (link + re-point `coop_id` : jumeau mort, récence, nom+SIRET), `backfill-personnes-affectations
  -main` (personne + affectation `source=coop` non-CN). Voir
  [runbook prep prod](adr-002-runbook-prep-prod-pur-main.md).
- **Fix** : pivot email `ensurePersonneMain` (clés réelles `mail_perso`/`mail_pro` + casse +
  tie-break idposte) ; dual-write SA depuis l'identité en main (fin de la dépendance API Entreprise
  au write).
- **Reads employeuse USER → pur main** : récap inscription, `sessionUser`
  (`personneToSessionEmplois`), `mes-equipes`, admin détail (historique via
  `resolveEmployeusesHistorique` : `est_active` en cours/terminé, dates `main.contrat`, plus de
  « supprimé » ni modification), CRA `getActeurEmploiForDate` (contrat couvrant la date / affectation
  active), `ma-structure-employeuse`, `queryUtilisateursForList`.
- **Write CRA (Option A)** : `createOrUpdateActivite` n'écrit plus que `structureEmployeuseMain` ;
  migration `activites.structure_employeuse_id` **NULLABLE** (drop colonne+FK = échange final).
- **Fixtures** : `seedPersonnesMain` (personne + affectation des users de test). **e2e CRA 2/2 +
  inscription 6/6.**

**Conséquence sur la section « Reste à faire » ci-dessous** : les **reads d'employeuse d'un
utilisateur** de la section B sont **superseded** (refaits en pur main via `personne→affectation`).

### Mise à jour 2026-07-25 — CODE du flip pur-main complet

Tous les reads de l'employeuse d'un utilisateur passent par `main`. Plus aucun read via
`coop.structure_administrative`.

- ✅ **#1 Filtres / stats / mon-réseau** (`getMonReseauPageData`, `searchActeurs`,
  `searchMediateursCoordonneBy` en LATERAL pur main via `employeuseMainLateral` ;
  `getStructuresEmployeusesOptions` sur `main.structure_administrative` via affectation active, id
  int stringifié ; `activitesFiltersSqlWhereConditions` sur `structure_employeuse_main_id`). Smoke
  test d'intégration ajouté (couvre la composition Prisma en CI).
- ✅ **`api/v1/utilisateurs`** : confirmé cohérent (expose `structure_id = emploi.structureMainId`
  int main, aucune relation SA coop) — pas de changement.
- ✅ **Routes admin orphelines** `utilisateurs/[id]/emplois` (+ `creer`, `[emploiId]/modifier`)
  supprimées (pages + forms + `employeStructureRouter` + validations, débranché du `appRouter`).
- ➖ **Comptes admin `_count.emplois`** (`correlateStructureAdministrative`, action-plan, liste/merge/
  détail SA) : NON-item pour le pur-main — c'est la gestion de la table `coop.structure_administrative`
  elle-même, qui disparaît à l'échange final.

**Reste (opérationnel / séparé)** :

1. **Prep prod** + déploiement : [runbook dédié](adr-002-runbook-prep-prod-pur-main.md) (migrations +
   backfill `structure_employeuse_main_id` ~4M, répété en local).
2. **Phase 2 réconciliation** : 46 `conflit-manuel` (dédoublonnage comptes) + 15 CN absents (CSV).
3. **Échange final** (PR ultérieure) : drop colonnes/FK coop SA, arrêt writes/emplois coop, suppression
   des jobs de synchro/réconciliation.
4. **Prérequis (autre PR)** : alignement SA employeuses coop↔main.

### Mise à jour 2026-07-25 (nuit) — échange final : la partie CODE est faite

Le point 3 ci-dessus (« échange final, PR ultérieure ») a été **réalisé dans cette branche**, sauf la
migration SQL. La coop **n'accède plus du tout** à `coop.structure_administrative` ni à
`coop.employes_structures` (ni read, ni write) : l'employeuse vit uniquement dans `main`
(`personne` + `personne_affectations_emploi` active + `structure_administrative`).

| Commit | Lot | Contenu |
|---|---|---|
| `7e8a3e40` | fix #1 | `searchActeurs` : la **count query** avait échappé au flip (indentation) et joignait encore `coop.structure_administrative` via `es.structure_id` → `employeuseMainLateral`. |
| `2c78697e` | #1 | 4 derniers **lecteurs** d'emplois → main : `searchActeurs` (codeInsee coordinateur via `personneMain`), `update-lieu-activite-a-distance` (`resolveEmployeuseActuelle`), `filterUtilisateur.filterOnLieux` (dept/commune sur `adresse.codeInsee`), `lieuActiviteRouter` (garde morte retirée). |
| `1c4071c3` | #2/#3/#5 | **Coupe de TOUS les writes coop SA/emplois** : `ensureStructureAdministrativeMain` (`coopId` nullable, dédup `(siret, denomination)`), `findOrCreateStructureAdministrative` main-only → `{ mainId }`, inscription `renseigner` (personne+affectation main, plus d'emploi coop), `importStructureEmployeuseFromSiret`, **ProConnect** (affectation active + désactivation des autres — l'ancienne logique de dates coop était un artefact du modèle daté), **Dataspace** `syncFromDataspaceCore` (sync CN structures/emplois retirée : `source=idposte` appartient à l'Entrepôt ; flag CN + coordinateur + Brevo + import lieux conservés). Tests : suites 100 % obsolètes supprimées, `updateUserFromDataspace` élagué (1299 → ~360 l.), assertions réécrites côté main. **tsc + 665 unit ✅** |
| `5608fac4` | #4a | **Outillage SIRET lieu-only** : `siretBearingStructures` perd la source employeuse (read + `alignEmployeuseIdentity`/`clearSiret`/`markSync`) ; `normalize-sirets`, `apply-vider-siret`, `audit-siret-coherence`, `export-duplicate-sirets` alignés. Décision : la qualité SIRET des **employeurs** appartient à l'Entrepôt, la coop « consulte » seulement. |
| `f61122a3` | #4a | **Suppression de `generate-structures-action-plan`** : sa détection d'orphelins reposait sur des signaux devenus faux (emplois gelés, activités passées à `structure_employeuse_main_id`) → plan de suppression dangereux. ⚠️ **Conséquence** : la famille `apply-*` (vider/supprimer/fusionner/corriger) n'a plus de producteur de plan CSV. |
| `7d261182` | #4b | **Corrélation coop lieu↔employeuse dépréciée** : `getEmploisCount*` / `getCorrelatedEmployeuseRelations` renvoient `0`/vide sans lire coop (nom+adresse+INSEE non fiable sur main : adresse normalisée autrement, dénomination scindée). Gardes lieu-natives d'`apply-supprimer-lieux` conservées. |
| `4c553e47` | #4b | **Admin employeuses → main SA** : liste, recherche (`searchStructuresAdministratives`), **autocomplete** (fusion/inscription), DataTable (tri sur `denominationAntenne` / `adresse.*` / `affectationsEmploi._count`), page détail par **int main** (emplois = affectations actives → personne → user via `coop_id`), `employeuseMainToAdminStructure` (le lien de route porte enfin l'id main). |
| `33f05592` | fix | **Inscription** : le fallback SIRET d'`initializeInscription` testait la présence d'employeuse sur les emplois coop (gelés/vides) → ré-import SIRET quasi systématique. Bascule sur la présence d'**affectations main actives** (chemins `withDataspace` + fallback). |
| `30c92eb9` | fin | **Derniers reads indirects** : `mergeUser` et `getMergeData` lisent la colonne FK `structureId` (plus la relation coop) ; **`mergeAffectationsMain`** ajouté (consolide les affectations main source→cible à la fusion de comptes — gap : personne source orpheline) ; `api/v1/utilisateurs` expose les **affectations main actives** (dates best-effort via `main.contrat`), doc OpenAPI à jour. |
| `40f409bc` | tests | `getMesStatistiquesPageData` (seed `seedPersonnesMain`, option employeuse = id int main, commune `null` faute d'adresse sur la SA fixture) et `find-duplicates-for-beneficiaire` (setup self-contained, FK médiateur garantie à l'update de l'upsert). |

**Reste après ces commits :**

1. **Migration d'échange final (non écrite)** — le schéma porte encore `model StructureAdministrative`,
   `model EmployeStructure` et `Activite.structureEmployeuseId` ; dernière migration = `20260724120000`.
   À faire : `DROP` de `coop.activites.structure_employeuse_id` et de `coop.employes_structures`,
   `SET NOT NULL` sur `structure_employeuse_main_id`, retrait des modèles/relations coop du
   `schema.prisma`, **migration de rollback écrite dans la foulée**.
   ⚠️ **Point 4 non tenu** : `20260723010642` pose les 2 FK en `ON DELETE SET NULL` alors que la
   décision est **`RESTRICT`** → à corriger dans ce jeu final.
2. **Code mort à supprimer avec la table** : `mergeLieuInclusion.ts:28,37`,
   `updateStructuresFromEntrepot.ts:165,266` + SQL brut `:249-262`, `mergeUser.ts:412,422`,
   `signupReminders.ts:62`, et les `create` d'emplois des tests d'intégration/fixtures.
3. **Prep prod + déploiement** ([runbook dédié](adr-002-runbook-prep-prod-pur-main.md)) : le backfill
   `structure_employeuse_main_id` (~4M) **en prod reste à confirmer** (rejoué en local sur restore).
   Garde-fou inchangé : 0 NULL avant tout `NOT NULL`.
4. **Suppression des jobs devenus sans objet** (étape 9 de l'ADR), une fois la prod passée :
   `backfill-structure-employeuse-main`, `relier-personnes-coop-main`,
   `backfill-personnes-affectations-main`, `completer-structures-main`. Statuer aussi sur la famille
   `apply-*` orpheline (cf. `f61122a3`).
5. **Ouverts côté Entrepôt** : #1729 (sémantique `est_active` `source='coop'`, P0) ; liste des grants
   Flyway à transmettre (elle tombe du code maintenant que les chemins d'écriture sont figés) ;
   enums `entrepot/schema.prisma` (Point 7a, PR séparée).
6. **À acter explicitement** : l'étape 8 de l'ADR (« passage en abilities du socle structures ») n'est
   pas faite — `features/structures/` n'a pas d'`abilities/`. À déclarer hors périmètre.

## Reste à faire

> **Obsolète depuis le 2026-07-25** — cette section décrit la stratégie *dual-write* (A/B/C) d'avant le
> pivot pur main. A et B sont **superseded** (plus aucun read/write coop : voir la mise à jour
> ci-dessus) ; C est fait. Conservée pour l'historique et pour l'inventaire des sites (utile à la
> rédaction de la migration d'échange final).

### A. Écritures restantes (dual-write : ajouter `structureMainId` / `structureEmployeuseMainId`)

Toutes ADDITIVES. La valeur `mainId` vient du contrat `findOrCreate`/`getOrCreate` (`{ id, mainId }`)
ou d'une lecture qui doit exposer l'id main (voir B).

**Audit dual-write (23/07) : couverture COMPLÈTE.** Tout chemin d'écriture *vivant* qui pose la FK
employeuse coop pose aussi la FK main → l'échange `NOT NULL` est sûr. Les sites ci-dessous sont soit
FAITS, soit *morts* (repoints d'employeuse opérant sur des ids de LIEU, disjoints depuis le split
étape 1 → matchent 0 ligne) et à **supprimer** (pas repointer) à l'échange car ils écrivent dans les
colonnes uuid qui tombent.

- **FAIT** `features/dataspace/syncFromDataspaceCore.ts` (`65c7c88a`) : dual-write `structureMainId`
  sur les emplois créés/déplacés (dérivation coopId→mainId via `structure_coop_id`, une Map). La clé
  de dédup `getEmploiKey` reste sur l'uuid pendant la transition (fiable). NB : le create
  `mediateurEnActivite` (`:713`) est une relation de LIEU, pas employeuse.
- **SUPPRIMÉ** `mergeStructureAdministrative.ts` (`c1961964`) : la fonctionnalité admin de fusion
  d'employeuses a été retirée (mutation + query + composants + routes + procédure tRPC
  `structures.mergeAdministrative`). Un site de dual-write en moins à traiter à l'échange. La fusion
  de LIEUX (`mergeLieuInclusion`) est conservée.
- **FAIT** `createOrUpdateActivite.ts:315-320` (`18dd28bb`) : connecte la relation coop (uuid) ET
  `structureEmployeuseMain` (int) si `emploi.structureMainId`.
- **MORT → supprimer à l'échange** `mergeLieuInclusion.ts` `mergeEmployes:15-40` +
  `mergeActivitesEmployeur:69-76` : repointent `employeStructure.structureId` /
  `activite.structureEmployeuseId` avec des ids de LIEU → 0 ligne. (`mergeMediateursEnActivite` /
  `mergeActivitesLieu` = lieu, corrects, hors périmètre.)
- **MORT → supprimer à l'échange** `updateStructuresFromEntrepot.ts:165-168,177-180` :
  `employeStructure.updateMany structureId` + `activite.updateMany structureEmployeuseId` avec des
  `idsToDelete` = ids de LIEU → 0 ligne. (`:169-176` = lieu ; SQL brut `:249-262`
  `PARTITION BY … structure_id` = à repointer, voir C.)
- **NEUTRE → à l'échange** `mergeUser.ts:415-423` : `employeStructure.updateMany` réassigne
  `userId` (le `structureId` n'est qu'un **filtre** where, pas une écriture) ; le filtre passe
  uuid→int quand `emplois.structure` (lu `:69-76`, voir B) bascule sur main.

Tests d'écriture à aligner (ajouter `structureMainId`/`…MainId` aux `create`) :
`getActeurEmploiForDate.integration.ts`, `updateUserFromDataspaceData.integration.ts`,
`mergeStructureAdministrative.integration.ts:41`, `updateStructuresFromEntrepot.integration.ts:29,53`,
`ajouterStructureEmployeuseEnLieuActivite.integration.ts:87`,
`assignPremierAccompagnement.integration.ts:74`, `getMesStatistiquesPageData.integration.ts`.

### B. Lectures via relation Prisma (repointer `coop` → `main`)

**`employeStructure.structure` → `structureMain`** (select/include/where) :

- **FAIT** `auth/getSessionUserFromSessionToken.ts` + `auth/serializePrismaSessionUser.ts` (`98abbf46`) —
  **transverse** : lit `structureMain`, réexpose la forme `structure: { nom, codeInsee }` via le
  sérialiseur → consommateurs (`HeaderUserMenu`, `VerifierInformationsPage`, `RecapitulatifPage`,
  `CartographieNationaleOutilAccess`) inchangés.
- **FAIT** `features/mon-reseau/use-cases/acteurs/db/getActeurEmploiForDate.ts` (`18dd28bb`) — lit
  `structureMain` + adresse + référents via `contact` jsonb ; forme normalisée `EmploiStructureEmployeuse`
  (`id: number|null`) préservée. Ses consommateurs (`getActeurDetailPageData`,
  `getDepartementCodeForActeur`, `ActeurStructureEmployeuse`) consomment cette forme → OK sans changement.
- **FAIT** `app/coop/(full-width-layout)/ma-structure-employeuse/page.tsx` (`18dd28bb`).
- **FAIT** `features/utilisateurs/use-cases/list/queryUtilisateursForList.ts` (`11a89af9`) — lit
  `structureMain` (denomination + `adresse.codeInsee`), réexpose `{ nom, codeInsee }` via mapper →
  data-table / export / `getDepartementCodeForActeur` inchangés.
- **FAIT (inscription)** `getStructureEmployeuseForInscription` (`2e7d18fd`) lit `structureMain`
  (id int) → le flux « employeuse = lieu d'activité » matérialise le lieu depuis les données MAIN
  (mutation `ajouterStructureEmployeuseEnLieuActivite`, input `structureEmployeuseId` int), avec
  **corrélation anti-doublon main‖coop** (les lieux historiques ont été matérialisés depuis la coop).
  `getInscriptionRecapitulatifPageData` hérite via la lecture partagée. `initializeInscription`
  (`253261a5`) : sous-selects coop `structure` **morts retirés** (seule la présence d'emploi est
  testée). Helpers main partagés extraits (`features/structures/main/mainContact.ts` +
  `employeuseLieuData.ts`), réutilisés par `getActeurEmploiForDate`.
- **FAIT** admin utilisateurs *détail* (`d81f5caf`) : `getAdministrationUserPageData`,
  `…/[id]/emplois/page.tsx`, `…/[id]/emplois/[emploiId]/modifier/page.tsx` sélectionnent
  `structureMain` et réexposent `emploi.structure` via l'adaptateur `employeuseMainToAdminStructure`
  (forme `getStructuresInfos`). **L'id du lien reste l'uuid COOP** : la route
  `/administration/structures-employeuses/[id]` lit encore coop — son déplacement vers l'int main
  relève de l'échange final (socle). Les deux `getStructuresInfos` acceptent `creation: Date | null`.
- **DIFFÉRÉ (neutre)** `filterUtilisateur.ts:173-186` (where filtre), `getMergeData.ts:99-113`
  (compare des `structureEmployeusesIds`), `mergeUser.ts:69-76` (feed A).
- **FAIT** `app/api/v1/utilisateurs/route.ts` (`2b9dcdce`) : `emplois[].structure_id` expose désormais
  l'**int main** (`emploi.structureMainId`), type `integer` nullable, doc OpenAPI à jour (décision Marc :
  bascule du contrat). Le `structure_id` des liens médiateur-lieu (`en_activite`, `:642`) reste un uuid
  de LIEU, inchangé.
- **DIFFÉRÉ (job, lecture d'adresse employeuse)**
  `jobs/update-lieu-activite-a-distance/executeUpdateLieuxActivitesADistance.ts:34-35`.

**Inverses `structureAdministrative.emplois`/`.activites` (coop) → modèle `main`** :

- `features/structures/getStructuresEmployeusesOptions.ts:18-27,57-67` (`where.emplois.some`) — les
  `id` d'options passent de uuid coop à **int main** (cohérence avec le filtre SQL, voir C).
- `features/structures/correlateStructureAdministrative.ts:76-84,131-132`,
  `siret/siretBearingStructures.ts:109,157` (`_count.emplois`),
  `use-cases/list-administrative/queryStructuresAdministrativesForList.ts:18-24`,
  `use-cases/merge/queries/getMergeStructureAdministrativePreviewPageData.ts:16` + `merge/types.ts:12,25`,
  `app/administration/structures-employeuses/[structureAdministrativeId]/page.tsx:36-53`,
  `jobs/generate-structures-action-plan/executeGenerateStructuresActionPlan.ts:46,513`.

**Cascade filtres employeuse** (id option uuid→int) : `server/rpc/structures/structuresRouter.ts`,
`components/filters/getFiltersOptionsForMediateur.ts:65`, `StructureEmployeuseComboBox.tsx`,
`StructuresEmployeusesField.tsx`, `MoreCoordinateurFilters.tsx`,
`features/activites/use-cases/list/components/Filters.tsx`, `generateActivitesFiltersLabels.ts`,
`validation/ActivitesFilters.ts`.

### C. SQL bruts (`$queryRaw`/`$executeRaw`)

- `equipe/EquipeListePage/searchMediateursCoordonneBy.ts:113-117` — `JOIN "structure_administrative"
  sa ON sa.id = employes.structure_id` → `JOIN main.structure_administrative ON id =
  employes.structure_main_id`.
- `features/mon-reseau/getMonReseauPageData.ts:21-22` — `JOIN structure_administrative s1 ON s1.id =
  es.structure_id` → main via `es.structure_main_id`.
- `features/mon-reseau/use-cases/acteurs/db/searchActeurs.ts:174-175,203-204` — idem.
- `features/activites/use-cases/list/db/activitesFiltersSqlWhereConditions.ts:217-224` —
  `act.structure_employeuse_id IN (…::UUID)` → `act.structure_employeuse_main_id IN (…int)`.
- `jobs/update-structures-cartographie-nationale/updateStructuresFromEntrepot.ts:249-262` (voir A).

**Faux amis à NE PAS toucher** : `activite.structureId` & `mediateurEnActivite.structureId` (→ lieu) ;
`deleteActivite.ts:163-167` ; `user.structureEmployeuseRenseignee` (timestamp, pas une FK) ; les
segments de route `[structureId]`/`[structureAdministrativeId]`.

## Échange final (migration séparée, même PR)

Une fois A+B+C faits et validés :

1. Migration : `ALTER … DROP COLUMN structure_employeuse_id` / `DROP TABLE employes_structures` ;
   `ALTER … ALTER COLUMN structure_employeuse_main_id SET NOT NULL` ; **FK en `ON DELETE RESTRICT`**
   (Point 4) ; suppression des relations/inverses coop dans `schema.prisma` ; renommage éventuel
   `*_main_id` → nom canonique. **← seul point restant**
2. ✅ **FAIT** (`1c4071c3` + suivants) : dual-write retiré — plus aucune écriture coop SA/emplois, ni
   where/dedup résiduel sur coop.
3. Rollback écrit dans la foulée : migration inverse (re-création colonnes uuid + re-backfill depuis
   main via `structure_coop_id`).

## Runbook de déploiement (ordre impératif, décision 4)

1. Restaurer une sauvegarde **iso-production** en local.
2. `migrate deploy` jusqu'à 6c (ajout colonnes int + FK).
3. Lancer `backfill-structure-employeuse-main` (`{dryRun:false}`) → colonnes int remplies.
4. Lancer `completer-structures-main` (`{dryRun:false}`) → ferme la dérive résiduelle (ensureMain
   best-effort peut laisser des `mainId` null sur échec API) AVANT l'échange.
5. Vérifier : 0 `structure_employeuse_main_id` NULL là où l'uuid est non-NULL (sinon l'échange
   `NOT NULL` échoue) ; rejouer 3-4 si besoin.
6. Déployer le code (lectures/écritures sur main) + migration d'échange final.
7. Rejeu complet en local sur la sauvegarde iso-prod, puis prod.

**Garde-fou** : ne jamais poser la contrainte `NOT NULL` / DROP uuid tant que l'étape 5 n'est pas
verte (couverture main à 100 % sur les lignes référencées).

**Second garde-fou (personnes/affectations)** : l'étape 5 ne couvre que `coop.activites`. Une SA
employeuse absente de main n'y apparaît pas et laisse pourtant ses salariés sans `main.personne`
ni affectation — le backfill 2b les compte `ok` sans rien écrire. Passer les **trois requêtes de
l'étape 0** du runbook de prep (`adr-002-runbook-prep-prod-pur-main.md`) avant de déployer le
code pur-main, et les repasser après 2b et 3. Mesuré 6 / 4 / 5 sur le restore du 2026-08-06.

Les autres écarts coop → main relevés au même audit (dates d'emploi, référents, piste d'audit)
sont **assumés** : voir le tableau de décisions en fin de runbook de prep.
