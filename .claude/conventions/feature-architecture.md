# Feature Architecture — conventions canoniques (COOP médiation numérique)

> **Source de vérité unique et normative** pour migrer/écrire une feature au standard cible
> (inspiré ihexa, **adapté COOP** — voir §9). Extrait actionnable de `refactor/*.md`, des
> mémoires-feedback et de `CLAUDE.md`. Ces sources restent le « pourquoi » ; **ce fichier est le
> « quoi », citable règle par règle.**

## 0. Mode d'emploi (agents & skills)

- **Chaque règle a un ID stable** (`DM-3`, `AB-1`…). Cite-les ; ne paraphrase pas.
- **Sévérités** : `BLOCKER` (corriger avant commit) · `WARN` (corriger ou justifier explicitement) · `INFO` (préférence).
- **`convention-reviewer`** : note un diff et sort une ligne par violation :
  `‹ID› ‹SÉVÉRITÉ› ‹cible› — constat — correctif`, où `cible` = `path:line` (violation sur une ligne) **ou** `path/`/`dir/` (violation d'absence ou d'emplacement — fichier manquant, mauvais dossier). Jamais de `:line` inventé. Ne signale **jamais** ce qui est en §9 (divergences assumées). Sur un commit/range **historique**, juge l'état tel qu'introduit et le note dans `Périmètre relu`.
- **`domain-modeler`** : §2 est la checklist de conception à satisfaire **avant** d'écrire du code (rend un modèle à valider, pas du code).
- **`feature-auditor`** : parcourt §1–§7 dimension par dimension et produit la liste des résidus.
- **skill `/migrate-ability`** : §4 = structure à produire ; §8 = process ; §2/§3 = qualité.
- **Détection** : chaque règle porte un signal grep-able quand c'est possible (`rg` patterns). Un signal qui matche = candidat violation à confirmer en lecture, pas une certitude.

---

## 1. Architecture cible (AR) — arborescence & dépendances

Arbre canonique d'une feature :

```
features/<feature>/
├── domain/                      # PUR — 0 import infra, 0 import d'une autre feature
│   ├── <value-object>.ts        # defineModel + .brand() + smart constructor
│   ├── <entity>.ts              # entité (champs readonly, discriminated unions)
│   ├── <entity>.spec.ts         # tests unitaires domaine
│   ├── errors.ts                # erreurs métier typées
│   └── index.ts                 # barrel
├── abilities/<ability>/         # 1 cas d'usage = 1 dossier (voir §4)
├── db/                          # transfer layer Prisma ↔ domaine
│   ├── <entity>.transfer.ts
│   └── <entity>.transfer.spec.ts # round-trip
├── <feature>.cucumber.ts        # hooks Cucumber partagés (seed, Before/After)
└── index.ts                     # API publique de la feature
```

| ID   | Règle                                                                                                                                                                                          | Sévérité | Détection                                                                                                                  |
|------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|----------------------------------------------------------------------------------------------------------------------------|
| AR-1 | `domain/` n'importe **aucune** infra (`@prisma/client` runtime, `next/*`, `react`, fetch). Import **de type** Prisma toléré uniquement si justifié (ex. row shape d'un mapper).                | BLOCKER  | `rg "from '@prisma/client'" features/*/domain` (hors `import type`) ; `rg "from 'next/ \| from 'react'" features/*/domain` |
| AR-2 | Une feature n'importe **jamais** le `domain/` d'une autre feature. Cross-feature uniquement via l'`index.ts` (API publique) + port ACL local.                                                  | BLOCKER  | `rg "features/(?!<self>)[a-z-]+/domain" features/<self>`                                                                   |
| AR-3 | Référence à une entité d'une autre feature = **branded type local** + **port** dans son domaine + **adapteur** dans l'implémentation appelant l'`index.ts` de l'autre feature.                 | WARN     | revue manuelle                                                                                                             |
| AR-4 | Le code partagé entre 2 features vit dans `libraries/` (ou `shared/`), pas dans une feature.                                                                                                   | WARN     | —                                                                                                                          |
| AR-5 | Routes `app/**` = hubs minces : (1) auth, (2) input via value object/schema, (3) données via une **ability query** (jamais `prismaClient` brut), (4) rend **un** composant page de la feature. | BLOCKER  | `rg "prismaClient\." apps/web/src/app`                                                                                     |
| AR-6 | Calibrer l'effort DDD au sous-domaine : Core (`activite`, `beneficiaire`) = riche ; Supporting = modéré ; Generic/externe = ACL minimal. Ne pas over-engineer une feature simple.              | INFO     | —                                                                                                                          |

