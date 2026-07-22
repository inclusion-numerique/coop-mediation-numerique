# ADR-002 : Migration des structures employeuses de `coop` vers `main`

## Auteurs et historique

| Date | Auteur | Action |
|------|--------|--------|
| 2026-07-21 | Marc Gavanier | Rédaction initiale : inventaire, décisions et plan de bascule |

## Statut

Proposé — travail de réconciliation des données terminé, bascule du code à faire.

## Contexte

La Coop maintient sa propre table `coop.structure_administrative` (les « structures employeuses »).
L'Entrepôt de données maintient la sienne, `main.structure_administrative`, qui est la référence
partagée entre les produits de l'inclusion numérique.

Les deux tables décrivent les mêmes entités. Un script de synchronisation recopie périodiquement
les structures de la Coop vers `main`, via la colonne de liaison `main.structure_administrative.structure_coop_id`.
Cette duplication a un coût permanent : dérive des données, doublons, script de synchronisation à
maintenir, et impossibilité de raccrocher les données Coop aux autres produits sans passer par un
appariement approximatif.

**L'objectif est de supprimer la duplication** : abandonner `coop.structure_administrative` au profit
de `main.structure_administrative`, et supprimer le script de synchronisation qui n'aura plus d'objet.

### Prérequis atteint : couverture à 100 %

Une campagne de réconciliation menée en juillet 2026 a amené le delta à zéro : chaque employeuse
Coop non supprimée possède désormais une ligne correspondante dans `main`, reliée par
`structure_coop_id`. Sans cela, les clés étrangères ne pourraient pas être repointées.

Cette campagne s'appuie sur quatre jobs (`corriger-employeuses-sans-siret`,
`deduplicate-employeuses`, `appliquer-plan-couverture`, `couvrir-employeuses-restantes`) et un
toolkit d'audit SQL (`refactor/audit-coop-main/`, non versionné). Elle reste à rejouer en
production.

**L'ordre d'exécution est prescrit** et chaque étape modifie la population que la suivante
analyse.

## Décisions

### 1. Clé étrangère directe vers `main` (`integer`)

`coop.structure_administrative.id` est un `uuid`, `main.structure_administrative.id` est un `integer`.
Les colonnes portant les clés étrangères changent donc de type.

**Décision : contrainte `FOREIGN KEY … REFERENCES main.structure_administrative` réellement posée**,
et non une simple colonne `integer` non contrainte vérifiée par un job.

L'équipe Entrepôt accepte le couplage, et le droit `REFERENCES` sur `main.structure_administrative`
est déjà accordé au rôle `coop-mediation-numerique` (vérifié en base, au même titre que
`INSERT`, `UPDATE`, `DELETE`).

Conséquence assumée : une suppression de ligne côté Entrepôt sera bloquée par nos lignes.

### 2. Client Prisma unique multi-schéma

Aujourd'hui deux clients coexistent : `prismaClient` (schéma `coop`) et `entrepotPrismaClient`
(schéma `main`).

**Décision : passer à un client unique avec `multiSchema`**, et modéliser
`main.structure_administrative` et `main.adresse` dans `apps/web/prisma/schema.prisma`.

Motif : plusieurs requêtes existantes exigent une relation Prisma déclarée entre les deux schémas,
et ne peuvent pas être réécrites en deux requêtes recollées en mémoire sans perte —
voir « Jointures cross-schéma » plus bas. Ce choix converge par ailleurs avec le projet de bascule
de la base Coop vers l'Entrepôt.

**Risque introduit** : nous décrivons dans notre schéma une table que nous ne possédons pas.
Un changement côté Entrepôt (Flyway) casserait notre client silencieusement.
**Mitigation** : une garde locale à la demande — `pnpm -F web db:check-main-drift` introspecte le
schéma `main` réel (lecture seule du catalogue, via `DATABASE_URL`) et échoue s'il a divergé du
snapshot de référence committé (`apps/web/prisma/main.reference.prisma`, régénéré par
`db:refresh-main-reference`). Volontairement **hors CI** : la CI ne se connecte jamais à la base de
l'Entrepôt (pas de credentials prod, pas de couplage réseau) ; le dev lance la garde en local quand
une évolution Flyway est suspectée.

