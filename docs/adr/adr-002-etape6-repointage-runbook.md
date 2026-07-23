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

## Reste à faire

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
- **DIFFÉRÉ (couplé route coop-uuid)** admin utilisateurs *détail* :
  `getAdministrationUserPageData.ts:114-116`, `…/[id]/emplois/page.tsx:162-164`,
  `AdministrationUserPage.tsx` (`getStructuresInfos`, partagé lieu/employeuse, lie vers
  `/administration/structures-employeuses/${uuid}`). À déplacer atomiquement avec la route au socle.
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

1. Migration : `ALTER … DROP COLUMN structure_employeuse_id` / `structure_id` (uuid) ; `ALTER …
   ALTER COLUMN structure_employeuse_main_id SET NOT NULL` (si applicable) ; suppression des
   relations/inverses coop dans `schema.prisma` ; renommage éventuel `*_main_id` → nom canonique.
2. Retirer le dual-write (les `create` ne fixent plus que la colonne main) et les where/dedup
   résiduels sur coop.
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