---

## 2. Domain modeling — checklist de conception (DM)

> **À satisfaire AVANT de coder le domaine** (le RETEX PR1 = 7 itérations évitées en appliquant ceci dès le départ). `domain-modeler` répond à chaque point et fait valider le modèle.

| ID      | Règle                                                                                                                                                                                                                                                                                                                                                                               | Sévérité | Détection                                                                                  |
|---------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|--------------------------------------------------------------------------------------------|
| DM-1    | **Tout primitif métier** = `defineModel(...)` + `.brand('Name')`. Y compris les **enums** (`defineModel(z.enum(...).brand('Name'))`). Aucun littéral string nu.                                                                                                                                                                                                                     | BLOCKER  | `rg ": string( \|$\|\))" features/*/domain` ; champs `string`/`number` nus dans une entité |
| DM-1bis | **Seuil de branding** (résout la tension DM-1 ↔ AR-6) : brander les primitifs **métier** (identifiants métier, quantités, codes, libellés porteurs de règles). **Ne pas** brander les **timestamps système** (`creation`/`modification` → `Date`) ni les ids d'infra sans invariant métier. En cas de doute : brander si le type a une **règle de validation** propre.              | INFO     | un `Date` système brandé ; une quantité métier (`number`) nue                              |
| DM-2    | Le **smart constructor** est le SEUL moyen de créer une instance. Jamais de `as` pour fabriquer une valeur.                                                                                                                                                                                                                                                                         | BLOCKER  | `rg " as [A-Z]" features` (hors `as const`)                                                |
| DM-3    | Chaque `\| null` doit être justifié. Si `null` cache un état → **discriminated union**.                                                                                                                                                                                                                                                                                             | BLOCKER  | `rg "\| null" features/*/domain` → vérifier sémantique                                     |
| DM-4    | Un **boolean qui partitionne** des champs → discriminated union (`anonyme: true/false`).                                                                                                                                                                                                                                                                                            | BLOCKER  | revue : booléen + champs conditionnels                                                     |
| DM-5    | **Deux champs encodant un seul état** → discriminated union (ex. `ContactTelephone`).                                                                                                                                                                                                                                                                                               | BLOCKER  | revue                                                                                      |
| DM-6    | `null` = une valeur d'enum → utiliser la **valeur par défaut** de l'enum, pas `null` (ex. `Genre('NonCommunique')`).                                                                                                                                                                                                                                                                | BLOCKER  | enum nullable dans une entité                                                              |
| DM-7    | Champs **toujours utilisés ensemble** → value object composite (ex. `CommuneResidence`).                                                                                                                                                                                                                                                                                            | WARN     | revue                                                                                      |
| DM-8    | Les **fonctions domaine** prennent des types **validés** (value objects), retournent des types validés, sont **pures** (0 effet, 0 import infra). Le parsing vit à la frontière.                                                                                                                                                                                                    | BLOCKER  | fonction domaine acceptant `string`/row Prisma                                             |
| DM-9    | Tous les champs d'entité sont `readonly`.                                                                                                                                                                                                                                                                                                                                           | WARN     | `rg "^\s+[a-zA-Z]+:" ` sans `readonly` dans un type entité                                 |
| DM-10   | **Transfer layer** (`db/`) : smart constructors Prisma→domaine (valide la DB) ; assignation naturelle domaine→Prisma (les branded types sont structurellement assignables) ; pas de `as`, pas de `!`, `?? defaultValue` + laisser le constructeur valider ; mapper `null ↔ NonCommunique`. **Round-trip test** obligatoire (domaine → fromDomain → toDomain = identité), min + max. | BLOCKER  | absence de `<entity>.transfer.spec.ts`                                                     |

