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

- `features/dataspace/syncFromDataspaceCore.ts` — le plus complexe : propager `mainId` dans le type
  `PreparedContract` (`:53,:59,:257`), depuis `findOrCreate` (`:296`) et
  `resolveStructureIdFromDataspace`/`getOrCreateStructureFromDataspace` ; ajouter `structureMainId`
  aux `create` (`:472,:510`) et `update` (`:458,:497,:500`). La clé de dédup `getEmploiKey`
  (`:321,:428,:445`) reste sur l'uuid pendant la transition (fiable). Test :
  `syncFromDataspaceCore.integration.ts` (create `:100,132,159,195`).
- `features/structures/use-cases/merge/mutations/mergeStructureAdministrative.ts:20-50` — repointage
  FK à la fusion : `employeStructure` (findMany/updateMany/deleteMany `structureId`) et
  `activite.updateMany structureEmployeuseId` → ajouter/basculer `structureMainId` /
  `structureEmployeuseMainId`. Les ids source/target de fusion doivent être des ids **main**.
- `features/structures/use-cases/merge/mutations/mergeLieuInclusion.ts:18-40,72-75` — idem (exclure
  `mergeMediateursEnActivite:55-66` et `mergeActivitesLieu:81-84` = lieu, faux amis).
- `features/utilisateurs/use-cases/merge/mergeUser.ts:415-423` — `employeStructure.updateMany` sur
  `structureId` → `structureMainId` (source des ids : `emplois.structure` lu `:69-76`, voir B).
- `jobs/update-structures-cartographie-nationale/updateStructuresFromEntrepot.ts:165-180` —
  `employeStructure.updateMany structureId` + `activite.updateMany structureEmployeuseId` →
  colonnes main (exclure `:169-176` = lieu). SQL brut `:249-262` (`PARTITION BY … structure_id`) →
  `structure_main_id`.
- `features/activites/use-cases/cra/db/createOrUpdateActivite.ts:313-315` —
  `structureEmployeuse: { connect: { id: emploi.structure.id } }` →
  `structureEmployeuseMain: { connect: { id: emploi.structureMain.id } }` (dépend de
  `getActeurEmploiForDate` exposant l'id main, voir B).

Tests d'écriture à aligner (ajouter `structureMainId`/`…MainId` aux `create`) :
`getActeurEmploiForDate.integration.ts`, `updateUserFromDataspaceData.integration.ts`,
`mergeStructureAdministrative.integration.ts:41`, `updateStructuresFromEntrepot.integration.ts:29,53`,
`ajouterStructureEmployeuseEnLieuActivite.integration.ts:87`,
`assignPremierAccompagnement.integration.ts:74`, `getMesStatistiquesPageData.integration.ts`.

### B. Lectures via relation Prisma (repointer `coop` → `main`)

**`employeStructure.structure` → `structureMain`** (select/include/where) :

- `auth/getSessionUserFromSessionToken.ts:37` + type `auth/sessionUser.ts:37-38,89-98` — **transverse**
  (`sessionUser.emplois[].structure`). Repointer d'abord ici cascade `tsc` sur tous les consommateurs :
  `HeaderUserMenu.tsx:61,217`, `VerifierInformationsPage.tsx:42`, `RecapitulatifPage.tsx`,
  `mes-outils/_components/CartographieNationaleOutilAccess.tsx:53`, `test/testSessionUser.ts:21`.
- `features/inscription/getStructureEmployeuseForInscription.ts:19`,
  `initializeInscription.ts:210-219,260,289-292`, `getInscriptionRecapitulatifPageData.ts:88`.
- `features/mon-reseau/use-cases/acteurs/db/getActeurEmploiForDate.ts:123-125` + types
  `ActeurEmploi`/`EmploiStructureEmployeuse` (`:19-37`) — alimente `createOrUpdateActivite` (A) et
  `getActeurDetailPageData.ts:144-175`, `getDepartementCodeForActeur.ts:7,13`,
  `ActeurStructureEmployeuse.tsx:9-20`.
- `features/utilisateurs/use-cases/filter/filterUtilisateur.ts:173-186`,
  `queryUtilisateursForList.ts:49-54`.
- `app/administration/utilisateurs/[id]/getAdministrationUserPageData.ts:114-116`,
  `…/[id]/emplois/page.tsx:162-164`, `…/[id]/merge/[mergeId]/getMergeData.ts:99-113`.
- `app/api/v1/utilisateurs/route.ts:535-539,626` (exclure `:642` `ma.structureId` = lieu).
- `app/coop/(full-width-layout)/ma-structure-employeuse/page.tsx:46,66,73`.
- `jobs/update-lieu-activite-a-distance/executeUpdateLieuxActivitesADistance.ts:18-21,34-35`.
- `features/utilisateurs/use-cases/merge/mergeUser.ts:69-76` (feed A).

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