### 3. Écriture directe dans `main`

Une fois `coop.structure_administrative` abandonnée, l'inscription et la synchronisation Dataspace
écrivent directement dans `main.structure_administrative`.

Le problème de dérive (environ une employeuse tous les deux jours arrivant sans ligne `main`)
disparaît par construction, et le script de synchronisation est supprimé.

La logique de création — choix du nom d'antenne, réutilisation d'une adresse existante — est déjà
écrite et éprouvée dans `apps/web/src/jobs/structures-main/creerLigneMain.ts`. Elle doit être
déplacée du job vers le socle applicatif.

### 4. Bascule one-shot, sans suppression

**Décision : une seule PR, un seul déploiement.**

Ni `coop.structure_administrative` ni `main.structure_administrative.structure_coop_id` ne sont
supprimées. Elles restent en place après la bascule, ce qui rend la marche arrière possible :
le script de retour est le même `UPDATE` dans l'autre sens, et il est écrit en même temps que la
migration aller, pas après.

**Validation** : restauration d'une sauvegarde iso-production en local et rejeu complet de la
bascule, juste avant la mise en production.

### 5. Passage en abilities limité au strict nécessaire

Seul le code qui touche la structure administrative passe au format `features/*/abilities`, quitte à
laisser des features à moitié refactorées. Les abilities étant indépendantes par construction, la
cohabitation est acceptable.

En pratique cela concerne le socle « structures ». Aucune feature n'est aujourd'hui en abilities sur
ce périmètre (seul `features/beneficiaire/abilities/` existe, et il ne touche pas les structures).

### 6. Abandon des champs référent

`coop.structure_administrative` porte quatre champs sans équivalent dans `main` :
`nom_referent` (2 880 lignes), `courriel_referent` (2 907), `telephone_referent` (2 897),
`complement_adresse` (71).

Ils ne sont **affichés nulle part**. Ils n'ont que deux usages :

- `features/dataspace/syncFromDataspaceCore.ts:304` les écrit depuis le contact Dataspace ;
- `server/rpc/inscription/inscriptionRouter.ts:241` les lit, uniquement pour les recopier dans le
  lieu créé quand l'utilisateur déclare « ma structure employeuse est aussi mon lieu d'activité ».

Ce ne sont pas des données métier de l'employeuse, mais un tampon de recopie vers le lieu.

**Décision : abandon.** Le contact est lu directement depuis Dataspace au moment de créer le lieu.
Une table satellite `coop.structure_administrative_complement` avait été envisagée puis écartée :
elle aurait créé une table pour des données que rien ne lit.