> **Discriminants multiples (DM-4/DM-5).** Une entité réaliste en porte souvent plusieurs (ex. `anonyme` **et** `ContactTelephone` **et** synchro RDVSP). Choisir comme **discriminant racine** la partition la plus structurante (celle qui conditionne le plus de champs / la présence d'identité) ; modéliser les autres en **unions imbriquées** (value objects dédiés). Ne pas aplatir en une seule union géante, ni multiplier les discriminants racine.

---

## 3. Code style (CS) — partout

| ID   | Règle                                                                                                                                                                     | Sévérité | Détection                                        |
|------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|--------------------------------------------------|
| CS-1 | **Zéro `let`** — tout `const`.                                                                                                                                            | BLOCKER  | `rg "\blet \b" <diff>`                           |
| CS-2 | **Zéro `else`** — early returns, ternaires, pattern matching.                                                                                                             | WARN     | `rg "\} else" <diff>`                            |
| CS-3 | **Zéro `for`/`for...of`** — `map`/`filter`/`reduce`/`find`.                                                                                                               | WARN     | `rg "\bfor *\(" <diff>`                          |
| CS-4 | **Zéro mutation** — spread / méthodes fonctionnelles.                                                                                                                     | WARN     | `push(`, `splice(`, réassignation                |
| CS-5 | **Zéro `as`** (sauf `as const`) et **zéro `!`** (non-null).                                                                                                               | BLOCKER  | `rg " as [A-Z]\| as '\|!\." `                    |
| CS-6 | Tables de données déclaratives > cascades if/else.                                                                                                                        | INFO     | —                                                |
| CS-7 | Extraire pour **nommer** (le « quoi »), pas pour la taille.                                                                                                               | INFO     | —                                                |
| CS-8 | Helper pluriel : `libraries/pluriel` (Intl.PluralRules), **pas** `sPluriel`/`pluralize` (bug du 0 en français).                                                           | WARN     | `rg "sPluriel\|pluralize"`                       |
| CS-9 | Pas de variante **faiblement typée** en doublon d'un helper domaine. Extraire la règle commune en primitive basse-altitude ; le helper brandé y délègue (1 seule source). | WARN     | deux helpers même rôle, l'un à entrée `{a?, b?}` |

> Note : `tsc` n'attrape pas tout (ex. frontière client/serveur d'un barrel `libraries/data-table` casse en build prod) → vérifier `pnpm -F web build` en cas de doute sur les barils mixtes ; les hooks portent `'use client'`.

---

## 4. Structure d'une ability (AB)

```
abilities/<ability>/
├── <ability>.ability.md         # Gherkin (BDD) — voir §7
├── <ability>.steps.ts           # steps Cucumber
├── action/                      # UNIQUEMENT si l'ability a une server action (mutation)
│   ├── <ability>.validation.ts  # schéma Zod de l'input (form/wire shape)
│   ├── <ability>.errors.ts      # map erreur domaine → message
│   └── <ability>.key.ts         # DI key (si binding)
├── domain/                      # si logique métier propre à l'ability
│   ├── <ability>.ts             # signatures de port (types) + logique pure
│   ├── <ability>.spec.ts        # unit si logique pure isolable
│   └── index.ts
├── implementation/
│   ├── prisma/
│   │   ├── <ability>.query.ts   # lecture (SELECT, owner-scoped)
│   │   ├── <ability>.mutation.ts# écriture
│   │   └── index.ts
│   └── index.ts
├── ui/                          # composants présentationnels (voir §6)
│   ├── components/ · pages/
│   └── *.presenter.ts           # mise en forme domaine → props (pure)
└── index.ts                     # API publique de l'ability
```

