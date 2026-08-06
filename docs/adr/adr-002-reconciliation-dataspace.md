# ADR-002 — Réconciliation avec le plan Dataspace (#1707) : points à trancher

Fil conducteur de discussion. Chaque point confronte **notre implémentation / ADR-002** (côté coop,
branche `refactor/lieu-employeuse`) au **plan de bascule de l'Entrepôt** (issues
`anct-cnum/suite-gestionnaire-numerique` #1705, #1707, #1729, et la relecture de Philippe sur la PR
`inclusion-numerique/coop-mediation-numerique#575`).

On traite les points **un par un**. Chaque point porte un statut et une case **Décision** à remplir.

Statuts : 🔴 à trancher · 🟡 en discussion · 🟢 tranché · ✅ aligné (rien à décider).

---

## Sources

- **#1705** (closed) — Synchroniser `main.SA`/`main.LI` avec la coop : chiffrage des orphelins, FK, fusions.
- **#1707** (open) — Plan chapeau « rendre caduque `coop.structure_administrative` ». Recadré le 2026-07-23.
- **#1729** (open) — Sens métier de `est_active` sous écriture directe coop. **P0, assigné à Marc.**
- **PR #575** (commentaire Philippe) — relecture côté Entrepôt, 5 questions directes.
- **Notre cadrage** — `adr-002-migration-structures-employeuses-vers-main.md` + `adr-002-etape6-repointage-runbook.md`.

---

## Point 1 — Périmètre de la bascule : SA seule, ou SA + personnes + affectations ?

**Notre position (ADR-002).** Le périmètre est **uniquement** `structure_administrative` (l'identité
employeuse). Rien sur `main.personne` ni sur les affectations emploi.