`main.structure_administrative.contact` (jsonb, forme `{site_web, telephone}`, renseigné sur 4 296
lignes par d'autres producteurs) a également été écarté comme destination : y écrire nos référents
serait s'inviter dans une sémantique qui ne nous appartient pas.

## Inventaire

### Surface des clés étrangères : deux colonnes

| colonne | lignes | structures distinctes |
|---|---:|---:|
| `coop.activites.structure_employeuse_id` | 3 984 470 | 3 381 |
| `coop.employes_structures.structure_id` | 8 833 | 3 499 |

Faux amis écartés : `coop.activites.structure_id` et `coop.mediateurs_en_activite.structure_id`
pointent vers `lieu_inclusion`. Les colonnes `structure_*` de `cras_conseiller_numerique_v1` sont du
texte legacy V1 sans contrainte.

La migration de données se réduit donc à deux `UPDATE`. Le seul enjeu est le volume : un
`ALTER COLUMN … TYPE integer` sur 4 M de lignes réécrit toute la table. À mesurer en local ;
prévoir sinon une colonne ajoutée, remplie par lots, puis échangée.

### Surface de code : environ 100 fichiers

| zone | fichiers | nature |
|---|---:|---|
| Administration (liste, détail, fusion SA, fusion user, emplois) | 27 | dense, peu de logique |
| Inscription / création de profil | 14 | deux chemins d'écriture concurrents |
| Profil / affichage / mon-réseau | 11 | dont trois SQL bruts |
| Statistiques, filtres, exports | 10 | mécanique : ne portent que `{id, nom, commune}` |
| Socle « structures » | 8 | le cœur |
| CRA / activités | 8 | une seule écriture réelle |
| Équipe / coordination | 6 | dépend d'un SQL brut avec `JOIN` |
| tRPC, API v1, Dataspace / ProConnect | 12 | |

Une large part de ce volume n'est que la propagation d'un type `{ id: string }` → `{ id: number }`.

### Blocage identifié : un id d'employeuse réutilisé comme id de lieu

`apps/web/src/server/rpc/inscription/inscriptionRouter.ts:247` — procédure
« ma structure employeuse est aussi mon lieu d'activité » :

```ts
await prismaClient.lieuInclusion.upsert({
  where:  { id: structureEmployeuseId },   // l'uuid de l'employeuse
  update: {},
  create: structureEmployeuse,
})
```

Le lieu est créé **avec l'id de l'employeuse**, et cet id sert de test d'idempotence.
Dès que l'id d'employeuse devient un `integer` venant de `main`, la procédure ne peut plus
fonctionner : `lieu_inclusion.id` est un `uuid`.

`packages/fixtures/src/structures.ts` fait la même chose et casse également.

**Point ouvert** : il faut choisir un nouveau critère d'idempotence pour remplacer
« le lieu porte l'id de l'employeuse ». C'est la seule décision de conception encore à prendre.

### Deux chemins de création concurrents

- `features/structures/findOrCreateStructureAdministrative.ts` — find-or-create par SIRET, puis RNA,
  puis nom + code INSEE. Utilisé par la synchronisation Dataspace et l'import SIRET.
- `server/rpc/inscription/getOrCreateStructureEmployeuse.ts:88` — fait son propre `create` sans passer
  par le précédent. Utilisé par `inscription.renseignerStructureEmployeuse` et `employeStructure.creer`.

Les deux devront écrire dans `main`. C'est le doublon le plus facile à oublier ; à unifier avant la
bascule.

### Types mélangeant lieu et employeuse

`features/structures/siret/siretBearingStructures.ts` et
`features/structures/correlateStructureAdministrative.ts` placent dans une même structure de données
des ids de lieu (`uuid`) et d'employeuse. Indolore aujourd'hui — les deux sont des `uuid` — mais
impossible après la bascule. À disjoindre en préalable.

### Jointures cross-schéma

Quatre requêtes brutes nomment la table en dur, triviales à requalifier :

- `equipe/EquipeListePage/searchMediateursCoordonneBy.ts:114` — `INNER JOIN "structure_administrative"`
- `features/mon-reseau/getMonReseauPageData.ts:22` — `LEFT JOIN structure_administrative`
- `features/mon-reseau/use-cases/acteurs/db/searchActeurs.ts:175` et `:204` — idem
- `features/activites/use-cases/list/db/activitesFiltersSqlWhereConditions.ts:220` — filtre sur la FK

Deux requêtes Prisma en revanche **exigent** la relation cross-schéma déclarée, et motivent à elles
seules la décision 2 :

- `features/structures/getStructuresEmployeusesOptions.ts:18` — traverse
  `structure_administrative → employes_structures → users → mediateurs`
- `features/structures/use-cases/list-administrative/StructuresAdministrativesDataTable.tsx:70` —
  tri SQL sur `orderBy: { emplois: { _count } }`

## Complétude des données `main`

Sur les 3 797 lignes appariées, deux catégories de trous ont été mesurées.
Le détail ligne à ligne est exporté dans `refactor/audit-coop-main/out/lignes-main-incompletes.csv`
(175 lignes, la valeur `main` manquante et la valeur `coop` en regard).

### Dénomination : 82 lignes, dont 14 vrais trous

68 des 82 lignes sans `denomination_sirene` possèdent une `denomination_antenne`. La règle
d'affichage retenue — `denomination_antenne ?? denomination_sirene` — les couvre.

Les 14 restantes n'ont aucun nom. Toutes ont un SIRET, et le motif est explicable : ce sont presque
toutes des **entreprises individuelles**, auxquelles SIRENE n'attribue pas de dénomination mais un
nom et un prénom, plus un cas `[Non-Diffusible]`. Les deux plus exposées sont le siège de la CC La
Rochefoucauld Porte du Périgord (2 297 activités) et HYPRA (1 176).

Correction : recopier le `nom` Coop dans `denomination_antenne`. Aucun appel API nécessaire.

### Adresse : 98 lignes, toutes récupérables

Les 98 lignes sans `adresse_id` sont récupérables à 100 % depuis `coop.adresse`, `commune`,
`code_postal` et `code_insee`, tous `NOT NULL`. Il s'agit surtout de grandes collectivités
(Mulhouse, Basse-Terre, Département de l'Orne, CC du Pays d'Ancenis…), représentant 47 000 activités.

La logique de création d'adresse avec réutilisation d'une ligne existante — nécessaire à cause de la
contrainte d'unicité sur `main.adresse` — est déjà écrite dans
`jobs/structures-main/creerLigneMain.ts`.

**Aucun de ces 112 cas ne bloque la migration** : un job de complétion alimenté uniquement par des
données déjà en base les ferme tous.

### Divergence de noms

Les noms diffèrent sur 275 des 3 797 lignes (`coop.nom` ≠ `main.denomination_sirene`), le plus
souvent légitimement — il s'agit d'antennes. D'où la règle d'affichage
`denomination_antenne ?? denomination_sirene`.

## Plan de bascule

Ordre des commits, du plus risqué au plus mécanique, pour que le sujet difficile soit traité tant
qu'il reste de la marge :

1. redessiner `inscriptionRouter` « employeuse = lieu d'activité » pour ne plus réutiliser l'id
   (et les fixtures), avec les tests d'intégration existants comme filet ;
2. modéliser `main.structure_administrative` et `main.adresse` dans `schema.prisma` (`multiSchema`),
   avec la garde locale à la demande contre la dérive de schéma ;
3. disjoindre les types lieu / employeuse dans `siretBearingStructures` et
   `correlateStructureAdministrative` ;
4. unifier les deux chemins de création derrière `findOrCreateStructureAdministrative`, écrivant
   désormais dans `main` ;
5. job de complétion des 14 dénominations et 98 adresses ;
6. migration SQL des deux colonnes de clé étrangère, avec le script de retour arrière écrit dans la
   foulée ;
7. repointage du code lecteur, zone par zone : socle → inscription → profil → CRA → équipe →
   administration → filtres et statistiques ;
8. passage en abilities du seul socle « structures » ;
9. suppression des jobs de synchronisation et de réconciliation devenus sans objet.

## Conséquences

**Positives**

- Une seule table de référence pour les structures employeuses, partagée avec les autres produits.
- Suppression du script de synchronisation et des jobs de réconciliation.
- Disparition par construction de la dérive quotidienne des employeuses non synchronisées.
- Intégrité garantie par une vraie contrainte de clé étrangère.

**Négatives ou à surveiller**

- Couplage au schéma de l'Entrepôt : une modification de leur côté peut casser notre client Prisma.
  Mitigé par la garde CI, pas éliminé.
- Nos lignes bloquent leurs suppressions.
- Perte des champs référent (assumée, décision 6).
- Une migration de 4 M de lignes à exécuter en production, dont le coût reste à mesurer.
- Environ 100 fichiers modifiés dans une seule PR, dont la relecture sera lourde.