| ID   | Règle                                                                                                                                                                  | Sévérité | Détection                                                     |
|------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|---------------------------------------------------------------|
| AB-1 | Ability **avec server action** → contrats groupés dans `action/` (`validation` + `errors` [+ `key`]). Ability **query/pure** → **pas** de dossier `action/`.           | BLOCKER  | `validation.ts` à la racine de l'ability au lieu de `action/` |
| AB-2 | Modèle d'input **partagé** entre abilities → vit dans `features/<feature>/domain/` (pas dans une ability). Une ability n'importe pas le `domain/` d'une autre ability. | BLOCKER  | `rg "abilities/<other>/" abilities/<self>`                    |
| AB-3 | La query/mutation Prisma est **owner-scopée** (`where: { …, mediateurId, suppression: null }`).                                                                        | BLOCKER  | mutation/query sans filtre propriétaire                       |
| AB-4 | Le branding (smart constructors) vit dans l'ability **propriétaire** ; le hub passe des ids, pas des entités brandées d'une autre ability.                             | WARN     | hub qui brande pour le compte d'une autre ability             |
| AB-5 | Erreurs retournées en `Result<T, E>` discriminé (pas de `throw` métier).                                                                                               | WARN     | `throw new` dans une mutation/query                           |
| AB-6 | Barrels (`index.ts`) exposent l'API publique ; les consommateurs importent le barrel, pas les fichiers internes.                                                       | INFO     | —                                                             |

---

## 5. Isolation (IS)

| ID   | Règle                                                                                                                                                               | Sévérité | Source                                 |
|------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|----------------------------------------|
| IS-1 | **Pas de dépendance inter-ability** dans une même feature : duplication découplée > couplage. Code partagé → 3 stratégies : feature-level domain, ou library.       | BLOCKER  | `feedback_no_cross_ability_dependency` |
| IS-2 | **Pas de dépendance inter-feature** au niveau `domain/` (cf. AR-2/AR-3, port ACL).                                                                                  | BLOCKER  | idem                                   |
| IS-3 | Quand on **déplace** du code consommé ailleurs : grep **aussi** `packages/` (pas que `apps/web/src`), repointer **tous** les consommateurs (specs relatifs inclus). | BLOCKER  | build cassé post-move                  |

---

## 6. UI (UI)