**Ce que dit le Dataspace (#1707, « Acté »).** La bascule groupe **trois** chantiers présentés comme
déjà actés côté coop :
- (a) SA `coop.structure_administrative` → `main.structure_administrative` — *notre ADR* ;
- (b) **la coop synchronise elle-même `main.personne`** depuis `coop.users` (insert + update rôles),
  remplaçant le connecteur/`ingest_utilisateurs` de l'Entrepôt ;
- (c) **suppression de `coop.employes_structures`** au profit d'écritures directes dans
  `main.personne_affectations_emploi`.

**Enjeu.** Est-ce que (b) et (c) ont réellement été actés avec l'Entrepôt, ou #1707 sur-annonce-t-il
sur la foi de discussions ? La réponse conditionne tous les points suivants (surtout 2 et 3).

**Options.**
- **A** — Périmètre large : on assume (a)+(b)+(c). ADR-002 à étendre (personne + affectations).
- **B** — Périmètre étroit : ADR-002 reste SA-seule ; (b)/(c) = chantiers séparés, plus tard. À
  clarifier avec l'Entrepôt pour aligner #1707.
- **C** — Séquencé : (a) maintenant (notre PR en cours), (b)/(c) actés mais planifiés après, avec un
  ticket coop dédié.

**Décision (2026-07-23, Marc) : 🟢 périmètre LARGE, variante « FK personne » — dans la MÊME PR.**
- La coop **ne fait pas autorité** sur les structures employeuses, **sauf en créer de nouvelles à
  l'inscription**.
- On **supprime** `coop.structure_administrative` **ET** `coop.employes_structures` ; on les remplace
  par `main.structure_administrative` + `main.personne_affectations_emploi`.
- **On NE migre PAS `coop.user` → `main.personne`** (trop d'impact). À la place : on **réutilise la
  colonne existante `main.personne.coop_id`** comme FK vers `coop.user.id` (déjà renseignée par
  l'Entrepôt, ~6 141 personnes) → **aucun ajout/backfill de colonne côté `coop.user`**. Join :
  `coop.user ← main.personne.coop_id · main.personne → main.personne_affectations_emploi →
  main.structure_administrative`.
- Le tout dans **une seule PR**.

**Détails FK (2026-07-23) :**
- Sens : **`main.personne.coop_id → coop.user.id`** (la contrainte vit sur `main.personne`, donc
  **posée par Flyway/Entrepôt** — à coordonner avec Philippe). Côté coop, on **modélise la relation
  Prisma** pour traverser `user.personne` (multiSchema), sans laisser Prisma créer la contrainte sur
  `main`.
- Pré-requis : `main.personne.coop_id` doit être **unique** (1 user ↔ 1 personne) pour une relation
  propre. À vérifier.

> Variante par rapport au #1707 (b) : la coop **ne devient pas propriétaire/synchroniseur** de
> `main.personne` ; elle s'y **rattache** par une FK. `main.personne` reste alimentée comme
> aujourd'hui (→ à confirmer, Point 3 : qui crée la ligne `main.personne` d'un nouveau user coop ?).

**Actions qui en découlent :**
- Point 2 **pré-décidé** : `coop.employes_structures` disparaît → reste la **question schéma/perte
  d'info** (début/fin, audit, historisation) sur `main.personne_affectations_emploi`.
- Nouveau modèle Prisma : relation `coop.user → main.personne` (FK) + `main.personne →
  main.personne_affectations_emploi → main.structure_administrative`.
- **Impact sur l'étape 6 déjà faite** : le dual-write `structure_main_id` sur `employes_structures`,
  la migration FK 6c, et le repointage des lectures vers `emploi.structureMain` deviennent
  **transitoires/à refaire** (les lectures passeront par `main.personne_affectations_emploi`). Les
  **mappers d'affichage** (`employeuseMainToLieuData/AdminStructure`, `mainContact`) **survivent** (la
  cible reste `main.structure_administrative`).
- `renseignerStructureEmployeuse` (inscription) devra créer l'affectation dans
  `main.personne_affectations_emploi` (source='coop'), plus dans `coop.employes_structures`.

---

## Point 2 — Sort de `coop.employes_structures` (le plus impactant) 🟢

> **Tranché** : la table **disparaît** → `main.personne_affectations_emploi` (`est_active`) +
> `main.contrat` (dates, best-effort). Détails ci-dessous.

**Notre position (implémentation étape 6).** On **garde** la table : dual-write `structure_main_id`,
repointage de sa FK vers `main.structure_administrative`, et repointage de ses lectures.

**Ce que dit le Dataspace (#1707 + PR #575 pt 3-4).** La table est **appelée à disparaître** au profit
de `main.personne_affectations_emploi`. Philippe recommande de **faire l'analyse de schéma AVANT**
d'investir dans le repointage des lectures d'une table condamnée. Il note que le dual-write
`structure_main_id` reste un « bon échafaudage de transition ».

**Enjeu.** Perte d'information à instruire : `employes_structures` porte **début/fin d'emploi,
`suppression`, audit `*_par_id`, historisation** ; `personne_affectations_emploi` n'a que `est_active`
+ **une ligne unique** par (personne, structure, source). Migrer sans analyse = risque de perdre
l'historique et l'audit. Et une partie de notre étape 6 (repoint des *lectures* d'`employes_structures`)
serait du **travail jeté** si la table disparaît.

**Vérification schéma main (2026-07-23, introspection locale)** — *où sont les dates d'emploi ?*
- `main.personne_affectations_emploi` = `personne_id`, `structure_administrative_id`, `source`,
  **`est_active`**, `created_at`/`updated_at`. → **pas de début/fin**.
- **`main.contrat`** = `personne_id`, **`date_debut`**, **`date_fin`**, `date_rupture`, `type`,
  `structure_id` → SA. **Les dates existent là**, jointes par `personne_id` + `structure_id`.
- `main.poste` = `date_attribution`/`date_rendu_poste` (dispositif CN/idposte).
- **MAIS couverture partielle** : 7 311 affectations `source='coop'` → seules **3 436 (~47 %)** ont un
  `contrat`. Les ~53 % restantes (employeuses déclarées coop, `debut` inventé `now()`) **sans contrat**.

**Options (réévaluées)** :
- **A** — Étendre `main.personne_affectations_emploi` (Flyway/Entrepôt) avec `debut`/`fin`. Couverture
  complète, mais coordination + change une table Entrepôt.
- **A'** — La coop **écrit dans `main.contrat`** à la création d'emploi + backfill des ~53 % manquants.
  Réutilise le schéma, mais sémantique « contrat » possiblement CN-spécifique (accord Philippe) +
  backfill lourd.
- **B** — **`est_active` seul.** `getActeurEmploiForDate` attache le CRA à l'employeuse **active**
  (courante) ; on perd « employeuse à une date passée » (impacte surtout les CRA **rétro-datés** d'un
  médiateur ayant **changé** d'employeuse — rare). Enrichissement best-effort possible via `contrat`
  (47 %) sans en dépendre.

**Mesure du besoin réel (2026-07-23, base locale)** — le cas « employeuse à une date passée » ne sert
que pour un médiateur à **plusieurs employeuses dans le temps** :
- 4 429 users avec emploi → **176 (4 %)** multi-employeuses (dont **95 CN** couverts par `contrat`,
  **81 non-CN** non couverts = **1,8 %**) ; **11 users** (0,2 %, non-CN) ont ≥2 emplois actifs
  simultanés (ambigus même avec dates) ; **83 %** des `debut` non-CN sont des **artefacts d'inscription**.

**Décision (2026-07-23, Marc) : 🟢 `est_active` + `main.contrat` best-effort.**
- **Employeuse courante** = `main.personne_affectations_emploi.est_active` (couvre 96 % : une seule
  employeuse → aucune ambiguïté).
- **Dates / précision temporelle** = `main.contrat` (`date_debut`/`date_fin`, join
  `personne → contrat → structure_administrative`) en **best-effort** : donne la bonne employeuse à une
  date passée pour les 95 CN ; les 81 non-CN retombent sur l'employeuse courante.
- **Abandon** de `coop.employes_structures.debut_emploi`/`fin_emploi` (artefacts pour l'essentiel, ou
  redondants avec `main.contrat` pour les CN). Aucune extension de schéma Entrepôt.

**Actions qui en découlent :**
- Réécrire `getActeurEmploiForDate` sur `main.personne_affectations_emploi` (est_active) +
  `main.contrat` (dates best-effort), au lieu de `coop.employes_structures`.
- Modéliser en Prisma (multiSchema) : `personne_affectations_emploi`, `contrat` (+ relations vers
  `personne` / `structure_administrative`).
- Ne **pas** migrer `debut`/`fin` ; ne pas étendre `personne_affectations_emploi`.
- La coop **maintient `est_active`** (source='coop') : `true` à la création d'emploi, `false` à la
  fin/suppression/changement d'employeuse → **sémantique à poser en #1729** (Point 3-ii).

---

## Point 3 — `main.personne` + `est_active` (#1729, P0, assigné à Marc) 🟡

> **Recadré par le Point 1** : la coop **ne synchronise pas** `main.personne` (variante FK, pas
> propriété). Restent : (i) **qui crée la ligne `main.personne`** d'un nouveau user coop pour que la
> FK pointe quelque part (l'Entrepôt garde-t-il `ingest_utilisateurs` ? ou la coop insère-t-elle une
> personne minimale à l'inscription ?) ; (ii) `est_active` : la coop **écrivant** des affectations
> `source='coop'`, elle en maintient la sémantique (#1729 reste sur Marc).

**Notre position.** Absent de l'ADR-002.

**Ce que dit le Dataspace (#1707, #1729).** Si (b)/(c) sont retenus : la coop **définit et maintient**
la sémantique de `est_active` pour `source='coop'` (aujourd'hui gérée par le cycle reset/réactivation
du coop-dag, qui disparaît), et fait une **resynchro de masse** à la bascule. La clé de jointure
activités↔personnes serait `coop.activites.mediateur_id ↔ main.personne.coop_id` (à confirmer : id
médiateur ou id user ?). Caveat : `conseiller_numerique_id` (id v1) absent du schéma coop.

**Enjeu.** Nouveau périmètre non chiffré, dépendant du Point 1. Dépend aussi du Point 2 (si
`employes_structures` reste, le besoin change).

**Décision (2026-07-23, Marc) — sous-question (i) : 🟢 pivot = EMAIL.**
Quand la coop doit **relier un user** à `main.personne` (à l'inscription, dans la même transaction que
la SA + l'affectation), deux cas, **tranchés par l'email** :
- la personne **existe déjà** (autre flux : idposte, CN Dataspace…) → on **pose simplement `coop_id`**
  dessus (find par email) ;
- elle **n'existe pas** → on **crée** `main.personne` (avec `coop_id` + email).
Ça règle du même coup l'**angle mort** : les users hors inscription-coop sont retrouvés par email s'ils
existent via un autre flux ; sinon la coop les crée quand elle en a besoin. Pas de synchro continue.

**Détail d'implémentation à confirmer** : l'email vit dans `main.personne.contact` (jsonb, forme
`{"<source>": {"email": …}}`, ex. `{"coop": {"email": …}}`) et dans la table `main.contact` (colonne
`email`). Le « find par email » doit matcher **toutes sources confondues** (un idposte avec le même
email = « existe déjà »). Mécanique exacte (chemin jsonb vs jointure `main.contact`) à figer au dev.

**Nuances à instruire :**
- **Idempotence** : `find-or-create` par `coop_id` (pattern `ensurePersonneMain`, analogue à
  `ensureStructureAdministrativeMain`), pas un `INSERT` aveugle — un CN déjà synchronisé par l'Entrepôt
  peut déjà avoir sa `main.personne`. S'appuyer sur l'unicité de `coop_id` (`ON CONFLICT DO NOTHING`).
- **Coordination Entrepôt** : si l'Entrepôt continue `ingest_utilisateurs`, double producteur de
  `main.personne` → l'upsert idempotent + `coop_id` unique évitent les doublons. À caler avec Philippe
  (le #1707 prévoit de décommissionner `ingest_utilisateurs` — mais alors qui crée les personnes des
  users NON issus de l'inscription coop, ex. idposte/CN Dataspace ?).

**Sous-question (ii) — `est_active`** : cadrée par le Point 2. `est_active` (source='coop') devient
**le** signal « employeuse courante » lu par la coop → la coop doit le **maintenir** : `true` à la
création d'emploi, `false` à la fin / suppression / changement d'employeuse. Sémantique exacte à
**documenter et implémenter en #1729** (+ resynchro de masse à la bascule pour remplacer le cycle
reset/réactivation du coop-dag qui disparaît).

**Actions qui en découlent :**
- #1729 : poser la sémantique `est_active` source='coop' + maintenance par l'écriture directe coop.
- Résoudre l'angle mort (i) : qui crée `main.personne` pour les users **hors** inscription-coop
  (idposte/CN Dataspace, users sans employeuse) — Entrepôt garde-t-il un flux ? → à caler avec Philippe.

---

## Point 4 — `ON DELETE SET NULL` vs `RESTRICT` (contradiction interne avérée) 🟢

**Fait vérifié.** La migration `20260723010642_repointer_employeuse_vers_main_colonnes` pose les 2 FK
en **`ON DELETE SET NULL`**. L'ADR-002 (décision 1) annonce l'inverse : « *une suppression de ligne
côté Entrepôt sera bloquée par nos lignes* » (= `RESTRICT`/`NO ACTION`). Philippe (PR #575 pt 2) le
relève : un hard-delete de SA côté Entrepôt **débrancherait silencieusement** des emplois/activités
coop au lieu d'être bloqué.

**Enjeu.** Sans impact sur la fusion MIN (soft-delete), mais divergence entre l'intention affichée et
le code. À clarifier : transitoire (jusqu'à l'échange final) ou définitif ?

**Options.**
- **A** — Passer les FK en `RESTRICT` (aligner sur l'intention ADR : bloquer les hard-deletes).
- **B** — Assumer `SET NULL`, **corriger l'ADR**, et documenter côté Entrepôt qu'aucun hard-delete de
  SA n'est permis sans coordination.

**Décision (2026-07-23, Marc) : 🟢 `RESTRICT` (option A).**
Aligne le code sur l'ADR (« nos lignes bloquent leurs suppressions »), sur l'attente de l'Entrepôt
(leur moteur de fusion **repointe-puis-supprime**, ce que `RESTRICT` force — #1705), et supprime le
risque de perte silencieuse (un hard-delete Entrepôt nullifierait sinon des emplois/activités coop).
Le `SET NULL` actuel est un **artefact** (Prisma génère `SET NULL` par défaut pour une relation
nullable), pas un choix.

**Actions qui en découlent :**
- Toute FK coop → `main.structure_administrative` doit être **`onDelete: Restrict`** (Prisma + SQL).
  Concerne `coop.activites.structure_employeuse_main_id` (**pérenne** — les activités restent coop) et,
  tant qu'elle existe en transition, la FK sur `coop.employes_structures`.
- ⚠️ **Ne pas patcher isolément la migration 6c maintenant** : elle est retravaillée par les Points
  1-2 (`employes_structures` disparaît). Poser `RESTRICT` dans le **jeu de migrations final**.
- Corriger l'ADR-002 décision 1 si on avait laissé traîner une formulation ambiguë (intention =
  `RESTRICT`, désormais tenue).

---

## Point 5 — Corrélation lieu ↔ SA : notre `nom+codeInsee` vs leur table d'association 🟢

**Notre position.** Pas de FK matérialisée `lieu_inclusion.structure_administrative_id` (retirée
étape 1). Corrélation par **`nom + adresse + codeInsee`** (dont l'anti-doublon ajouté cette session
pour la matérialisation employeuse→lieu).

**Ce que dit le Dataspace (#1707, commentaire SA↔LI).** L'Entrepôt a déjà **matérialisé**
`main.lieu_inclusion_structure_administrative` (asso construite depuis l'uuid partagé du split, à
**99,95 %**) et attend que **la coop la consomme comme asso de référence**, sa corrélation
`nom+codeInsee` (`getEmploisCountByCorrelation`) étant censée **disparaître**.

**Enjeu.** Adopte-t-on leur table d'asso (couplage supplémentaire au schéma Entrepôt, mais source
unique) ou garde-t-on notre corrélation applicative ? Impacte les lectures neutres (comptage d'emplois)
et le flux inscription (matérialisation du lieu).

**Décision (2026-07-23, Marc) : 🟢 corrélation applicative `nom + adresse + codeInsee`, UNIQUEMENT.**
- `main.lieu_inclusion_structure_administrative` est considérée **legacy / sans raison d'être** ; la
  coop **ne la consomme pas**.
- Le lien lieu ↔ employeuse se fait **exclusivement** sur `nom + adresse + codeInsee`. **Pas de
  correspondance = pas de lien** (assumé : « alors ce n'est pas la même chose »).
- Cohérent avec l'anti-doublon inscription de cette session (déjà sur `nom+adresse+codeInsee`).

**⚠️ Divergence explicite avec le #1707** (qui prévoyait que la coop consomme leur asso et abandonne
`getEmploisCountByCorrelation`) → **à remonter à Philippe** : on garde la corrélation applicative, leur
table d'asso ne nous sert pas.

**Actions qui en découlent :**
- Ne rien câbler sur `main.lieu_inclusion_structure_administrative`.
- Garder/consolider la corrélation `nom+adresse+codeInsee` (matérialisation lieu à l'inscription,
  comptages). NB : `coop.structure_administrative` disparaissant (Point 1), la corrélation se fait
  entre le `main.structure_administrative` (employeuse) et `coop.lieu_inclusion` (les lieux restent
  coop, Point 6).
- Réponse à intégrer au retour à Philippe (PR #575 / #1707).

---

## Point 6 — Lieux recadrés hors bascule (2026-07-23) 🟢

**Ce que dit le Dataspace (#1707, recadrage).** Les **lieux sortent du ticket** : `coop.lieu_inclusion`
n'est **plus** à rendre caduque. La coop reste **maîtresse des lieux**, MIN devient consommateur.
Exploration à venir d'une « concaténation lieux carto + `coop.lieux_inclusion` » comme source MIN, et
arrêt éventuel du carto-dag (#1724).

**Notre position.** Branche `refactor/lieu-employeuse` ; on a fait de la matérialisation
employeuse→lieu (le lieu reste côté coop). Cohérent en apparence.

**Enjeu.** Confirmer que rien dans notre plan ne vise à faire disparaître quoi que ce soit côté lieu,
et acter que le SA↔LI (Point 5) est le seul point de contact lieu restant dans ce périmètre.

**Décision (2026-07-23, Marc) : 🟢 aucun changement sur les lieux dans cette PR — SA uniquement.**
- `coop.lieu_inclusion` **inchangée** ; les lieux restent gérés par la coop, MIN consommateur.
- Seul lien lieu↔SA = la corrélation `nom+adresse+codeInsee` (Point 5).
- La même philosophie (arrêter les synchros, partager les données directement avec l'Entrepôt)
  s'appliquera aux lieux **plus tard**, hors de cette PR.

**Actions qui en découlent :**
- `#1724` (carto-dag, source lieux MIN) = **chantier futur séparé, aligné** avec la direction — pas un
  blocage ni un périmètre de cette PR. Simple note de dépendance.
- (Cosmétique) le nom de branche `refactor/lieu-employeuse` est un peu trompeur (le périmètre réel =
  employeuses) — sans conséquence.

---

## Point 7 — Points techniques coop attendus par l'Entrepôt

**Ce que dit le Dataspace (#1707).**
- `apps/web/prisma/entrepot/schema.prisma` encore en `String[]` → **passer aux enums**, sinon casse à
  la lecture de `main.lieu_inclusion`.
- **Grants Flyway** : le rôle coop a `REFERENCES/INSERT/UPDATE/DELETE` sur `main.SA` « vérifié en
  base », mais **aucune migration Flyway ne les pose** → à codifier (reproductibilité dev/CI), à
  étendre à `main.personne` / `main.personne_affectations_emploi` si Point 1 = large.

**Enjeu.** Petites dettes concrètes, à intégrer au périmètre de la PR de bascule ou à des tickets.

**7a — Vérification (2026-07-23, introspection locale) : écart RÉEL et sur un chemin exercé.**
- `entrepot/schema.prisma` modèle `LieuInclusion` avec **11 colonnes `String[]`**. En base, **10 sont
  des `enum[]`** (seule `autres_formations_labels` = `text[]`) : `dispositif_programmes_nationaux`,
  `formations_labels`, `frais_a_charge`, `itinerance`, `modalites_acces`, `modalites_accompagnement`,
  `prise_en_charge_specifique`, `publics_specifiquement_adresses`, `services`, `typologies`.
- **8** de ces `enum[]` sont **sélectionnées** par `structure/cartoStructureFromEntrepot.ts`
  (`lieuSelect`) — chemin vivant (reconstruction `CartoStructure` pour l'import de lieu d'activité, via
  `searchStructureCartographieNationale` + inscription).
- Colonnes **massivement peuplées** (17 636 lignes `typologies`, 20 103 `services`) → la
  désérialisation `enum[]`→`String[]` est exercée à chaque lecture. Code récent (`feat/carto-entrepot`).
- **Fix** : déclarer les 10 enums dans `entrepot/schema.prisma` + passer les colonnes en `Enum[]`, puis
  `prisma generate` (client entrepot). NB : ne PAS faire un `db pull` brut (il tirerait les 18 tables
  main et perdrait le schéma curé à 2 modèles) → édition manuelle des 10 enums (valeurs via `pg_enum`).
  Le type manuel `LieuRow` (`string[]`) reste compatible (valeurs enum = littéraux, assignables à string).

**Décision (2026-07-23, Marc) : 🟢 différé à une PR séparée** — l'écart concerne le client de lecture
carto/`lieu_inclusion`, **hors** périmètre « structures administratives » de cette PR. À corriger dans
une PR dédiée (enums `entrepot/schema.prisma`), cohérent avec le Point 6 (rien sur les lieux ici).

**7b — Grants Flyway.** *Qui demande / pourquoi* (clarification 2026-07-23) : c'est le **plan #1707
Phase 3** (Philippe). Raison : la coop va **écrire directement** dans des tables `main` → le rôle
Postgres derrière le `DATABASE_URL` coop a besoin de `INSERT/UPDATE/DELETE/REFERENCES` sur ces tables.
Ces droits ont été posés **à la main** en base (« vérifié en base ») mais **aucune migration Flyway ne
les crée** → ils **n'existent pas** dans une base dev/CI fraîche → l'app coop échouerait à écrire dans
ces environnements. L'Entrepôt (qui possède `main` via Flyway) doit donc **codifier** ces grants ; pour
ça il lui faut **la liste** de ce dont la coop a besoin.

**Décision (2026-07-23, Marc) : 🟢 différé.** La liste **tombera naturellement** du code une fois les
chemins d'écriture implémentés (on saura exactement quelles tables/privilèges). On la fournira à
Philippe à ce moment-là, pas maintenant.

**Contexte rôle (Marc, 2026-07-23)** : pour l'instant, les migrations coop sont appliquées via le rôle
**`sonum`** — le seul qui a le droit d'appliquer nos migrations sur le schéma `coop`. C'est donc à
`sonum` que devront être accordés les grants sur les tables `main` (à confirmer avec l'Entrepôt).

**Actions qui en découlent :**
- À l'implémentation : dresser la liste des grants (table × privilège) et la transmettre à l'Entrepôt
  pour la migration Flyway. Tables pressenties : `structure_administrative`, `adresse`, `personne`,
  `personne_affectations_emploi` (± `contact`) ; SELECT partout ; REFERENCES pour les FK.

---

## Questions factuelles de Philippe — réponses à confirmer puis poster

| Source | Question | Réponse proposée | Statut |
|---|---|---|---|
| PR #575 Q1 | `mergeStructureAdministrative` disparaît de la coop ? | **Oui, fait** (`c1961964`). Fusion SA exclusive à MIN — aligné. | ✅ à confirmer |
| PR #575 Q5 | Plus de corrélation matérialisée lieu↔SA ? | **Confirmé** : pas de colonne, corrélation `nom+adresse+codeInsee`. ⚠️ Description PR #575 à corriger (référence une colonne absente). | ✅ à confirmer |
| #1705 | Prédicat de suppression des `structure_coop_id` orphelins : test sur **les deux** tables coop, ou seulement `structure_administrative` ? | **Vérifié (script `refactor/audit-coop-main/cleanup-dangling-coop-ids.sh:41`) : prédicat MÊME-TABLE** (`main.SA` testé contre `coop.SA` seul, `main.LI` contre `coop.LI` seul), **pas les deux**. Donc c'est bien le cas redouté. **MAIS** : les coop_id nullés sont **capturés en CSV** (`out/nulled-structure_administrative-*.csv` = **1031**, `nulled-lieu_inclusion-*.csv` = **912**) → récupérables ; et un **rattrapage par SIRET** a été fait (`link-employeuses-main` +156 liens + réconciliation à 100 %). Pas de perte permanente. | 🟢 à poster |
| PR #575 Q2 | `SET NULL` vs `RESTRICT` transitoire/définitif ? | Voir **Point 4**. | 🔴 |
| PR #575 Q3-4 | Séquencement `employes_structures` / analyse de schéma avant repoint des lectures ? | Voir **Points 2 + 3**. | 🔴 |

---

## Journal des décisions

- **2026-07-23 — Point 1 (périmètre) : 🟢 tranché.** Périmètre large, variante « FK personne ».
  Supprimer `coop.structure_administrative` + `coop.employes_structures` → `main.structure_administrative`
  + `main.personne_affectations_emploi`. Pas de migration `coop.user`→`main.personne` : FK à la place.
  Même PR. → Pré-décide la direction du Point 2 (suppression) ; recadre le Point 3 (FK, pas propriété).
- **2026-07-23 — Point 1 (FK) : 🟢** réutilise `main.personne.coop_id → coop.user.id` (colonne
  existante, contrainte posée par Flyway/Entrepôt) ; relation Prisma modélisée côté coop.
- **2026-07-23 — Point 3 (i) : 🟢** la coop crée `main.personne` (find-or-create par `coop_id`) dans
  la MÊME transaction que la SA à l'inscription. Reste (ii) `est_active`, lié au Point 2.
- **2026-07-23 — Point 2 : 🟢 tranché.** `est_active` (employeuse courante) + `main.contrat`
  best-effort (dates). Abandon de `debut_emploi`/`fin_emploi` coop. Mesure : seuls 176/4429 users (4 %)
  multi-employeuses, dont 81 non-CN (1,8 %) non couverts par `contrat` → perte marginale assumée.
  Réécrire `getActeurEmploiForDate` sur main. Point 3-(ii) `est_active` maintenu par la coop → #1729.
- **2026-07-23 — Point 4 : 🟢 tranché.** FK coop → `main.SA` en **`RESTRICT`** (pas `SET NULL`). À
  poser dans le jeu de migrations final (pas de patch isolé de 6c, retravaillée par Points 1-2).
- **2026-07-23 — Point 5 : 🟢 tranché.** Lien lieu↔SA **uniquement** `nom+adresse+codeInsee` ; pas de
  correspondance = pas de lien. `main.lieu_inclusion_structure_administrative` = legacy non consommée.
  **Divergence avec #1707 à remonter à Philippe.**
- **2026-07-23 — Point 6 : 🟢 tranché.** Aucun changement sur `coop.lieu_inclusion` dans cette PR (SA
  uniquement). Lieux restent coop, MIN consommateur. #1724 = chantier futur séparé, aligné, non bloquant.
- **2026-07-23 — Point 7a : 🟢 différé.** Enums `entrepot/schema.prisma` = PR séparée (concerne les
  lieux, pas la SA). 7b grants = 🟢 différé (liste tombera du code à l'implémentation).
- **2026-07-23 — Point 3 (i)/angle mort : 🟢 pivot EMAIL.** Relier un user à `main.personne` : find par
  email → exister (poser `coop_id`) sinon créer. Email dans `personne.contact` jsonb / table `main.contact`.
- **2026-07-23 — Question #1705 : 🟢 répondue.** Prédicat de nettoyage = **même-table** (pas les deux) ;
  1031 SA + 912 LI nullés mais **tracés en CSV** + **rattrapage SIRET** fait → pas de perte permanente.
- **2026-07-23 — Réponse à Philippe POSTÉE** sur la PR #575
  (`inclusion-numerique/coop-mediation-numerique#575`, commentaire `5060028198`) : couvre Q1-Q5 + #1705
  + grants (`sonum`). Contient 2 questions ouvertes pour l'Entrepôt (création `main.personne` hors
  inscription-coop ; acter la divergence sur `lieu_inclusion_structure_administrative`).
- **2026-07-23 — ADR-002 mise à jour** : section « Révision 2026-07-23 — périmètre élargi » + précision
  RESTRICT/`sonum` sur la décision 1.