| ID   | Règle                                                                                                                                                                                                                                                                    | Sévérité | Détection                                                        |
|------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|------------------------------------------------------------------|
| UI-1 | **Pas de composant dans `src/app`** : `app` = routes qui orchestrent et appellent **un** composant page de la feature. Présentationnels dans `features/*/ui`. Concerns croisés injectés en slots par la route-hub.                                                       | BLOCKER  | `.tsx` présentationnel sous `app/**`                             |
| UI-2 | **Pas de `*.module.css`** : convertir en utilitaires DSFR (`fr-flex`, `fr-mb-8v`, `fr-sr-only`…). Seul le non-tokenisable (pixel-perfect, override global) va dans `styles/components/*.css`. Ne pas déplacer un module.css tel quel.                                    | BLOCKER  | `rg "\.module\.(css\|scss)" features`                            |
| UI-3 | Formulaires : **TanStack Form** via `libs/form` (`useAppForm`), **pas** react-hook-form. `import type { DefaultValues } from 'react-hook-form'` toléré. Mapping : `watch`→`useStore`, `setValue`→listeners de champ, inputs→`field.*`. Validation `validators.onSubmit`. | BLOCKER  | `rg "useForm\|Controller\|zodResolver\|useFormContext" features` |
| UI-4 | Mise en forme domaine→props dans un **presenter pur** (`*.presenter.ts`), pas dans le composant ni la route.                                                                                                                                                             | WARN     | logique de shaping dans `.tsx`/route                             |
| UI-5 | Input requis : marquer via `<RedAsterisk />` dans le label (DsfrInput n'a pas de prop `asterisk`).                                                                                                                                                                       | INFO     | —                                                                |
| UI-6 | Champ numérique optionnel : ramener `''→null` (listener) ; l'adaptateur `Input` affiche vide pour une valeur absente.                                                                                                                                                    | INFO     | —                                                                |

---

## 7. Tests (TS)

| ID   | Règle                                                                                                                                                                                                                                                            | Sévérité | Détection                                                                         |
|------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|-----------------------------------------------------------------------------------|
| TS-1 | **BDD sur CHAQUE ability** : `<ability>.ability.md` (Gherkin) + `<ability>.steps.ts`. C'est l'acceptation **et** le test d'intégration (DB réelle via Cucumber).                                                                                                 | BLOCKER  | ability sans `.ability.md`                                                        |
| TS-2 | **Unit `.spec.ts` UNIQUEMENT là où il y a une logique pure isolable** (value object, règle métier, presenter). Query/projection sans logique → BDD seul (ne pas ajouter de spec vide).                                                                           | WARN     | spec ne testant qu'un objet littéral                                              |
| TS-3 | Fixtures via **smart constructors**, jamais `as Type`.                                                                                                                                                                                                           | BLOCKER  | `as` dans une fixture                                                             |
| TS-4 | Round-trip sur le transfer layer (cf. DM-10).                                                                                                                                                                                                                    | BLOCKER  | —                                                                                 |
| TS-5 | Steps Cucumber **globaux** : phrasés **uniques** entre fichiers (collision = `AmbiguousStepDefinition`). Hooks partagés dans `<feature>.cucumber.ts`. Lancer la suite entière (`pnpm -F web test:cucumber`, DB 5433) — le scope par chemin en arg ne marche pas. | WARN     | deux `Given/When/Then` même texte                                                 |
| TS-6 | **Piège exceljs sous Cucumber (tsx/esm)** : un builder de classeur doit utiliser `import Excel from 'exceljs'; new Excel.Workbook()` (import **par défaut**). `import * as Excel` / `{ Workbook }` cassent sous tsx/esm.                                         | WARN     | `rg "import \* as Excel\|import \{ Workbook \}" ` dans un fichier couvert par BDD |
| TS-7 | Intégration locale : capper `DATABASE_URL` avec `&connection_limit=3` (sinon « too many clients »).                                                                                                                                                              | INFO     | —                                                                                 |

---

## 8. Process & discipline (PR)

| ID   | Règle                                                                                                                                                                                                       | Sévérité |
|------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| PR-1 | **Un incrément = une PR/commit** focalisé sur **un** cas d'usage. Déployable, ne casse pas la prod, tests existants verts.                                                                                  | BLOCKER  |
| PR-2 | **Design-first** : présenter le plan/modèle et **attendre** la validation avant d'éditer (ask before acting). Sur une décision à plusieurs options valides → question ciblée, pas de supposition.           | BLOCKER  |
| PR-3 | **Verify-before-delete** : ne rien supprimer sans avoir vérifié qu'un remplaçant existe **ET** est câblé. Regarder la cible avant d'écraser.                                                                | BLOCKER  |
| PR-4 | Séquence de gate **avant chaque commit** : `pnpm -F web tsc` → `pnpm biome check --write <fichiers>` → tests ciblés (`test` / `test:integration` / `test:cucumber`) → commit.                               | BLOCKER  |
| PR-5 | **JAMAIS `git add -A`** (stage des `scripts/`, fichiers jetables → casse lint-staged). Toujours stager des **chemins précis** `apps/web/...`.                                                               | BLOCKER  |
| PR-6 | Commits **Conventional Commits** : `type(scope)?: description` au présent ; corps = le **pourquoi** + le quoi en termes d'archi (pas la liste de fichiers). Types : `refactor`/`fix`/`test`/`feat`/`chore`. | WARN     |
| PR-7 | Migration **verticale, ability par ability** ; coexistence ancien/nouveau pendant la transition ; supprimer l'ancien code quand toutes les abilities sont migrées.                                          | INFO     |
| PR-8 | Si gpg `signing failed` (pinentry) : ne pas contourner ; l'utilisateur déverrouille puis « recommence le commit » (rejouer le même `git commit`).                                                           | INFO     |
| PR-9 | Laisser mourir naturellement un vieux helper lâche avec les refactos progressives ; **ne pas** forcer une passe transverse prématurée.                                                                      | WARN     |

---

## 9. Divergences ASSUMÉES vs ihexa — NE PAS signaler comme violations (DV)

> ihexa est la **référence d'inspiration**, pas la cible littérale. Ces écarts sont **décidés** (cf. `refactor/01`, `02`). Un agent ne doit **jamais** les flaguer.

| ID   | COOP                                           | ihexa                                              | Pourquoi                                                                       |
|------|------------------------------------------------|----------------------------------------------------|--------------------------------------------------------------------------------|
| DV-1 | **Zod** + branded types                        | Effect `Schema`                                    | Plus léger, familier équipe React                                              |
| DV-2 | `implementation/prisma/`                       | `implementations/{in-memory,drizzle}` swap par ENV | Pas de multi-implémentation ; Cucumber tape la **DB réelle** (pas d'in-memory) |
| DV-3 | `.ability.md` (Gherkin markdown)               | idem                                               | (le repo l'utilise — **pas** `.feature`)                                       |
| DV-4 | Routes orchestrent directement                 | `pageBuilder()` middleware                         | Adopté progressivement, pas requis                                             |
| DV-5 | DI `piqure` adoptée **progressivement**        | DI systématique                                    | Incrémental                                                                    |
| DV-6 | Pas (encore) de mapping erreur→clé i18n        | `errors.ts` → i18n                                 | À venir, non bloquant                                                          |
| DV-7 | Jest (`.spec.ts`/`.integration.ts`) + Cucumber | Vitest + Cucumber only                             | Existant ; `.integration.ts` est une convention COOP valide                    |

---

## 10. Ce sur quoi il faut insister (index condensé → règles)

> Vue « radar » pour `convention-reviewer` : les retours récurrents, pointant vers la règle.

- Modèle domaine complet **dès le départ** → §2 (DM-1…10). *Le plus gros levier (RETEX = 7 itérations).*
- Contrats d'ability dans `action/` ; input partagé en `domain/` de feature → AB-1, AB-2.
- Aucune dépendance inter-ability/feature ; duplication découplée > couplage → IS-1, IS-2.
- Vérifier le remplaçant **avant** suppression → PR-3.
- Pas de composant dans `app` ; module.css→DSFR (pas de déplacement tel quel) → UI-1, UI-2.
- Pas de helper faiblement typé en doublon (primitive partagée) → CS-9.
- Nommage : préfixes au **minimum** (instancier ≠ créer ; `beneficiaireListItem` pas `createABeneficiaire`) ; préfixe seulement s'il porte une info (`seed/to/from/with`) → (nommage).
- BDD = intégration sur chaque ability ; unit seulement si logique pure → TS-1, TS-2.
- Jamais `git add -A` ; gate avant commit ; présenter le plan puis attendre → PR-2, PR-4, PR-5.

---

### Maintenance de ce fichier
Quand un nouveau retour récurrent apparaît : ajouter une règle **avec ID** dans la bonne section + une ligne dans §10, et (si pertinent) une mémoire-feedback liée. Garder les entrées **terses et détectables**.
